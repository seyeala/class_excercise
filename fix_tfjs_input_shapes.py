"""
Backward-compatible wrapper for the package CLI.

This file allows running `python fix_tfjs_input_shapes.py` directly
while delegating to the installable module implementation.
"""

from pathlib import Path
import sys

# Ensure the in-repo package is importable when the project has not been
# installed yet.
REPO_SRC = Path(__file__).resolve().parent / "src"
if REPO_SRC.exists():
  sys.path.insert(0, str(REPO_SRC))

from class_excercise.fix_tfjs_input_shapes import main


if __name__ == "__main__":
  main()
