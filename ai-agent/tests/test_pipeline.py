"""Unit tests for centralized preprocessing pipeline."""

import numpy as np
from PIL import Image
import torch

from ai_agent.preprocessing.pipeline import PreprocessPipeline, default_pipeline


def test_preprocess_pipeline_tensor_shape():
    img = Image.new("RGB", (320, 400), color=(100, 100, 100))
    pipeline = PreprocessPipeline(image_size=224)
    tensor, rgb_np = pipeline.preprocess_pil(img)

    assert tensor.shape == (1, 3, 224, 224)
    assert tensor.dtype == torch.float32
    assert rgb_np.shape == (224, 224, 3)


def test_clahe_preprocessing():
    # Grayscale image with low contrast
    arr = np.random.randint(50, 80, (256, 256), dtype=np.uint8)
    img = Image.fromarray(arr).convert("RGB")
    pipeline = PreprocessPipeline(image_size=224, clahe_enabled=True)
    tensor, rgb_np = pipeline.preprocess_pil(img)

    assert tensor.shape == (1, 3, 224, 224)
    assert rgb_np.shape == (224, 224, 3)


def test_denormalization():
    pipeline = PreprocessPipeline(image_size=224)
    img = Image.new("RGB", (224, 224), color=(150, 150, 150))
    tensor, _ = pipeline.preprocess_pil(img)
    denorm_img = pipeline.denormalize(tensor)

    assert denorm_img.shape == (224, 224, 3)
    assert denorm_img.dtype == np.uint8
    # Values should be roughly around original gray level ~150
    assert np.allclose(np.mean(denorm_img), 150, atol=20)
