"""Pydantic schemas for the FastAPI backend.
Conforms directly to the frontend's TypeScript interfaces and medical specification.
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class PatientMetadataSchema(BaseModel):
    patientId: str = Field(..., description="Anonymized patient identifier")
    patientAge: Optional[int] = Field(default=None, ge=0, le=125)
    gender: Optional[Literal["male", "female", "other", "unspecified"]] = "unspecified"
    clinicalSymptoms: Optional[List[str]] = Field(default_factory=list)
    notes: Optional[str] = None


class LungZoneResultSchema(BaseModel):
    zone: Literal["Right Upper Lobe", "Right Mid/Lower Lobe", "Left Upper Lobe", "Left Mid/Lower Lobe"]
    abnormalProbability: float = Field(..., ge=0.0, le=1.0)
    status: Literal["Clear", "Suspicious Infiltrate", "Cavitary Anomaly", "Consolidation"]
    findingDescription: str


class HeatmapCoordinateSchema(BaseModel):
    x: float = Field(..., ge=0.0, le=100.0, description="Center x position as percentage")
    y: float = Field(..., ge=0.0, le=100.0, description="Center y position as percentage")
    radius: float = Field(..., ge=0.0, le=100.0, description="Radius percentage")
    intensity: float = Field(..., ge=0.0, le=1.0)
    label: str


class QualityMetricsSchema(BaseModel):
    resolution: str
    exposureScore: Literal["Optimal", "Under-exposed", "Over-exposed"]
    inhalationAssessment: Literal["Adequate", "Sub-optimal"]
    claheApplied: bool


class ModelInfoSchema(BaseModel):
    version: str
    backbone: str
    isFineTunedTB: bool
    inferenceLatencyMs: float


class AnalysisResultSchema(BaseModel):
    id: str
    timestamp: str
    patient: PatientMetadataSchema
    imageUrl: str
    originalFileName: str
    tbProbability: float = Field(..., ge=0.0, le=1.0, description="Model score (sigmoid output)")
    confidenceScore: float = Field(..., ge=0.0, le=1.0)
    decisionThreshold: float = Field(..., ge=0.0, le=1.0)
    riskLevel: Literal["low", "moderate", "high"]
    prediction: Literal["TB-suspected", "TB-not-suspected"]
    primaryFinding: str
    detailedFindings: List[str]
    zoneBreakdown: List[LungZoneResultSchema]
    heatmapCoordinates: List[HeatmapCoordinateSchema]
    recommendations: List[str]
    qualityMetrics: QualityMetricsSchema
    modelInfo: Optional[ModelInfoSchema] = None
    disclaimer: str


class ThresholdUpdateRequest(BaseModel):
    threshold: float = Field(..., ge=0.0, le=1.0, description="New operational decision threshold")


class ThresholdUpdateResponse(BaseModel):
    status: str
    previousThreshold: float
    newThreshold: float
    message: str
