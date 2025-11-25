const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');

const scriptPath = path.join(process.cwd(), 'script.js');

function buildDom() {
  const listeners = {};

  const makeElement = (id) => {
    const element = {
      id,
      textContent: id === 'status' ? 'Idle' : '-',
      srcObject: null,
      style: {},
      playCalled: false,
      onloadedmetadata: null,
      addEventListener: (event, handler) => {
        listeners[event] = handler;
      },
      dispatchEvent: (event) => {
        if (listeners[event]) listeners[event]({});
      },
      play() {
        // Mimic the HTMLVideoElement API surface we need.
        this.playCalled = true;
      },
    };

    return element;
  };

  const status = makeElement('status');
  const prediction = makeElement('prediction');
  const webcam = makeElement('webcam');
  const startBtn = makeElement('start-btn');
  const modelUrl = { ...makeElement('model-url'), value: '/tfjs_model/model.json' };

  const elements = {
    'status': status,
    'prediction': prediction,
    'webcam': webcam,
    'start-btn': startBtn,
    'model-url': modelUrl,
  };

  global.document = {
    getElementById: (id) => elements[id],
  };

  global.window = {
    location: { href: 'http://localhost/' },
  };

  global.navigator = {
    mediaDevices: {
      getUserMedia: () => Promise.resolve({ label: 'fake-stream' }),
    },
  };

  global.requestAnimationFrame = () => {};

  return { status, prediction, webcam, startBtn };
}

test('validateManifest enforces weightsManifest shape', async () => {
  const { status } = buildDom();
  delete require.cache[require.resolve(scriptPath)];
  const app = require(scriptPath);

  const valid = { weightsManifest: [{ paths: ['group1-shard1of1.bin'] }] };
  assert.equal(app.validateManifest(valid, './tfjs_model/model.json'), null);

  const missing = {};
  assert.match(
    app.validateManifest(missing, './tfjs_model/model.json'),
    /missing a weightsManifest array/i,
  );

  status.textContent = 'reset';
  app.resetTestHooks();
});

test('start() uses injected hooks and guards duplicate calls', async () => {
  const { status, prediction } = buildDom();
  delete require.cache[require.resolve(scriptPath)];
  const app = require(scriptPath);

  let loadModelCalls = 0;
  let setupCameraCalls = 0;
  let predictCalls = 0;

  const fakeHooks = {
    loadModel: async () => {
      loadModelCalls += 1;
      status.textContent = 'Loading model...';
    },
    setupCamera: async () => {
      setupCameraCalls += 1;
      status.textContent = 'Camera ready. Running predictions...';
    },
    predictLoop: () => {
      predictCalls += 1;
      prediction.textContent = 'class_0';
    },
  };

  app.setTestHooks(fakeHooks);
  await app.start();
  await app.start(); // should be ignored because running stays true

  assert.equal(loadModelCalls, 1);
  assert.equal(setupCameraCalls, 1);
  assert.equal(predictCalls, 1);
  assert.equal(status.textContent, 'Camera ready. Running predictions...');
  assert.equal(prediction.textContent, 'class_0');

  app.resetTestHooks();
});

test('start() can run with default hooks using a stubbed tf model', async () => {
  const { status, prediction, webcam } = buildDom();
  delete require.cache[require.resolve(scriptPath)];

  const fromPixelsCalls = [];
  const predictInputs = [];
  const modelLoadUrls = [];

  const fakeTensor = {
    resizeBilinear: () => fakeTensor,
    toFloat: () => fakeTensor,
    expandDims: () => fakeTensor,
  };

  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ weightsManifest: [{ paths: ['group1-shard1of1.bin'] }] }),
  });

  global.navigator = {
    mediaDevices: {
      getUserMedia: () => Promise.resolve({ label: 'stub-stream' }),
    },
  };

  global.tf = {
    tidy: (fn) => fn(),
    browser: {
      fromPixels: (el) => {
        fromPixelsCalls.push(el);
        return fakeTensor;
      },
    },
    loadLayersModel: async (url) => {
      modelLoadUrls.push(url);
      return {
        predict: (input) => {
          predictInputs.push(input);
          return { dataSync: () => [0.1, 0.9] };
        },
      };
    },
  };

  const app = require(scriptPath);

  app.setTestHooks({
    setupCamera: async () => {
      status.textContent = 'Camera ready. Running predictions...';
    },
  });

  const startPromise = app.start();
  await startPromise;

  assert.equal(status.textContent, 'Camera ready. Running predictions...');
  assert.equal(prediction.textContent, 'class_1');

  assert.deepEqual(modelLoadUrls, ['http://localhost/tfjs_model/model.json']);
  assert.equal(fromPixelsCalls[0], webcam);
  assert.equal(predictInputs.length, 1);

  app.resetTestHooks();
  delete global.tf;
  delete global.fetch;
});
