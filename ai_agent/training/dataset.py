"""Chest X-ray dataset loader and patient-level splitting to prevent data leakage.
"""

from pathlib import Path
import re
from typing import List, Tuple, Dict, Optional, Callable
from PIL import Image
import numpy as np
import torch
from torch.utils.data import Dataset

from ai_agent.core.exceptions import DatasetError


IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".bmp"}


def extract_patient_id(filepath: Path) -> str:
    """Extracts patient identifier from filename to prevent data leakage across splits.
    
    Examples:
        'patient_0042_view1.png' -> 'patient_0042'
        'MCUCXR_0005_0.png' -> 'MCUCXR_0005'
        'TB_patient88_supine.jpg' -> 'patient88'
        'img_12345.png' -> '12345'
    """
    stem = filepath.stem
    # Standard medical datasets often use prefix_ID_view
    patterns = [
        r"^(patient[_\-]?\d+)",
        r"^([A-Za-z]+_\d+)",
        r"^(\d+)",
        r"^([A-Za-z0-9]+)[_\-]"
    ]
    for pat in patterns:
        m = re.match(pat, stem, re.IGNORECASE)
        if m:
            return m.group(1).lower()
    return stem.split("_")[0].lower()


class ChestXrayDataset(Dataset):
    """PyTorch Dataset for Tuberculosis chest radiographs."""

    def __init__(
        self,
        samples: List[Tuple[Path, int, str]],  # (filepath, label, patient_id)
        transform: Optional[Callable] = None
    ):
        self.samples = samples
        self.transform = transform

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor, str]:
        img_path, label, patient_id = self.samples[idx]
        try:
            image = Image.open(img_path).convert("RGB")
        except Exception as e:
            raise DatasetError(f"Failed to read image at {img_path}: {e}")

        if self.transform is not None:
            tensor = self.transform(image)
        else:
            tensor = torch.from_numpy(np.array(image)).permute(2, 0, 1).float() / 255.0

        label_tensor = torch.tensor([float(label)], dtype=torch.float32)
        return tensor, label_tensor, str(img_path)

    def get_class_counts(self) -> Dict[str, int]:
        normal_count = sum(1 for _, lbl, _ in self.samples if lbl == 0)
        tb_count = sum(1 for _, lbl, _ in self.samples if lbl == 1)
        return {"normal": normal_count, "tb": tb_count, "total": len(self.samples)}


def load_dataset_from_dir(split_dir: str | Path, transform: Optional[Callable] = None) -> ChestXrayDataset:
    """Loads a split folder structured as:
    split_dir/
      ├── Normal/
      └── TB/
    """
    path = Path(split_dir)
    if not path.exists():
        raise DatasetError(f"Dataset directory does not exist: {split_dir}")

    samples: List[Tuple[Path, int, str]] = []

    # Map possible folder name variants
    class_mapping = {
        "normal": 0, "healthy": 0, "negative": 0, "non-tb": 0, "0": 0,
        "tb": 1, "tuberculosis": 1, "positive": 1, "1": 1
    }

    subdirs = [d for d in path.iterdir() if d.is_dir()]
    for d in subdirs:
        norm_name = d.name.strip().lower()
        if norm_name not in class_mapping:
            continue
        label = class_mapping[norm_name]

        for file in d.iterdir():
            if file.suffix.lower() in IMAGE_EXTENSIONS:
                patient_id = extract_patient_id(file)
                samples.append((file, label, patient_id))

    if not samples:
        raise DatasetError(f"No valid images found in {split_dir} under TB/ or Normal/ directories.")

    return ChestXrayDataset(samples, transform=transform)


def split_dataset_patient_level(
    all_samples: List[Tuple[Path, int, str]],
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_state: int = 42
) -> Tuple[List[Tuple[Path, int, str]], List[Tuple[Path, int, str]], List[Tuple[Path, int, str]]]:
    """Partitions samples into train, validation, and test sets using PATIENT-LEVEL grouping.
    
    Guarantees zero data leakage: all radiographs from a given patient remain exclusively
    within one split (Train, Val, or Test).
    """
    if not np.isclose(train_ratio + val_ratio + test_ratio, 1.0):
        raise ValueError("Split ratios must sum to 1.0")

    # Extract unique patient IDs preserving order
    unique_pts = list(dict.fromkeys(s[2] for s in all_samples))
    
    rng = np.random.RandomState(random_state)
    rng.shuffle(unique_pts)

    n_total = len(unique_pts)
    n_test = max(1, int(round(n_total * test_ratio))) if test_ratio > 0 else 0
    n_val = max(1, int(round(n_total * val_ratio))) if val_ratio > 0 else 0
    n_train = n_total - n_test - n_val

    if n_train < 1:
        n_train = 1
        n_val = max(0, n_total - n_train - n_test)

    test_pts = set(unique_pts[:n_test])
    val_pts = set(unique_pts[n_test:n_test + n_val])
    train_pts = set(unique_pts[n_test + n_val:])

    train_samples = [s for s in all_samples if s[2] in train_pts]
    val_samples = [s for s in all_samples if s[2] in val_pts]
    test_samples = [s for s in all_samples if s[2] in test_pts]

    # Strict invariant assertion: Zero patient overlap
    assert len(train_pts.intersection(val_pts)) == 0, "Data leakage detected between Train and Validation!"
    assert len(train_pts.intersection(test_pts)) == 0, "Data leakage detected between Train and Test!"
    assert len(val_pts.intersection(test_pts)) == 0, "Data leakage detected between Validation and Test!"

    return train_samples, val_samples, test_samples
