"""Unit tests for training pipeline, leakage prevention, and metrics calculation."""

from pathlib import Path
import numpy as np

from ai_agent.training.dataset import split_dataset_patient_level, extract_patient_id
from ai_agent.training.evaluate import compute_clinical_metrics, format_evaluation_report


def test_patient_id_extraction():
    p1 = extract_patient_id(Path("patient_0042_view1.png"))
    p2 = extract_patient_id(Path("patient_0042_view2.png"))
    assert p1 == p2 == "patient_0042"

    p3 = extract_patient_id(Path("MCUCXR_0010_1.png"))
    assert p3 == "mcucxr_0010"


def test_patient_level_split_no_leakage():
    # Construct synthetic sample list with 30 patients, 3 views each
    samples = []
    for pt in range(1, 31):
        pt_id = f"patient_{pt:03d}"
        for view in range(1, 4):
            samples.append((Path(f"{pt_id}_v{view}.png"), pt % 2, pt_id))

    train, val, test = split_dataset_patient_level(
        samples,
        train_ratio=0.70,
        val_ratio=0.15,
        test_ratio=0.15,
        random_state=42
    )

    train_pts = {s[2] for s in train}
    val_pts = {s[2] for s in val}
    test_pts = {s[2] for s in test}

    # Verify strictly mutually exclusive patient sets
    assert len(train_pts.intersection(val_pts)) == 0
    assert len(train_pts.intersection(test_pts)) == 0
    assert len(val_pts.intersection(test_pts)) == 0
    assert len(train) + len(val) + len(test) == len(samples)


def test_clinical_metrics_computation():
    y_true = np.array([0, 0, 0, 0, 1, 1, 1, 1])
    y_scores = np.array([0.1, 0.2, 0.3, 0.6, 0.7, 0.8, 0.9, 0.4])

    metrics = compute_clinical_metrics(y_true, y_scores, threshold=0.5)

    assert "sensitivity" in metrics
    assert "specificity" in metrics
    assert "roc_auc" in metrics
    assert "confusion_matrix" in metrics

    # TP = 3 (scores 0.7, 0.8, 0.9), FN = 1 (score 0.4) -> Sensitivity = 3/4 = 75.0%
    assert np.isclose(metrics["sensitivity"], 75.0)
    # TN = 3 (scores 0.1, 0.2, 0.3), FP = 1 (score 0.6) -> Specificity = 3/4 = 75.0%
    assert np.isclose(metrics["specificity"], 75.0)

    report = format_evaluation_report(metrics)
    assert "TUBERCULOSIS AI MODEL EVALUATION" in report
    assert "Sensitivity" in report
    assert "Confusion Matrix" in report
