"""
Utilities to patch TensorFlow.js model exports.

This module exposes :func:`main` as a console entry point so the
post-processing script can be installed as a CLI.
"""

from __future__ import annotations

import json
from pathlib import Path

MODEL_JSON_PATH = Path("tfjs_model") / "model.json"


def _fix_input_layers(layer_list):
  """
  Recursively walk through Keras layer configs and, for each InputLayer,
  copy config['batch_shape'] -> config['batch_input_shape'] if needed.
  """
  if not isinstance(layer_list, list):
    return

  for layer in layer_list:
    if not isinstance(layer, dict):
      continue

    class_name = layer.get("class_name")
    config = layer.get("config", {})

    # Fix top-level InputLayer configs
    if class_name == "InputLayer" and isinstance(config, dict):
      if "batch_shape" in config and "batch_input_shape" not in config:
        config["batch_input_shape"] = config["batch_shape"]

    # Recurse into nested models (e.g. Functional submodels)
    nested_layers = None

    if isinstance(config, dict) and "layers" in config:
      nested_layers = config["layers"]

    if nested_layers is not None:
      _fix_input_layers(nested_layers)


def main():
  """Patch missing ``batch_input_shape`` keys in exported model JSON."""
  if not MODEL_JSON_PATH.exists():
    raise SystemExit(
      f"Could not find {MODEL_JSON_PATH} – export the TF.js model first "
      "with tfjs.converters.save_keras_model(model, 'tfjs_model')."
    )

  with MODEL_JSON_PATH.open("r", encoding="utf-8") as f:
    data = json.load(f)

  try:
    model_config = data["modelTopology"]["model_config"]
    config = model_config["config"]
    layers = config["layers"]
  except KeyError as e:
    raise SystemExit(f"Unexpected model.json structure, missing key: {e!r}")

  # Fix all InputLayers, including those inside nested Functional models
  _fix_input_layers(layers)

  with MODEL_JSON_PATH.open("w", encoding="utf-8") as f:
    json.dump(data, f)

  print(f"Patched InputLayer shapes in {MODEL_JSON_PATH}")


if __name__ == "__main__":
  main()
