const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const htmlPath = path.join(process.cwd(), 'index.html');

test('index.html exposes the expected controls', () => {
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert.match(html, /<button[^>]*id="start-btn"/i, 'start button id should be start-btn');
  assert.match(html, /<div[^>]*id="status"/i, 'status container is present');
  assert.match(html, /<video[^>]*id="webcam"/i, 'webcam video element is present');
  assert.match(html, /<span[^>]*id="prediction"/i, 'prediction span is present');
  assert.match(html, /script src="https:\/\/cdn\.jsdelivr\.net\/npm\/\@tensorflow\/tfjs@4\.22\.0\/dist\/tf\.min\.js"/i, 'TensorFlow.js CDN is referenced');
  assert.match(html, /script src="script\.js"/i, 'local app script is referenced');
});
