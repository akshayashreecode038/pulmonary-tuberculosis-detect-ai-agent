"""Grad-CAM (Gradient-weighted Class Activation Mapping) explainability engine.
Generates visual heatmaps and localized lung zone coordinate hotspots for clinician interpretability.
"""

from io import BytesIO
import base64
from typing import List, Tuple, Dict, Any
import numpy as np
import cv2
import torch
import torch.nn as nn
from PIL import Image

from ai_agent.models.architecture import TBClassifier


class GradCAM:
    """Computes Grad-CAM saliency heatmaps for chest radiograph classification."""

    def __init__(self, model: TBClassifier, target_layer: nn.Module | None = None):
        self.model = model
        self.target_layer = target_layer or model.target_cam_layer

        self.activations: torch.Tensor | None = None
        self.gradients: torch.Tensor | None = None
        self.hooks: list = []
        self._register_hooks()

    def _register_hooks(self):
        def forward_hook(module, input, output):
            self.activations = output.detach()

        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()

        h1 = self.target_layer.register_forward_hook(forward_hook)
        h2 = self.target_layer.register_full_backward_hook(backward_hook)
        self.hooks.extend([h1, h2])

    def remove_hooks(self):
        for h in self.hooks:
            h.remove()
        self.hooks.clear()

    def generate_heatmap(
        self,
        input_tensor: torch.Tensor,
        target_class: int = 0
    ) -> np.ndarray:
        """Runs forward and backward pass to compute 2D normalized Grad-CAM heatmap [0.0, 1.0]."""
        self.model.eval()
        self.activations = None
        self.gradients = None

        # Ensure tensor requires gradient
        tensor_in = input_tensor.clone().detach().requires_grad_(True)
        logits = self.model(tensor_in)

        # Logit for binary classification
        score = logits[0, target_class] if logits.shape[-1] > 1 else logits[0, 0]

        self.model.zero_grad()
        score.backward(retain_graph=True)

        if self.activations is None or self.gradients is None:
            # Fallback uniform zero map if hooks failed
            return np.zeros((input_tensor.shape[2], input_tensor.shape[3]), dtype=np.float32)

        # Global average pooling of gradients: weights shape (C,)
        weights = torch.mean(self.gradients, dim=(2, 3), keepdim=True)
        # Weighted combination of forward activation maps
        cam = torch.sum(weights * self.activations, dim=1).squeeze(0)
        # ReLU rectification: only features that positively correlate with TB
        cam = torch.clamp(cam, min=0.0)

        cam_np = cam.cpu().numpy()

        # Normalize to [0.0, 1.0]
        max_val = np.max(cam_np)
        if max_val > 1e-8:
            cam_np = cam_np / max_val
        else:
            cam_np = np.zeros_like(cam_np)

        return cam_np

    def create_overlay_image(
        self,
        original_rgb: np.ndarray,
        heatmap_2d: np.ndarray,
        alpha: float = 0.55,
        colormap: int = cv2.COLORMAP_JET
    ) -> Tuple[np.ndarray, str]:
        """Upsamples heatmap to original image size, applies colormap, blends overlay,
        and generates base64 data URL.
        """
        h, w = original_rgb.shape[:2]
        # Resize heatmap to match image dimensions
        heatmap_resized = cv2.resize(heatmap_2d, (w, h), interpolation=cv2.INTER_CUBIC)
        heatmap_resized = np.clip(heatmap_resized, 0.0, 1.0)

        # Convert to 8-bit [0, 255]
        heatmap_uint8 = (heatmap_resized * 255.0).astype(np.uint8)
        heatmap_colored = cv2.applyColorMap(heatmap_uint8, colormap)
        heatmap_colored_rgb = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

        # Alpha blending
        overlay = cv2.addWeighted(original_rgb, 1.0 - alpha, heatmap_colored_rgb, alpha, 0)

        # Encode to Base64 PNG data URL
        pil_img = Image.fromarray(overlay)
        buffered = BytesIO()
        pil_img.save(buffered, format="PNG")
        b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        data_url = f"data:image/png;base64,{b64_str}"

        return overlay, data_url

    def extract_hotspots(
        self,
        heatmap_2d: np.ndarray,
        threshold: float = 0.45,
        max_spots: int = 4
    ) -> List[Dict[str, Any]]:
        """Extracts peak activation centroid coordinates and zone labels for UI interactive markers."""
        h, w = heatmap_2d.shape
        binary_mask = (heatmap_2d >= threshold).astype(np.uint8) * 255

        contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        hotspots: List[Dict[str, Any]] = []

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < (h * w * 0.01):  # Filter micro-noise < 1% area
                continue

            (cx, cy), radius = cv2.minEnclosingCircle(cnt)
            x_pct = round((cx / float(w)) * 100, 1)
            y_pct = round((cy / float(h)) * 100, 1)
            radius_pct = round(max(8.0, min(24.0, (radius / float(w)) * 100)), 1)

            # Measure peak intensity in this contour
            mask_single = np.zeros_like(heatmap_2d, dtype=np.uint8)
            cv2.drawContours(mask_single, [cnt], -1, 255, -1)
            peak_val = float(np.max(heatmap_2d[mask_single > 0])) if np.any(mask_single > 0) else threshold

            # Map coordinates to anatomical lung zone
            # Note: Patient's Right lung is on the Left side of a standard PA radiograph (x < 50%)
            if x_pct < 50.0:
                zone = "Right Upper Lobe" if y_pct < 45.0 else "Right Mid/Lower Lobe"
            else:
                zone = "Left Upper Lobe" if y_pct < 45.0 else "Left Mid/Lower Lobe"

            label = f"Focal {zone} Activation"

            hotspots.append({
                "x": x_pct,
                "y": y_pct,
                "radius": radius_pct,
                "intensity": round(peak_val, 2),
                "label": label
            })

        # Sort hotspots by intensity descending
        hotspots.sort(key=lambda s: s["intensity"], reverse=True)
        return hotspots[:max_spots]
