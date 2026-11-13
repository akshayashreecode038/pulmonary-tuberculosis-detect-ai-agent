"""FastAPI REST API Server for Early Tuberculosis Screening.
Bridges frontend client requests to the deep learning inference engine.
"""

from contextlib import asynccontextmanager
from typing import Optional
import json
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ai_agent.core.config import CONFIG
from ai_agent.core.logging import logger
from ai_agent.core.exceptions import ImageValidationError, InferenceError
from ai_agent.api.schemas import (
    AnalysisResultSchema,
    ThresholdUpdateRequest,
    ThresholdUpdateResponse
)
from ai_agent.inference.predictor import TBPredictor
from ai_agent.training.evaluate import compute_clinical_metrics, format_evaluation_report
from ai_agent.training.synthetic_data import generate_synthetic_dataset
from ai_agent.training.train import run_training

# Singleton predictor instance
predictor: Optional[TBPredictor] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global predictor
    logger.info("Initializing TB Screening AI Predictor...")
    # Check if a trained checkpoint exists, else load transfer learning backbone
    ckpt_path = CONFIG.paths.models_dir / "tb_densenet121_best.pt"
    if ckpt_path.exists():
        predictor = TBPredictor(config=CONFIG, checkpoint_path=ckpt_path)
    else:
        predictor = TBPredictor(config=CONFIG)
    logger.info("TB Screening Predictor initialized successfully.")
    yield
    logger.info("Shutting down TB Screening API...")


app = FastAPI(
    title="TB-Detect-AI: Early Tuberculosis Screening Engine",
    description="AI-assisted chest radiograph analysis and explainable triage API.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local React/Vite dev and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ImageValidationError)
async def image_validation_exception_handler(request, exc: ImageValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "ImageValidationError",
            "message": exc.message,
            "details": exc.details
        }
    )


@app.exception_handler(InferenceError)
async def inference_exception_handler(request, exc: InferenceError):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InferenceError",
            "message": str(exc)
        }
    )


@app.get("/api/health")
async def health_check():
    """System health check and runtime telemetry."""
    return {
        "status": "healthy",
        "service": "tb-detect-ai",
        "model_loaded": predictor is not None,
        "device": predictor.device if predictor else "unknown",
        "model_version": predictor.metadata.get("model_version") if predictor else "none",
        "disclaimer": "AI-assisted screening tool. Not a replacement for definitive microbiological diagnosis."
    }


@app.get("/api/model/info")
async def get_model_info():
    """Returns technical metadata and parameters of the active AI model."""
    if not predictor:
        raise HTTPException(status_code=503, detail="Model predictor not initialized")
    return {
        "architecture": predictor.config.model.name,
        "version": predictor.metadata.get("model_version", "v1.0"),
        "isFineTunedTB": predictor.metadata.get("is_fine_tuned_tb", False),
        "imageSize": predictor.config.model.image_size,
        "activeThreshold": predictor.config.inference.threshold,
        "inputChannels": predictor.config.model.in_channels,
        "claheEnabled": predictor.config.inference.clahe_enabled,
        "explainability": "Grad-CAM (DenseBlock4 convolutional feature gradients)",
        "disclaimer": predictor.metadata.get("disclaimer", "AI-assisted screening system.")
    }


@app.post("/api/model/threshold", response_model=ThresholdUpdateResponse)
async def update_threshold(req: ThresholdUpdateRequest):
    """Dynamically updates the operational decision threshold."""
    if not predictor:
        raise HTTPException(status_code=503, detail="Model predictor not initialized")
    prev = predictor.config.inference.threshold
    predictor.set_threshold(req.threshold)
    logger.info(f"Decision threshold updated: {prev:.3f} -> {req.threshold:.3f}")
    return ThresholdUpdateResponse(
        status="success",
        previousThreshold=prev,
        newThreshold=req.threshold,
        message=f"Threshold updated from {prev:.2f} to {req.threshold:.2f}."
    )


@app.post("/api/predict", response_model=AnalysisResultSchema)
async def predict_chest_xray(
    image: UploadFile = File(..., description="Chest radiograph image (PNG/JPEG/TIFF)"),
    patientId: Optional[str] = Form(None),
    patientAge: Optional[str] = Form(None),
    gender: Optional[str] = Form("unspecified"),
    symptoms: Optional[str] = Form(None),
    threshold: Optional[float] = Form(None)
):
    """Primary inference endpoint for chest radiograph TB screening."""
    if not predictor:
        raise HTTPException(status_code=503, detail="Model predictor is starting up...")

    image_bytes = await image.read()
    if not image_bytes:
        raise ImageValidationError("Uploaded image file is empty.")

    # Parse symptoms if supplied as JSON string
    symptoms_list = []
    if symptoms:
        try:
            parsed = json.loads(symptoms)
            if isinstance(parsed, list):
                symptoms_list = [str(s) for s in parsed]
        except Exception:
            symptoms_list = [s.strip() for s in symptoms.split(",") if s.strip()]

    # Parse age
    age_val = None
    if patientAge:
        try:
            age_val = int(patientAge)
        except Exception:
            age_val = 40

    patient_meta = {
        "patientId": patientId or f"PT-{image.filename[:6]}",
        "patientAge": age_val,
        "gender": gender or "unspecified",
        "clinicalSymptoms": symptoms_list
    }

    result = predictor.predict(
        image_bytes=image_bytes,
        patient_metadata=patient_meta,
        custom_threshold=threshold,
        original_filename=image.filename or "radiograph.png"
    )

    return result


@app.post("/api/train/demo")
async def trigger_demo_training(
    epochs: int = Query(2, ge=1, le=10, description="Demo training epochs"),
    patients: int = Query(20, ge=10, le=100, description="Synthetic patients per cohort")
):
    """Triggers an automated training run on a synthesized leakage-free chest X-ray cohort."""
    dataset_path = CONFIG.paths.base_dir / "dataset"
    generate_synthetic_dataset(
        output_dir=dataset_path,
        num_train_patients=patients,
        num_val_patients=int(patients * 0.25),
        num_test_patients=int(patients * 0.25)
    )

    metrics = run_training(
        config=CONFIG,
        dataset_dir=dataset_path,
        epochs_override=epochs,
        save_checkpoint_name="tb_densenet121_best.pt"
    )

    # Reload predictor with newly trained weights
    global predictor
    predictor = TBPredictor(
        config=CONFIG,
        checkpoint_path=CONFIG.paths.models_dir / "tb_densenet121_best.pt"
    )

    return {
        "status": "completed",
        "epochs": epochs,
        "metrics": metrics,
        "message": "Demo training completed successfully. Model checkpoint updated."
    }
