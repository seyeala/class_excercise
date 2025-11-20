# TF.js Minimal Webcam Demo

A bare-bones page that loads a TensorFlow.js model, starts the webcam, and streams live class index predictions.

## Setup
1. Place your exported TF.js files inside the `tfjs_model/` folder:
   - `tfjs_model/model.json` (rename from `model (1).json` if needed)
   - `tfjs_model/group1-shard1of3.bin`
   - `tfjs_model/group1-shard2of3.bin`
   - `tfjs_model/group1-shard3of3.bin`
2. Open `index.html` in your browser.
3. Click **Load model & start camera** to begin streaming predictions.

The page uses TensorFlow.js `4.22.0` from the CDN. If that version is unavailable, swap the script tag to `@latest` instead.
