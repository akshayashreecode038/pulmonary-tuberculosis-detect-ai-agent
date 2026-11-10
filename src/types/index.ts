export type RiskLevel = 'low' | 'moderate' | 'high';

export interface LungZoneResult {
  zone: 'Right Upper Lobe' | 'Right Mid/Lower Lobe' | 'Left Upper Lobe' | 'Left Mid/Lower Lobe';
  abnormalProbability: number;
  status: 'Clear' | 'Suspicious Infiltrate' | 'Cavitary Anomaly' | 'Consolidation';
  findingDescription: string;
}

export interface PatientMetadata {
  patientId: string;
  patientAge?: number;
  gender?: 'male' | 'female' | 'other' | 'unspecified';
  clinicalSymptoms?: string[];
  notes?: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  patient: PatientMetadata;
  imageUrl: string;
  originalFileName: string;
  tbProbability: number; // 0 to 1
  confidenceScore: number; // 0 to 1
  riskLevel: RiskLevel;
  primaryFinding: string;
  detailedFindings: string[];
  zoneBreakdown: LungZoneResult[];
  heatmapCoordinates: {
    x: number; // center percentage (0-100)
    y: number; // center percentage (0-100)
    radius: number; // radius percentage
    intensity: number; // 0-1
    label: string;
  }[];
  recommendations: string[];
  qualityMetrics: {
    resolution: string;
    exposureScore: 'Optimal' | 'Under-exposed' | 'Over-exposed';
    inhalationAssessment: 'Adequate' | 'Sub-optimal';
    claheApplied: boolean;
  };
}

export interface SampleCase {
  id: string;
  title: string;
  description: string;
  riskCategory: RiskLevel;
  tag: string;
  filename: string;
  imageUrl: string;
  mockResult: AnalysisResult;
}

export interface ApiConfig {
  useLiveApi: boolean;
  endpointUrl: string;
  apiKey?: string;
  timeoutMs: number;
}
