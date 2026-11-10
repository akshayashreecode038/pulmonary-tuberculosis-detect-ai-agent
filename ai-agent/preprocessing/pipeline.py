"""Centralized preprocessing pipeline for TB Detection AI Agent.
Guarantees exact parity between training, validation, and inference.
"""

from typing import Tuple, Union
from PIL import Image
import numpy as np
import cv2
import torch
from torchvision import transforms


IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


class PreprocessPipeline:
    """Standardized preprocessing pipeline for chest radiographs."""

    def __init__(
        self,
        image_size: int = 224,
        clahe_enabled: bool = False,
        clahe_clip_limit: float = 2.0,
        clahe_tile_grid: int = 8,
        mean: list[float] | None = None,
        std: list[float] | None = None
    ):
        self.image_size = image_size
        self.clahe_enabled = clahe_enabled
        self.clahe_clip_limit = clahe_clip_limit
        self.clahe_tile_grid = clahe_tile_grid
        self.mean = mean or IMAGENET_MEAN
        self.std = std or IMAGENET_STD

        # Standard PyTorch normalization transform
        self.normalize_transform = transforms.Normalize(
            mean=self.mean,
            std=self.std
        )

    def apply_clahe(self, img_np: np.ndarray) -> np.ndarray:
        """Applies Contrast Limited Adaptive Histogram Equalization to enhance lung parenchymal opacities."""
        clahe = cv2.createCLAHE(
            clipLimit=self.clahe_clip_limit,
            tileGridSize=(self.clahe_tile_grid, self.clahe_tile_grid)
        )
        if len(img_np.shape) == 2:
            return clahe.apply(img_np)
        elif img_np.shape[2] == 1:
            return clahe.apply(img_np[:, :, 0])[:, :, np.newaxis]
        else:
            # Convert to LAB, apply CLAHE on L-channel
            lab = cv2.cvtColor(img_np, cv2.COLOR_RGB2LAB)
            lab[:, :, 0] = clahe.apply(lab[:, :, 0])
            return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)

    def preprocess_pil(
        self,
        image: Image.Image,
        apply_clahe_override: bool | None = None
    ) -> Tuple[torch.Tensor, np.ndarray]:
        """Preprocesses a PIL Image into a normalized float32 PyTorch tensor (1, 3, H, W)
        and returns the resized unnormalized RGB array (H, W, 3) for visualization.
        """
        # Ensure 3-channel RGB representation
        if image.mode != "RGB":
            image = image.convert("RGB")

        # Resize using high-quality bilinear sampling
        resized_pil = image.resize((self.image_size, self.image_size), Image.Resampling.BILINEAR)
        rgb_np = np.array(resized_pil, dtype=np.uint8)

        use_clahe = self.clahe_enabled if apply_clahe_override is None else apply_clahe_override
        if use_clahe:
            rgb_np = self.apply_clahe(rgb_np)

        # Scale pixels from [0, 255] to [0.0, 1.0]
        tensor = torch.from_numpy(rgb_np).float() / 255.0
        # Reorder dimensions from (H, W, C) to (C, H, W)
        tensor = tensor.permute(2, 0, 1)

        # Apply ImageNet normalization
        normalized_tensor = self.normalize_transform(tensor)

        # Add batch dimension: (1, 3, H, W)
        batched_tensor = normalized_tensor.unsqueeze(0)

        return batched_tensor, rgb_np

    def denormalize(self, tensor: torch.Tensor) -> np.ndarray:
        """Reverses normalization to convert (3, H, W) tensor back to (H, W, 3) uint8 image for display."""
        t = tensor.clone().detach().cpu()
        if t.dim() == 4:
            t = t.squeeze(0)

        mean = torch.tensor(self.mean).view(3, 1, 1)
        std = torch.tensor(self.std).view(3, 1, 1)
        t = t * std + mean
        t = torch.clamp(t, 0.0, 1.0)
        t = (t.permute(1, 2, 0).numpy() * 255.0).astype(np.uint8)
        return t


# Singleton default pipeline
default_pipeline = PreprocessPipeline()
