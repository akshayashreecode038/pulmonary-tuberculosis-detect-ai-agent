"""Model training pipeline for Tuberculosis detection from chest radiographs.
Includes class imbalance mitigation (pos_weight BCE), validation monitoring,
and model checkpointing.
"""

from pathlib import Path
import argparse
import sys
import yaml
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from ai_agent.core.config import CONFIG, AgentConfig
from ai_agent.core.logging import logger
from ai_agent.models.architecture import build_model
from ai_agent.models.checkpoint import save_checkpoint
from ai_agent.training.dataset import load_dataset_from_dir
from ai_agent.training.transforms import get_train_transforms, get_eval_transforms
from ai_agent.training.evaluate import compute_clinical_metrics


def run_training(
    config: AgentConfig,
    dataset_dir: str | Path | None = None,
    epochs_override: int | None = None,
    save_checkpoint_name: str = "tb_densenet121_best.pt"
) -> dict:
    """Executes model training with class imbalance compensation and validation evaluation."""
    device = "cuda" if torch.cuda.is_available() else "cpu"
    base_data_path = Path(dataset_dir or config.paths.dataset_dir)
    epochs = epochs_override if epochs_override is not None else config.training.epochs
    batch_size = config.training.batch_size
    lr = config.training.learning_rate

    train_dir = base_data_path / "train"
    val_dir = base_data_path / "validation"

    if not train_dir.exists():
        raise FileNotFoundError(f"Training directory not found at {train_dir}")

    # Load datasets with centralized transforms
    train_transforms = get_train_transforms(image_size=config.model.image_size)
    eval_transforms = get_eval_transforms(image_size=config.model.image_size)

    train_ds = load_dataset_from_dir(train_dir, transform=train_transforms)
    val_ds = load_dataset_from_dir(val_dir, transform=eval_transforms) if val_dir.exists() else None

    # Report class distribution before training (Requirement 12)
    counts = train_ds.get_class_counts()
    print("\n==================================================")
    print("           DATASET CLASS DISTRIBUTION              ")
    print("==================================================")
    print(f"  Normal Cases : {counts['normal']:<5} ({counts['normal']/counts['total']*100:.1f}%)")
    print(f"  TB Cases     : {counts['tb']:<5} ({counts['tb']/counts['total']*100:.1f}%)")
    print(f"  Total Images : {counts['total']}")
    print("==================================================\n")

    # Handle Class Imbalance via Positive Class Weighting
    n_neg = max(1, counts["normal"])
    n_pos = max(1, counts["tb"])
    pos_weight_val = float(n_neg / n_pos)
    pos_weight = torch.tensor([pos_weight_val], device=device)
    print(f"[Training] Class imbalance compensation: BCE pos_weight = {pos_weight_val:.3f}")

    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)

    # Initialize model
    model = build_model(
        backbone=config.model.name,
        pretrained=config.model.pretrained,
        dropout=config.model.dropout_rate
    ).to(device)

    # Optimizer
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=config.training.weight_decay)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="max", factor=0.5, patience=2)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False) if val_ds else None

    best_val_auc = 0.0
    best_metrics = {}
    checkpoint_path = config.paths.models_dir / save_checkpoint_name

    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        total_samples = 0

        for inputs, targets, _ in train_loader:
            inputs = inputs.to(device)
            targets = targets.to(device)

            optimizer.zero_grad()
            logits = model(inputs)
            loss = criterion(logits, targets)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            total_samples += inputs.size(0)

        epoch_loss = running_loss / max(1, total_samples)

        # Validation phase
        val_metrics = {}
        if val_loader:
            model.eval()
            val_scores = []
            val_targets = []
            with torch.no_grad():
                for inputs, targets, _ in val_loader:
                    inputs = inputs.to(device)
                    logits = model(inputs)
                    scores = torch.sigmoid(logits).squeeze(-1).cpu().numpy()
                    if scores.ndim == 0:
                        scores = np.array([scores])
                    val_scores.extend(scores.tolist())
                    val_targets.extend(targets.squeeze(-1).numpy().tolist())

            val_metrics = compute_clinical_metrics(
                np.array(val_targets, dtype=int),
                np.array(val_scores, dtype=np.float32),
                threshold=config.inference.threshold
            )
            scheduler.step(val_metrics["roc_auc"])

            print(
                f"Epoch [{epoch:02d}/{epochs:02d}] "
                f"Train Loss: {epoch_loss:.4f} | "
                f"Val Sensitivity: {val_metrics['sensitivity']:.1f}% | "
                f"Val Specificity: {val_metrics['specificity']:.1f}% | "
                f"Val ROC-AUC: {val_metrics['roc_auc']:.4f}",
                flush=True
            )

            # Checkpoint on best ROC-AUC
            if val_metrics["roc_auc"] >= best_val_auc:
                best_val_auc = val_metrics["roc_auc"]
                best_metrics = val_metrics
                metadata = {
                    "model_version": f"tb-{config.model.name}-trained",
                    "backbone": config.model.name,
                    "is_fine_tuned_tb": True,
                    "decision_threshold": config.inference.threshold,
                    "training_epochs": epoch,
                    "val_metrics": val_metrics
                }
                save_checkpoint(model, checkpoint_path, metadata=metadata, optimizer=optimizer)
        else:
            print(f"Epoch [{epoch:02d}/{epochs:02d}] Train Loss: {epoch_loss:.4f}")

    if not checkpoint_path.exists():
        save_checkpoint(model, checkpoint_path, metadata={"model_version": "tb-trained-final"})

    print(f"\nTraining completed. Checkpoint saved to: {checkpoint_path}")
    return best_metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train TB detection model on chest radiographs.")
    parser.add_argument("--config", type=str, default="ai_agent/training/config.yaml", help="Path to config file")
    parser.add_argument("--dataset-dir", type=str, default=None, help="Path to dataset directory")
    parser.add_argument("--epochs", type=int, default=None, help="Number of training epochs")
    parser.add_argument("--save-name", type=str, default="tb_densenet121_best.pt", help="Checkpoint filename")
    args = parser.parse_args()

    cfg = AgentConfig.from_yaml(args.config) if Path(args.config).exists() else CONFIG
    run_training(cfg, dataset_dir=args.dataset_dir, epochs_override=args.epochs, save_checkpoint_name=args.save_name)
