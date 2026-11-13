"""API integration tests using FastAPI TestClient."""

from io import BytesIO
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from ai_agent.api.main import app
from ai_agent.training.synthetic_data import generate_chest_xray_image


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_image_bytes():
    img_arr = generate_chest_xray_image(is_tb=False, size=224, seed=123)
    buf = BytesIO()
    Image.fromarray(img_arr).save(buf, format="PNG")
    return buf.getvalue()


def test_api_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "tb-detect-ai"
    assert data["model_loaded"] is True


def test_api_model_info_endpoint(client):
    response = client.get("/api/model/info")
    assert response.status_code == 200
    data = response.json()
    assert "architecture" in data
    assert "activeThreshold" in data
    assert "explainability" in data


def test_api_threshold_update(client):
    response = client.post("/api/model/threshold", json={"threshold": 0.52})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["newThreshold"] == 0.52

    # Revert back to 0.45
    client.post("/api/model/threshold", json={"threshold": 0.45})


def test_api_predict_valid_image(client, sample_image_bytes):
    files = {"image": ("chest_test.png", sample_image_bytes, "image/png")}
    data = {
        "patientId": "PT-9942",
        "patientAge": "52",
        "gender": "male",
        "symptoms": '["Chronic Cough", "Night Sweats"]',
        "threshold": "0.45"
    }
    response = client.post("/api/predict", files=files, data=data)
    assert response.status_code == 200
    res = response.json()

    assert "id" in res
    assert res["patient"]["patientId"] == "PT-9942"
    assert res["patient"]["patientAge"] == 52
    assert "tbProbability" in res
    assert res["riskLevel"] in ["low", "moderate", "high"]
    assert len(res["zoneBreakdown"]) == 4
    assert "recommendations" in res
    assert "disclaimer" in res


def test_api_predict_invalid_image(client):
    files = {"image": ("empty.png", b"", "image/png")}
    response = client.post("/api/predict", files=files)
    assert response.status_code == 422
    err = response.json()
    assert err["error"] == "ImageValidationError"
