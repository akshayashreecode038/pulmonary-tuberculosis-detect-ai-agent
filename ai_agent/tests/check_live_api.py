"""Script to verify live running FastAPI server with real radiograph."""

from pathlib import Path
import json
import httpx


def test_live_api():
    tb_img = next(Path("ai_agent/dataset/test/TB").glob("*.png"))
    print(f"[Test] Using image: {tb_img}")

    with open(tb_img, "rb") as f:
        files = {"image": (tb_img.name, f, "image/png")}
        data = {
            "patientId": "PT-CLINICAL-402",
            "patientAge": "54",
            "gender": "male",
            "symptoms": json.dumps(["Hemoptysis", "Weight Loss", "Productive Cough > 3 weeks"]),
            "threshold": "0.45"
        }
        res = httpx.post("http://127.0.0.1:8000/api/predict", files=files, data=data, timeout=30.0)

    print(f"Status Code: {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"

    data = res.json()
    print("\n--- Live Analysis Result ---")
    print(f"Scan ID:             {data['id']}")
    print(f"Timestamp:           {data['timestamp']}")
    print(f"Patient:             {data['patient']}")
    print(f"Prediction:          {data['prediction']}")
    print(f"Model Score:         {data['tbProbability']}")
    print(f"Confidence:          {data['confidenceScore']}")
    print(f"Risk Level:          {data['riskLevel']}")
    print(f"Primary Finding:     {data['primaryFinding']}")
    print(f"Lung Zones:          {len(data['zoneBreakdown'])} zones analyzed")
    for z in data['zoneBreakdown']:
        print(f"  * {z['zone']}: {z['status']} ({z['abnormalProbability'] * 100:.0f}%)")
    print(f"Heatmap Hotspots:    {len(data['heatmapCoordinates'])} detected")
    print(f"Quality Metrics:     {data['qualityMetrics']}")
    print(f"Recommendations:     {len(data['recommendations'])} WHO guidelines attached")
    print(f"Disclaimer:          {data['disclaimer']}")
    print("\nAll live verification checks passed successfully!")


if __name__ == "__main__":
    test_live_api()
