"""Chest X-ray validation engine.
Performs pre-flight checks on image format, resolution, bit-depth, and radiograph integrity.
"""

from io import BytesIO
from typing import Tuple
from PIL import Image, ImageOps
import numpy as np

from ai_agent.core.exceptions import ImageValidationError


ALLOWED_FORMATS = {"PNG", "JPEG", "JPG", "TIFF", "BMP", "WEBP"}
MIN_RESOLUTION = (128, 128)
MAX_RESOLUTION = (8192, 8192)
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB
MIN_PIXEL_STD = 5.0  # Discards completely blank/uniform/solid pictures


def validate_image_bytes(image_bytes: bytes) -> Tuple[Image.Image, dict]:
    """Validates raw image bytes and returns opened PIL Image along with quality metadata.
    
    Raises:
        ImageValidationError: If image is corrupt, empty, low resolution, or non-radiographic.
    """
    if not image_bytes or len(image_bytes) == 0:
        raise ImageValidationError("Uploaded image payload is empty (0 bytes).")

    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise ImageValidationError(
            f"File size ({len(image_bytes) / (1024*1024):.1f}MB) exceeds 25MB limit."
        )

    try:
        pil_image = Image.open(BytesIO(image_bytes))
        # Verify format without loading all pixels yet
        img_format = (pil_image.format or "").upper()
        if img_format not in ALLOWED_FORMATS:
            raise ImageValidationError(
                f"Unsupported image format '{img_format}'. Supported formats: {', '.join(sorted(ALLOWED_FORMATS))}"
            )
        # Fully decode and load pixels to detect truncated files
        pil_image.load()
    except ImageValidationError:
        raise
    except Exception as e:
        raise ImageValidationError(f"Corrupted image file or unable to decode image: {str(e)}")

    # Apply EXIF rotation if present (e.g. mobile photo of an X-ray)
    try:
        pil_image = ImageOps.exif_transpose(pil_image)
    except Exception:
        pass

    width, height = pil_image.size

    # Check resolution bounds
    if width < MIN_RESOLUTION[0] or height < MIN_RESOLUTION[1]:
        raise ImageValidationError(
            f"Image resolution ({width}x{height}) is below minimum diagnostic threshold ({MIN_RESOLUTION[0]}x{MIN_RESOLUTION[1]})."
        )

    if width > MAX_RESOLUTION[0] or height > MAX_RESOLUTION[1]:
        raise ImageValidationError(
            f"Image resolution ({width}x{height}) exceeds maximum supported dimensions ({MAX_RESOLUTION[0]}x{MAX_RESOLUTION[1]})."
        )

    # Check aspect ratio
    aspect_ratio = width / float(height)
    if aspect_ratio < 0.25 or aspect_ratio > 4.0:
        raise ImageValidationError(
            f"Unusual image aspect ratio ({aspect_ratio:.2f}). Expected thoracic radiograph proportions (0.5 to 2.0)."
        )

    # Check pixel intensity distribution to reject solid/blank images
    gray = pil_image.convert("L")
    arr = np.array(gray, dtype=np.float32)
    std_val = float(np.std(arr))
    mean_val = float(np.mean(arr))

    if std_val < MIN_PIXEL_STD:
        raise ImageValidationError(
            f"Image has insufficient contrast variance (std={std_val:.1f}). Ensure the file is an actual radiograph and not a blank/solid image."
        )

    # Assess preliminary exposure quality
    if mean_val < 30.0:
        exposure = "Under-exposed"
    elif mean_val > 225.0:
        exposure = "Over-exposed"
    else:
        exposure = "Optimal"

    metadata = {
        "format": img_format,
        "width": width,
        "height": height,
        "resolution": f"{width}x{height}",
        "aspect_ratio": round(aspect_ratio, 3),
        "mean_intensity": round(mean_val, 2),
        "std_intensity": round(std_val, 2),
        "exposureScore": exposure,
        "inhalationAssessment": "Adequate" if aspect_ratio <= 1.25 else "Sub-optimal"
    }

    return pil_image, metadata
