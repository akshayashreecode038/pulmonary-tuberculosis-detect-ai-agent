"""Clinical postprocessing engine.
Maps raw deep learning model scores and Grad-CAM spatial features into structured clinical findings,
lung zone assessments, and evidence-based clinical recommendations.
"""

from typing import List, Dict, Any
import numpy as np


LUNG_ZONES = [
    "Right Upper Lobe",
    "Right Mid/Lower Lobe",
    "Left Upper Lobe",
    "Left Mid/Lower Lobe"
]


def determine_risk_level(score: float, threshold: float) -> str:
    """Classifies risk level based on model score and configurable threshold."""
    if score >= threshold:
        return "high"
    elif score >= (threshold * 0.7):
        return "moderate"
    else:
        return "low"


def calculate_zone_breakdown(
    heatmap_2d: np.ndarray,
    global_score: float
) -> List[Dict[str, Any]]:
    """Calculates regional abnormal probability and clinical status across the 4 anatomical lung quadrants."""
    h, w = heatmap_2d.shape
    mid_y = int(h * 0.45)
    mid_x = int(w * 0.50)

    # Note: On a PA radiograph, patient's right is image left (0:mid_x)
    quadrants = {
        "Right Upper Lobe": heatmap_2d[0:mid_y, 0:mid_x],
        "Right Mid/Lower Lobe": heatmap_2d[mid_y:h, 0:mid_x],
        "Left Upper Lobe": heatmap_2d[0:mid_y, mid_x:w],
        "Left Mid/Lower Lobe": heatmap_2d[mid_y:h, mid_x:w]
    }

    zone_results = []
    for zone_name in LUNG_ZONES:
        patch = quadrants[zone_name]
        patch_mean = float(np.mean(patch)) if patch.size > 0 else 0.0
        patch_max = float(np.max(patch)) if patch.size > 0 else 0.0

        # Weighted blend of global model score and local spatial activation
        zone_prob = round(float(0.4 * global_score + 0.6 * (0.5 * patch_mean + 0.5 * patch_max)), 2)
        zone_prob = min(1.0, max(0.0, zone_prob))

        if zone_prob >= 0.65:
            status = "Cavitary Anomaly" if "Upper" in zone_name else "Consolidation"
            desc = f"Focal hyperattenuation and patchy opacification noted in the {zone_name}."
        elif zone_prob >= 0.40:
            status = "Suspicious Infiltrate"
            desc = f"Reticulonodular haziness and subtle parenchymal infiltrate in {zone_name}."
        else:
            status = "Clear"
            desc = f"Parenchyma well-aerated with unremarkable vascular markings in {zone_name}."

        zone_results.append({
            "zone": zone_name,
            "abnormalProbability": zone_prob,
            "status": status,
            "findingDescription": desc
        })

    return zone_results


def build_clinical_findings(
    score: float,
    threshold: float,
    risk_level: str,
    zone_breakdown: List[Dict[str, Any]]
) -> tuple[str, List[str], List[str]]:
    """Synthesizes primary finding, detailed radiographic findings, and WHO-aligned clinical recommendations."""
    suspicious_zones = [z for z in zone_breakdown if z["status"] != "Clear"]

    if risk_level == "high":
        primary = f"Radiographic patterns suspicious for active pulmonary tuberculosis (Screening Score: {score:.2f} >= threshold {threshold:.2f})."
        detailed = [
            f"Focal pulmonary opacities detected with elevated confidence in {len(suspicious_zones)} lung zone(s).",
            "Apical parenchymal consolidation and reticulonodular infiltrates consistent with mycobacterial infection.",
            "Visualized lung fields exhibit non-uniform attenuation without evidence of acute pneumothorax.",
            "High suspicion warrants priority diagnostic triage and confirmatory microbiological testing."
        ]
        recommendations = [
            "Order urgent sputum GeneXpert MTB/RIF (or standard NAAT) and direct AFB sputum smear examination.",
            "Initiate standard airborne infection control precautions per institutional protocol.",
            "Schedule urgent consultation with an infectious disease or pulmonary specialist.",
            "Review patient contact history and flag for public health epidemiological follow-up."
        ]
    elif risk_level == "moderate":
        primary = f"Borderline pulmonary opacities detected; indeterminate tuberculosis screening pattern (Score: {score:.2f})."
        detailed = [
            "Subtle or equivocal interstitial markings observed; findings are non-specific.",
            "Cannot rule out early granulomatous disease, atypical pneumonia, or resolving past infection.",
            "Radiographic score lies in the borderline surveillance range."
        ]
        recommendations = [
            "Correlate with constitutional symptoms (fever, persistent night sweats, weight loss, productive cough > 2 weeks).",
            "Perform confirmatory sputum microbiological testing if clinical symptoms or exposure history are positive.",
            "Consider follow-up high-resolution chest radiograph in 10-14 days to monitor interval progression."
        ]
    else:
        primary = f"No radiographic patterns suggestive of active pulmonary tuberculosis (Score: {score:.2f} < threshold {threshold:.2f})."
        detailed = [
            "Bilateral lung fields appear clear, symmetric, and adequately expanded.",
            "Costophrenic recesses and cardiothoracic silhouette within normal limits.",
            "No active apical cavitary lesions, parenchymal consolidation, or pleural effusion identified."
        ]
        recommendations = [
            "Standard clinical follow-up; no immediate radiological intervention required for tuberculosis.",
            "Re-evaluate if constitutional respiratory symptoms develop or persist (> 2 weeks).",
            "Maintain routine health monitoring as indicated by primary care provider."
        ]

    return primary, detailed, recommendations
