"""Command-Line Interface (CLI) to run the Tuberculosis Detection AI Agent on any chest X-ray.

Usage:
    python run_agent.py [path_to_xray_image] [--threshold 0.45] [--save-heatmap]

Example:
    python run_agent.py ai_agent/dataset/test/TB/PATIENT_0039_view1_TB.png --save-heatmap
"""

from pathlib import Path
import argparse
import sys
from PIL import Image

from ai_agent.inference.predictor import TBPredictor
from ai_agent.core.config import CONFIG


def main():
    parser = argparse.ArgumentParser(description="Run TB Detection AI Agent on a Chest X-ray image.")
    parser.add_argument("image_path", nargs="?", default=None, help="Path to chest X-ray image file (PNG/JPEG/TIFF)")
    parser.add_argument("--threshold", type=float, default=0.45, help="Decision threshold (default: 0.45)")
    parser.add_argument("--checkpoint", type=str, default="ai_agent/models_ckpt/tb_densenet121_best.pt", help="Model checkpoint path")
    parser.add_argument("--save-heatmap", action="store_true", help="Save Grad-CAM overlay image to disk")
    args = parser.parse_args()

    # If no image path is provided, find a sample from the test dataset
    if args.image_path is None:
        sample_candidates = list(Path("ai_agent/dataset/test/TB").glob("*.png"))
        if not sample_candidates:
            sample_candidates = list(Path("ai_agent/dataset/test/Normal").glob("*.png"))
        if not sample_candidates:
            print("Error: No image path provided and no sample dataset found.")
            sys.exit(1)
        image_path = sample_candidates[0]
        print(f"No image specified. Auto-selected test sample: {image_path}")
    else:
        image_path = Path(args.image_path)

    if not image_path.exists():
        print(f"Error: File '{image_path}' does not exist.")
        sys.exit(1)

    print(f"\n==============================================================")
    print(f"       AI AGENT FOR EARLY TUBERCULOSIS DETECTION               ")
    print(f"==============================================================")
    print(f"Input Radiograph   : {image_path.name}")
    print(f"Decision Threshold : {args.threshold:.2f}")

    ckpt = Path(args.checkpoint)
    predictor = TBPredictor(config=CONFIG, checkpoint_path=ckpt if ckpt.exists() else None)
    print(f"Backbone Model     : {predictor.config.model.name.upper()} ({predictor.device.upper()})")

    # Read image bytes
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    # Run AI inference
    print("\nRunning analysis pipeline (Validation -> Preprocessing -> Inference -> Grad-CAM)...")
    result = predictor.predict(
        image_bytes=image_bytes,
        patient_metadata={"patientId": "PT-CLI-DEMO", "patientAge": 48, "gender": "unspecified"},
        custom_threshold=args.threshold,
        original_filename=image_path.name
    )

    # Display results
    print("\n---------------------- SCREENING REPORT ----------------------")
    print(f"Scan ID           : {result['id']}")
    print(f"Timestamp         : {result['timestamp']}")
    print(f"AI Model Score    : {result['tbProbability']:.4f}  (Range 0.0 - 1.0)")
    print(f"Decision Status   : {result['prediction'].upper()}")
    print(f"Triage Risk Level : {result['riskLevel'].upper()}")
    print(f"Confidence Metric : {result['confidenceScore'] * 100:.1f}%")
    print(f"\nPrimary Radiographic Finding:")
    print(f"  -> {result['primaryFinding']}")

    print(f"\nLung Zone Spatial Assessment:")
    for zone in result["zoneBreakdown"]:
        marker = "[!]" if zone["status"] != "Clear" else "[OK]"
        print(f"  {marker} {zone['zone']:<22} : {zone['status']:<20} ({zone['abnormalProbability']*100:.0f}%)")

    print(f"\nImage Quality Assessment:")
    print(f"  * Resolution : {result['qualityMetrics']['resolution']}")
    print(f"  * Exposure   : {result['qualityMetrics']['exposureScore']}")
    print(f"  * Inhalation : {result['qualityMetrics']['inhalationAssessment']}")

    print(f"\nClinical Recommendations (WHO Guidelines):")
    for idx, rec in enumerate(result["recommendations"], 1):
        print(f"  {idx}. {rec}")

    # Optional heatmap save
    if args.save_heatmap and result.get("imageUrl"):
        import base64
        from io import BytesIO
        b64_data = result["imageUrl"].split(",")[-1]
        out_path = Path(f"gradcam_overlay_{image_path.stem}.png")
        with open(out_path, "wb") as fh:
            fh.write(base64.b64decode(b64_data))
        print(f"\nGrad-CAM visual overlay saved to: {out_path.resolve()}")

    print(f"\nMedical Disclaimer:")
    print(f"  {result['disclaimer']}")
    print(f"==============================================================\n")


if __name__ == "__main__":
    main()
