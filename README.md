# TF.js Minimal Webcam Demo

A bare-bones page that loads a TensorFlow.js model, starts the webcam, and streams live class index predictions.

## Setup
1. Place your exported TF.js files inside the `tfjs_model/` folder:
   - `tfjs_model/model.json` (rename from `model (1).json` if needed)
   - `tfjs_model/group1-shard1of3.bin`
   - `tfjs_model/group1-shard2of3.bin`
   - `tfjs_model/group1-shard3of3.bin`
   
   > Tip: the app now checks a few common locations for the model (e.g., `./tfjs_model/model.json`, `../tfjs_model/model.json`).
   > This helps when serving the page from a subfolder while keeping the model files one level up.
2. Open `index.html` in your browser.
3. Click **Load model & start camera** to begin streaming predictions.

If you see a 404 or "Model file not found" error when loading the model, confirm that:
- The files live inside `tfjs_model/` (next to `index.html`). The app explicitly requests `tfjs_model/model.json`, so a typo like `mode.json` will fail.
- The main JSON file is exactly `model.json` (no extra suffixes).
- You are serving the folder over HTTP (for example, `python3 -m http.server 8000`) so the browser can fetch the files.

The page uses TensorFlow.js `4.22.0` from the CDN. If that version is unavailable, swap the script tag to `@latest` instead.
