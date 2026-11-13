"""Comprehensive multi-metric evaluation module for Tuberculosis detection models.
Calculates Accuracy, Sensitivity, Specificity, Precision, NPV, F1, ROC-AUC, PR-AUC, Confusion Matrix,
and model score calibration.
"""

from pathlib import Path
from typing import Dict, Any, List, Tuple
import json
import numpy as np
import torch
from torch.utils.data import DataLoader
from sklearn.metrics import (
    roc_auc_score,
    precision_recall_curve,
    auc,
    confusion_matrix,
    brier_score_loss,
    accuracy_score,
    f1_score,
    precision_score,
    recall_score
)

from ai_agent.models.architecture import TBClassifier
from ai_agent.training.dataset import ChestXrayDataset, load_dataset_from_dir
from ai_agent.training.transforms import get_eval_transforms


def compute_clinical_metrics(
    y_true: np.ndarray,
    y_scores: np.ndarray,
    threshold: float = 0.45
) -> Dict[str, Any]:
    """Computes clinical and statistical performance metrics."""
    y_pred = (y_scores >= threshold).astype(int)

    # Confusion matrix: [[TN, FP], [FN, TP]]
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()

    # Sensitivity (Recall) = TP / (TP + FN)
    sensitivity = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
    # Specificity = TN / (TN + FP)
    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0
    # Precision (PPV) = TP / (TP + FP)
    precision = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
    # Negative Predictive Value (NPV) = TN / (TN + FN)
    npv = float(tn / (tn + fn)) if (tn + fn) > 0 else 0.0
    # Accuracy
    accuracy = float(accuracy_score(y_true, y_pred))
    # F1 Score
    f1 = float(f1_score(y_true, y_pred, zero_division=0))

    # ROC-AUC & PR-AUC
    try:
        roc_auc = float(roc_auc_score(y_true, y_scores))
    except Exception:
        roc_auc = 0.5

    try:
        precisions, recalls, _ = precision_recall_curve(y_true, y_scores)
        pr_auc = float(auc(recalls, precisions))
    except Exception:
        pr_auc = 0.0

    # Model Score Calibration (Brier Score: lower is better, 0 = perfect calibration)
    try:
        brier = float(brier_score_loss(y_true, y_scores))
    except Exception:
        brier = 0.0

    metrics = {
        "threshold": threshold,
        "accuracy": round(accuracy * 100, 2),
        "sensitivity": round(sensitivity * 100, 2),
        "specificity": round(specificity * 100, 2),
        "precision": round(precision * 100, 2),
        "npv": round(npv * 100, 2),
        "f1_score": round(f1 * 100, 2),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "brier_score": round(brier, 4),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp)
        },
        "sample_counts": {
            "total": len(y_true),
            "normal": int(np.sum(y_true == 0)),
            "tb": int(np.sum(y_true == 1))
        }
    }

    return metrics


def format_evaluation_report(metrics: Dict[str, Any]) -> str:
    """Formats clinical evaluation metrics into an ASCII diagnostic report."""
    cm = metrics["confusion_matrix"]
    report = f"""
============================================================
              TUBERCULOSIS AI MODEL EVALUATION              
============================================================
Decision Threshold : {metrics['threshold']}
Total Test Samples : {metrics['sample_counts']['total']} (Normal: {metrics['sample_counts']['normal']}, TB: {metrics['sample_counts']['tb']})

Clinical Diagnostic Metrics:
------------------------------------------------------------
Sensitivity (Recall) : {metrics['sensitivity']:.2f}%  [Critical for finding TB cases]
Specificity          : {metrics['specificity']:.2f}%  [Minimizes false alarms]
ROC-AUC              : {metrics['roc_auc']:.4f}
PR-AUC               : {metrics['pr_auc']:.4f}
Accuracy             : {metrics['accuracy']:.2f}%
Precision (PPV)      : {metrics['precision']:.2f}%
NPV                  : {metrics['npv']:.2f}%
F1 Score             : {metrics['f1_score']:.2f}%
Brier Score (Calib)  : {metrics['brier_score']:.4f}

Confusion Matrix:
------------------------------------------------------------
                     Predicted Normal     Predicted TB
  Actual Normal            {cm['tn']:<8}         {cm['fp']:<8} (TN / FP)
  Actual TB                {cm['fn']:<8}         {cm['tp']:<8} (FN / TP)
============================================================
"""
    return report.strip()


def evaluate_model_on_dataset(
    model: TBClassifier,
    dataset: ChestXrayDataset,
    threshold: float = 0.45,
    batch_size: int = 16,
    device: str = "cpu"
) -> Tuple[Dict[str, Any], str]:
    """Runs batch inference over dataset and computes all evaluation metrics."""
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)
    model.eval()
    model.to(device)

    all_targets = []
    all_scores = []

    with torch.no_grad():
        for inputs, targets, _ in loader:
            inputs = inputs.to(device)
            logits = model(inputs)
            scores = torch.sigmoid(logits).squeeze(-1).cpu().numpy()
            if scores.ndim == 0:
                scores = np.array([scores])
            all_scores.extend(scores.tolist())
            all_targets.extend(targets.squeeze(-1).numpy().tolist())

    y_true = np.array(all_targets, dtype=int)
    y_scores = np.array(all_scores, dtype=np.float32)

    metrics = compute_clinical_metrics(y_true, y_scores, threshold=threshold)
    report = format_evaluation_report(metrics)
    return metrics, report


if __name__ == "__main__":
    import argparse
    from ai_agent.models.checkpoint import load_checkpoint

    parser = argparse.ArgumentParser(description="Evaluate TB model on chest radiograph test set.")
    parser.add_argument("--checkpoint", type=str, default="ai_agent/models_ckpt/tb_densenet121_best.pt", help="Model checkpoint path")
    parser.add_argument("--test-dir", type=str, default="ai_agent/dataset/test", help="Test directory containing TB/ and Normal/")
    parser.add_argument("--threshold", type=float, default=0.45, help="Decision threshold")
    args = parser.parse_args()

    print(f"Loading checkpoint: {args.checkpoint}")
    model, metadata = load_checkpoint(args.checkpoint)
    print(f"Model version: {metadata.get('model_version')} | Backbone: {metadata.get('backbone')}")

    test_transforms = get_eval_transforms(image_size=metadata.get("image_size", 224))
    dataset = load_dataset_from_dir(args.test_dir, transform=test_transforms)
    print(f"Loaded test set with {len(dataset)} samples from '{args.test_dir}'")

    metrics, report = evaluate_model_on_dataset(model, dataset, threshold=args.threshold)
    print("\n" + report)
