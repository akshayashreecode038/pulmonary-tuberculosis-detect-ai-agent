"""Unit and integration tests for TB inference and Grad-CAM explainability."""

import pytest
import numpy as np
from PIL import Image
from io import BytesIO
import torch

from ai_agent.models.architecture import build_model
from ai_agent.inference.gradcam import GradCAM
from ai_agent.inference.predictor import TBPredictor
from ai_agent.training.synthetic_data import generate_chest_xray_image


@pytest.fixture
def sample_xray_bytes():
    img_arr = generate_chest_xray_image(is_tb=True, size=256, seed=42)
    pil_img = Image.fromarray(img_arr)
    buf = BytesIO()
    pil_img.save(buf, format="PNG")
    return buf.getvalue()


def test_model_forward_pass():
    model = build_model(backbone="densenet121", pretrained=False)
    model.eval()
    dummy_input = torch.randn(1, 3, 224, 224)
    logits = model(dummy_input)
    assert logits.shape == (1, 1)

    score = model.predict_score(dummy_input)
    assert 0.0 <= score.item() <= 1.0


def test_gradcam_generation():
    model = build_model(backbone="densenet121", pretrained=False)
    gradcam = GradCAM(model)
    dummy_input = torch.randn(1, 3, 224, 224)

    cam_map = gradcam.generate_heatmap(dummy_input)
    assert cam_map.shape == (7, 7) or cam_map.ndim == 2
    assert np.min(cam_map) >= 0.0
    assert np.max(cam_map) <= 1.0

    # Test hotspot extraction
    hotspots = gradcam.extract_hotspots(cam_map, threshold=0.1)
    assert isinstance(hotspots, list)


def test_predictor_end_to_end(sample_xray_bytes):
    predictor = TBPredictor()
    result = predictor.predict(
        image_bytes=sample_xray_bytes,
        patient_metadata={"patientId": "PT-TEST-01", "patientAge": 38},
        custom_threshold=0.45
    )

    assert "id" in result
    assert result["patient"]["patientId"] == "PT-TEST-01"
    assert 0.0 <= result["tbProbability"] <= 1.0
    assert result["riskLevel"] in ["low", "moderate", "high"]
    assert result["prediction"] in ["TB-suspected", "TB-not-suspected"]
    assert len(result["zoneBreakdown"]) == 4
    assert "qualityMetrics" in result
    assert "recommendations" in result
    assert len(result["recommendations"]) > 0
    assert "disclaimer" in result
