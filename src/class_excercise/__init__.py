"""Utilities for working with exported TensorFlow.js models."""

__all__ = ["main"]

from .fix_tfjs_input_shapes import main  # noqa: F401
