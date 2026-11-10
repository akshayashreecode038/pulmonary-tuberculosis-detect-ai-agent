"""Unified inference predictor for TB Detection AI Agent.
Executes end-to-end pipeline: validation -> preprocessing -> model inference -> Grad-CAM -> structured results.
"""

from datetime import datetime, timezone
import time
import uuid
from typing import Optional, Dict, Any
from pathlib import Path
from PIL import Image
import torch

from ai_agent.core.config import CONFIG, AgentConfig
from ai_agent.core.logging import logger
from ai_agent.core.exceptions import InferenceError
from ai_agent.preprocessing.validation import validate_image_bytes
from ai_agent.preprocessing.pipeline import PreprocessPipeline, default_pipeline
from ai_agent.models.architecture import TBClassifier, build_model
from ai_agent.models.checkpoint import load_checkpoint
from ai_agent.inference.gradcam import GradCAM
from ai_agent.inference.postprocessing import (
    determine_risk_level,
    calculate_zone_breakdown,
    build_clinical_findings
)


class TBPredictor:
    """Production inference engine for Chest Radiograph Tuberculosis Screening."""

    def __init__(
        self,
        config: AgentConfig | None = None,
        model: TBClassifier | None = None,
        checkpoint_path: str | Path | None = None
    ):
        self.config = config or CONFIG
        self.device = self._resolve_device(self.config.inference.device)
        self.pipeline = PreprocessPipeline(
            image_size=self.config.model.image_size,
            clahe_enabled=self.config.inference.clahe_enabled,
            clahe_clip_limit=self.config.inference.clahe_clip_limit,
            clahe_tile_grid=self.config.inference.clahe_tile_grid_size
        )

        # Model initialization
        if model is not None:
            self.model = model
            self.metadata = {"model_version": self.config.model.version, "is_fine_tuned_tb": False}
        elif checkpoint_path and Path(checkpoint_path).exists():
            self.model, self.metadata = load_checkpoint(checkpoint_path, device=self.device)
        else:
            # Build default architecture (pretrained on ImageNet backbone with specialized screening head)
            self.model = build_model(
                backbone=self.config.model.name,
                pretrained=self.config.model.pretrained,
                dropout=self.config.model.dropout_rate
            )
            self.metadata = {
                "model_version": self.config.model.version,
                "backbone": self.config.model.name,
                "is_fine_tuned_tb": False,
                "disclaimer": "Default backbone weights loaded. Requires training on verified TB cohort for definitive clinical deployment."
            }

        self.model.to(self.device)
        self.model.eval()

        # Initialize Grad-CAM
        self.gradcam = GradCAM(self.model)

    def _resolve_device(self, req_device: str) -> str:
        if req_device == "auto":
            return "cuda" if torch.cuda.is_available() else "cpu"
        return req_device

    def set_threshold(self, threshold: float) -> None:
        """Dynamically updates the operational decision threshold."""
        if not (0.0 <= threshold <= 1.0):
            raise ValueError("Threshold must be between 0.0 and 1.0")
        self.config.inference.threshold = threshold

    def predict(
        self,
        image_bytes: bytes,
        patient_metadata: Optional[Dict[str, Any]] = None,
        custom_threshold: Optional[float] = None,
        apply_clahe: Optional[bool] = None,
        original_filename: str = "chest_xray.png"
    ) -> Dict[str, Any]:
        """Executes full clinical analysis on raw chest radiograph bytes.
        
        Returns structured dictionary conforming to both backend requirements and frontend UI schema.
        """
        start_time = time.perf_counter()
        request_id = f"scan-{uuid.uuid4().hex[:12]}"

        # 1. Image Validation
        pil_image, quality_metrics = validate_image_bytes(image_bytes)

        # 2. Centralized Preprocessing
        use_clahe = self.config.inference.clahe_enabled if apply_clahe is None else apply_clahe
        input_tensor, rgb_np = self.pipeline.preprocess_pil(pil_image, apply_clahe_override=use_clahe)
        input_tensor = input_tensor.to(self.device)

        quality_metrics["claheApplied"] = use_clahe

        # 3. Model Forward Pass
        try:
            with torch.no_grad():
                logits = self.model(input_tensor)
                score_tensor = torch.sigmoid(logits)
                raw_score = float(score_tensor.squeeze().cpu().item())
                # Constrain to [0.0, 1.0]
                model_score = max(0.0, min(1.0, raw_score))
        except Exception as e:
            raise InferenceError(f"Model forward pass failed: {str(e)}")

        # 4. Threshold & Risk Stratification
        threshold = custom_threshold if custom_threshold is not None else self.config.inference.threshold
        risk_level = determine_risk_level(model_score, threshold)

        # Calculate confidence metric
        confidence = round(float(abs(model_score - threshold) * 2), 2)
        confidence = min(0.99, max(0.55, confidence))

        # 5. Grad-CAM Saliency Map & Hotspot Coordinates
        try:
            heatmap_2d = self.gradcam.generate_heatmap(input_tensor)
            _, overlay_b64 = self.gradcam.create_overlay_image(rgb_np, heatmap_2d)
            hotspots = self.gradcam.extract_hotspots(heatmap_2d, threshold=0.40)
        except Exception as e:
            logger.warning(f"Grad-CAM generation encountered warning: {e}")
            heatmap_2d = np.zeros((self.config.model.image_size, self.config.model.image_size), dtype=np.float32)
            overlay_b64 = ""
            hotspots = []

        # 6. Lung Zone Quantification & Findings
        zone_breakdown = calculate_zone_breakdown(heatmap_2d, model_score)
        primary_finding, detailed_findings, recommendations = build_clinical_findings(
            model_score, threshold, risk_level, zone_breakdown
        )

        total_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # 7. Privacy-Conscious Technical Telemetry (No patient identifiers in logs)
        logger.info(
            "Completed chest radiograph screening analysis",
            extra={
                "request_id": request_id,
                "execution_time_ms": total_time_ms,
                "device": self.device,
                "image_shape": quality_metrics["resolution"],
                "model_version": self.metadata.get("model_version", "v1.0"),
                "model_score": round(model_score, 4),
                "threshold": threshold,
                "risk_level": risk_level
            }
        )

        # 8. Build structured output conforming to AnalysisResult
        patient_info = {
            "patientId": (patient_metadata or {}).get("patientId", f"PT-{uuid.uuid4().hex[:6].upper()}"),
            "patientAge": (patient_metadata or {}).get("patientAge", 45),
            "gender": (patient_metadata or {}).get("gender", "unspecified"),
            "clinicalSymptoms": (patient_metadata or {}).get("clinicalSymptoms", []),
            "notes": (patient_metadata or {}).get("notes", "")
        }

        result = {
            "id": request_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "patient": patient_info,
            "imageUrl": overlay_b64 if overlay_b64 else "",
            "originalFileName": original_filename,
            "tbProbability": round(model_score, 4),
            "confidenceScore": confidence,
            "decisionThreshold": threshold,
            "riskLevel": risk_level,
            "prediction": "TB-suspected" if model_score >= threshold else "TB-not-suspected",
            "primaryFinding": primary_finding,
            "detailedFindings": detailed_findings,
            "zoneBreakdown": zone_breakdown,
            "heatmapCoordinates": hotspots,
            "recommendations": recommendations,
            "qualityMetrics": quality_metrics,
            "modelInfo": {
                "version": self.metadata.get("model_version", "v1.0"),
                "backbone": self.metadata.get("backbone", "densenet121"),
                "isFineTunedTB": self.metadata.get("is_fine_tuned_tb", False),
                "inferenceLatencyMs": total_time_ms
            },
            "disclaimer": "AI-assisted screening tool. This result does not constitute a definitive medical diagnosis. Confirmatory microbiological testing (GeneXpert/AFB) is recommended for positive or symptomatic cases."
        }

        return result
