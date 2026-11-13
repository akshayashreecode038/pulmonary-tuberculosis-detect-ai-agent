"""Unit tests for chest X-ray image validation."""

import pytest
import numpy as np
from PIL import Image
from io import BytesIO

from ai_agent.preprocessing.validation import validate_image_bytes
from ai_agent.core.exceptions import ImageValidationError


def create_test_image_bytes(size=(256, 256), color="grayscale_pattern", fmt="PNG") -> bytes:
    buf = BytesIO()
    if color == "solid_black":
        img = Image.new("L", size, color=0)
    elif color == "solid_white":
        img = Image.new("L", size, color=255)
    elif color == "grayscale_pattern":
        # Realistic gradient pattern
        arr = np.linspace(0, 255, size[0] * size[1], dtype=np.uint8).reshape(size)
        img = Image.fromarray(arr)
    else:
        img = Image.new("RGB", size, color=(128, 128, 128))
    img.save(buf, format=fmt)
    return buf.getvalue()


def test_empty_bytes_raises_error():
    with pytest.raises(ImageValidationError, match="empty"):
        validate_image_bytes(b"")


def test_corrupt_bytes_raises_error():
    with pytest.raises(ImageValidationError, match="Corrupted image file"):
        validate_image_bytes(b"NOT_AN_IMAGE_DATA_CORRUPT")


def test_too_small_resolution_raises_error():
    tiny_bytes = create_test_image_bytes(size=(64, 64))
    with pytest.raises(ImageValidationError, match="below minimum diagnostic threshold"):
        validate_image_bytes(tiny_bytes)


def test_solid_blank_image_raises_error():
    solid_bytes = create_test_image_bytes(size=(256, 256), color="solid_black")
    with pytest.raises(ImageValidationError, match="insufficient contrast variance"):
        validate_image_bytes(solid_bytes)


def test_valid_radiograph_passes_validation():
    valid_bytes = create_test_image_bytes(size=(300, 300), color="grayscale_pattern")
    img, meta = validate_image_bytes(valid_bytes)
    assert img is not None
    assert meta["resolution"] == "300x300"
    assert "exposureScore" in meta
    assert meta["exposureScore"] in ["Optimal", "Under-exposed", "Over-exposed"]
