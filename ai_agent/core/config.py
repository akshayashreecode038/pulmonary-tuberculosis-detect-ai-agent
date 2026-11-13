"""Configuration management for TB Detection AI Agent.
Supports YAML config files, environment variables, and programmatic override.
"""

from pathlib import Path
from typing import Literal, Optional
import os
import yaml
from pydantic import BaseModel, Field


class ModelConfig(BaseModel):
    name: Literal["densenet121", "resnet50", "efficientnet_b0"] = "densenet121"
    image_size: int = 224
    in_channels: int = 3
    num_classes: int = 1
    dropout_rate: float = 0.3
    pretrained: bool = False
    version: str = "tb-densenet121-v1.0"


class InferenceConfig(BaseModel):
    threshold: float = Field(
        default=0.45,
        ge=0.0,
        le=1.0,
        description="Decision threshold for classifying chest X-ray as TB-suspected. 0.45 balances sensitivity for screening."
    )
    device: str = "auto"  # 'auto', 'cuda', or 'cpu'
    enable_gradcam: bool = True
    target_layer_name: Optional[str] = None
    clahe_enabled: bool = False
    clahe_clip_limit: float = 2.0
    clahe_tile_grid_size: int = 8


class TrainingConfig(BaseModel):
    batch_size: int = 32
    epochs: int = 20
    learning_rate: float = 1e-4
    weight_decay: float = 1e-4
    optimizer: str = "adamw"
    lr_scheduler: str = "plateau"
    patience: int = 5
    pos_weight: Optional[float] = None
    seed: int = 42


class PathsConfig(BaseModel):
    base_dir: Path = Path(__file__).resolve().parent.parent
    dataset_dir: Path = Path(__file__).resolve().parent.parent / "dataset"
    models_dir: Path = Path(__file__).resolve().parent.parent / "models"
    active_checkpoint: Optional[str] = None


class AgentConfig(BaseModel):
    model: ModelConfig = Field(default_factory=ModelConfig)
    inference: InferenceConfig = Field(default_factory=InferenceConfig)
    training: TrainingConfig = Field(default_factory=TrainingConfig)
    paths: PathsConfig = Field(default_factory=PathsConfig)

    @classmethod
    def from_yaml(cls, yaml_path: str | Path) -> "AgentConfig":
        path = Path(yaml_path)
        if not path.exists():
            return cls()
        with open(path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
        return cls(**data)

    def to_yaml(self, yaml_path: str | Path) -> None:
        path = Path(yaml_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            yaml.safe_dump(self.model_dump(), f, default_flow_style=False)


# Default global configuration instance
CONFIG = AgentConfig()
