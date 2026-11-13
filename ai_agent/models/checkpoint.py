"""Model checkpoint management: saving, loading, metadata serialization, and versioning.
"""

from pathlib import Path
from typing import Optional, Tuple
import json
import torch

from ai_agent.core.exceptions import ModelLoadError
from ai_agent.models.architecture import TBClassifier, build_model


DEFAULT_METADATA = {
    "model_version": "tb-densenet121-v1.0",
    "backbone": "densenet121",
    "classes": ["normal", "tb"],
    "image_size": 224,
    "decision_threshold": 0.45,
    "normalization": {
        "mean": [0.485, 0.456, 0.406],
        "std": [0.229, 0.224, 0.225]
    },
    "is_fine_tuned_tb": False,
    "disclaimer": "AI-assisted screening tool. Not a definitive medical diagnosis. Requires validation on local clinical cohorts."
}


def save_checkpoint(
    model: TBClassifier,
    save_path: str | Path,
    metadata: dict | None = None,
    optimizer: torch.optim.Optimizer | None = None
) -> Path:
    """Saves model weights (.pt) and sidecar metadata (.json)."""
    path = Path(save_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    meta = DEFAULT_METADATA.copy()
    if metadata:
        meta.update(metadata)
    meta["backbone"] = model.backbone_name

    checkpoint = {
        "state_dict": model.state_dict(),
        "backbone": model.backbone_name,
        "metadata": meta
    }
    if optimizer is not None:
        checkpoint["optimizer_state_dict"] = optimizer.state_dict()

    torch.save(checkpoint, path)

    # Also save JSON metadata alongside checkpoint for transparency & inspection
    json_path = path.with_suffix(".json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    return path


def load_checkpoint(
    checkpoint_path: str | Path,
    device: str = "cpu"
) -> Tuple[TBClassifier, dict]:
    """Loads model from checkpoint with metadata."""
    path = Path(checkpoint_path)
    if not path.exists():
        raise ModelLoadError(f"Checkpoint file not found: {checkpoint_path}")

    try:
        # Load weights on specified device
        map_location = torch.device(device)
        checkpoint = torch.load(path, map_location=map_location, weights_only=False)

        backbone = checkpoint.get("backbone", "densenet121")
        model = build_model(backbone=backbone, pretrained=False)
        model.load_state_dict(checkpoint["state_dict"])
        model.to(map_location)
        model.eval()

        metadata = checkpoint.get("metadata", DEFAULT_METADATA.copy())
        return model, metadata

    except Exception as e:
        raise ModelLoadError(f"Failed to load model checkpoint '{path}': {str(e)}")
