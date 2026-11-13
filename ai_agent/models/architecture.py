"""Deep learning model architectures for Tuberculosis detection.
Supports transfer learning backbones (DenseNet121, ResNet50, EfficientNet) with custom classification heads.
"""

from typing import Literal, Tuple
import torch
import torch.nn as nn
from torchvision import models

from ai_agent.core.exceptions import ModelLoadError


class TBClassifier(nn.Module):
    """Deep learning classifier for Chest Radiographs.
    
    Defaults to DenseNet121 (CheXNet architecture style) for superior feature reuse
    and gradient flow across multi-scale pulmonary lesions.
    """

    def __init__(
        self,
        backbone_name: Literal["densenet121", "resnet50", "efficientnet_b0"] = "densenet121",
        pretrained: bool = True,
        dropout_rate: float = 0.3,
        num_classes: int = 1
    ):
        super().__init__()
        self.backbone_name = backbone_name
        self.num_classes = num_classes

        if backbone_name == "densenet121":
            base_model = None
            if pretrained:
                try:
                    weights = models.DenseNet121_Weights.DEFAULT
                    base_model = models.densenet121(weights=weights)
                except Exception:
                    base_model = models.densenet121(weights=None)
            else:
                base_model = models.densenet121(weights=None)

            self.features = base_model.features
            num_features = base_model.classifier.in_features
            self.target_cam_layer = self.features.denseblock4.denselayer16.conv2
            self.head = nn.Sequential(
                nn.AdaptiveAvgPool2d((1, 1)),
                nn.Flatten(),
                nn.Dropout(p=dropout_rate),
                nn.Linear(num_features, 256),
                nn.ReLU(inplace=True),
                nn.Dropout(p=dropout_rate / 2),
                nn.Linear(256, num_classes)
            )

        elif backbone_name == "resnet50":
            base_model = None
            if pretrained:
                try:
                    weights = models.ResNet50_Weights.DEFAULT
                    base_model = models.resnet50(weights=weights)
                except Exception:
                    base_model = models.resnet50(weights=None)
            else:
                base_model = models.resnet50(weights=None)

            self.features = nn.Sequential(
                base_model.conv1,
                base_model.bn1,
                base_model.relu,
                base_model.maxpool,
                base_model.layer1,
                base_model.layer2,
                base_model.layer3,
                base_model.layer4
            )
            num_features = base_model.fc.in_features
            self.target_cam_layer = base_model.layer4[-1]
            self.head = nn.Sequential(
                nn.AdaptiveAvgPool2d((1, 1)),
                nn.Flatten(),
                nn.Dropout(p=dropout_rate),
                nn.Linear(num_features, 256),
                nn.ReLU(inplace=True),
                nn.Dropout(p=dropout_rate / 2),
                nn.Linear(256, num_classes)
            )

        elif backbone_name == "efficientnet_b0":
            base_model = None
            if pretrained:
                try:
                    weights = models.EfficientNet_B0_Weights.DEFAULT
                    base_model = models.efficientnet_b0(weights=weights)
                except Exception:
                    base_model = models.efficientnet_b0(weights=None)
            else:
                base_model = models.efficientnet_b0(weights=None)
            self.features = base_model.features
            num_features = base_model.classifier[1].in_features
            self.target_cam_layer = self.features[-1]
            self.head = nn.Sequential(
                nn.AdaptiveAvgPool2d((1, 1)),
                nn.Flatten(),
                nn.Dropout(p=dropout_rate),
                nn.Linear(num_features, 256),
                nn.ReLU(inplace=True),
                nn.Dropout(p=dropout_rate / 2),
                nn.Linear(256, num_classes)
            )
        else:
            raise ModelLoadError(f"Unsupported backbone architecture: {backbone_name}")

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Returns raw single-unit logits (unbounded real number)."""
        feats = self.features(x)
        logits = self.head(feats)
        return logits

    def predict_score(self, x: torch.Tensor) -> torch.Tensor:
        """Applies Sigmoid to logits to return model score in [0.0, 1.0]."""
        with torch.no_grad():
            logits = self.forward(x)
            return torch.sigmoid(logits)


def build_model(
    backbone: Literal["densenet121", "resnet50", "efficientnet_b0"] = "densenet121",
    pretrained: bool = True,
    dropout: float = 0.3
) -> TBClassifier:
    """Factory method to construct TB classifier."""
    return TBClassifier(backbone_name=backbone, pretrained=pretrained, dropout_rate=dropout)
