"""Synthetic thoracic radiograph dataset generator for testing and demo training.
Generates realistic chest X-ray silhouettes (bilateral lung fields, cardiac silhouette,
ribs, and simulated apical infiltrates / cavitary lesions for TB cases) organized into
leakage-free patient splits.
"""

from pathlib import Path
import argparse
import random
import numpy as np
import cv2
from PIL import Image


def generate_chest_xray_image(is_tb: bool = False, size: int = 224, seed: int | None = None) -> np.ndarray:
    """Renders a simulated chest radiograph with bilateral lung fields and thoracic cage."""
    if seed is not None:
        np.random.seed(seed)
        random.seed(seed)

    # Base background: soft gradient / scatter
    img = np.full((size, size), 28, dtype=np.uint8)

    # Add soft anatomical background density
    cv2.ellipse(img, (size // 2, size // 2), (int(size * 0.44), int(size * 0.46)), 0, 0, 360, 48, -1)

    # Bilateral lung fields (lower attenuation / darker)
    # Right lung (image left)
    r_center = (int(size * 0.32), int(size * 0.48))
    r_axes = (int(size * 0.16), int(size * 0.32))
    cv2.ellipse(img, r_center, r_axes, -6, 0, 360, 14, -1)

    # Left lung (image right, slightly smaller due to cardiac apex)
    l_center = (int(size * 0.68), int(size * 0.48))
    l_axes = (int(size * 0.15), int(size * 0.31))
    cv2.ellipse(img, l_center, l_axes, 6, 0, 360, 14, -1)

    # Cardiac silhouette (dense white/gray overlapping left lung base)
    heart_center = (int(size * 0.53), int(size * 0.58))
    heart_axes = (int(size * 0.13), int(size * 0.16))
    cv2.ellipse(img, heart_center, heart_axes, 24, 0, 360, 115, -1)

    # Spine / mediastinal column
    cv2.rectangle(img, (int(size * 0.47), 0), (int(size * 0.53), size), 85, -1)

    # Clavicles (upper horizontal dense bars)
    cv2.line(img, (int(size * 0.18), int(size * 0.22)), (int(size * 0.46), int(size * 0.25)), 120, int(size * 0.025))
    cv2.line(img, (int(size * 0.82), int(size * 0.22)), (int(size * 0.54), int(size * 0.25)), 120, int(size * 0.025))

    # Rib shadows (curved horizontal arcs)
    for y_offset in range(int(size * 0.30), int(size * 0.75), int(size * 0.08)):
        cv2.ellipse(img, (size // 2, y_offset), (int(size * 0.42), int(size * 0.06)), 0, 10, 170, 65, int(size * 0.015))

    # If TB positive: add focal apical infiltrates / cavitary opacities
    if is_tb:
        # Tuberculosis classically predilects the upper lobes / apical segments
        side = random.choice(["right", "left", "bilateral"])
        if side in ("right", "bilateral"):
            # Right upper lobe infiltrate
            apex_x = int(size * (0.28 + random.uniform(-0.04, 0.04)))
            apex_y = int(size * (0.28 + random.uniform(-0.04, 0.04)))
            radius = int(size * random.uniform(0.06, 0.11))
            # Cloud of reticulonodular opacities
            cv2.circle(img, (apex_x, apex_y), radius, int(random.uniform(90, 145)), -1)
            # Cavitary lucency in center
            if random.random() > 0.4:
                cv2.circle(img, (apex_x, apex_y), int(radius * 0.45), 30, -1)

        if side in ("left", "bilateral"):
            # Left upper lobe infiltrate
            apex_x = int(size * (0.72 + random.uniform(-0.04, 0.04)))
            apex_y = int(size * (0.28 + random.uniform(-0.04, 0.04)))
            radius = int(size * random.uniform(0.05, 0.10))
            cv2.circle(img, (apex_x, apex_y), radius, int(random.uniform(85, 140)), -1)

    # Apply Gaussian blur for anatomical soft tissue attenuation
    img = cv2.GaussianBlur(img, (9, 9), 3.0)

    # Add realistic radiographic quantum mottle / noise
    noise = np.random.normal(0, 4.5, (size, size)).astype(np.float32)
    final_img = np.clip(img.astype(np.float32) + noise, 0, 255).astype(np.uint8)

    return final_img


def generate_synthetic_dataset(
    output_dir: str | Path,
    num_train_patients: int = 40,
    num_val_patients: int = 10,
    num_test_patients: int = 10,
    images_per_patient: int = 2,
    tb_prevalence: float = 0.4,
    image_size: int = 224,
    seed: int = 42
) -> Dict[str, int]:
    """Builds a complete, multi-split dataset organized by patient ID."""
    base_path = Path(output_dir)
    random.seed(seed)
    np.random.seed(seed)

    splits = [
        ("train", num_train_patients),
        ("validation", num_val_patients),
        ("test", num_test_patients)
    ]

    counts = {"train_total": 0, "val_total": 0, "test_total": 0}
    patient_seq = 1

    for split_name, patient_count in splits:
        split_dir = base_path / split_name
        tb_dir = split_dir / "TB"
        normal_dir = split_dir / "Normal"
        tb_dir.mkdir(parents=True, exist_ok=True)
        normal_dir.mkdir(parents=True, exist_ok=True)

        for _ in range(patient_count):
            patient_id = f"PATIENT_{patient_seq:04d}"
            is_tb = random.random() < tb_prevalence
            target_dir = tb_dir if is_tb else normal_dir

            for view_idx in range(images_per_patient):
                img_arr = generate_chest_xray_image(is_tb=is_tb, size=image_size)
                filename = f"{patient_id}_view{view_idx+1}_{'TB' if is_tb else 'Normal'}.png"
                img_path = target_dir / filename
                Image.fromarray(img_arr).save(img_path)
                counts[f"{split_name[:3]}_total"] = counts.get(f"{split_name[:3]}_total", 0) + 1

            patient_seq += 1

    return counts


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic chest X-ray dataset for TB screening.")
    parser.add_argument("--output-dir", type=str, default="ai_agent/dataset", help="Output directory path")
    parser.add_argument("--train-patients", type=int, default=30)
    parser.add_argument("--val-patients", type=int, default=8)
    parser.add_argument("--test-patients", type=int, default=10)
    args = parser.parse_args()

    counts = generate_synthetic_dataset(
        output_dir=args.output_dir,
        num_train_patients=args.train_patients,
        num_val_patients=args.val_patients,
        num_test_patients=args.test_patients
    )
    print(f"Generated synthetic dataset in '{args.output_dir}': {counts}")
