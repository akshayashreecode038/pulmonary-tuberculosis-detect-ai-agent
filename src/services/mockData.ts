import { AnalysisResult, SampleCase } from '../types';
import { generateSyntheticCXR } from './cxrGenerator';

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'sample-tb-cavitary',
    title: 'Active Pulmonary TB with Cavitation',
    description: 'Post-primary TB pattern displaying a thick-walled cavitary lesion in the right apical/upper lung zone with adjacent consolidative infiltration.',
    riskCategory: 'high',
    tag: 'TB Suspicion: High',
    filename: 'CXR_TB_POS_RUL_CAVITY_942.dcm',
    imageUrl: generateSyntheticCXR('active_tb_cavitary'),
    mockResult: {
      id: 'res-tb-cav-01',
      timestamp: new Date().toISOString(),
      patient: {
        patientId: 'PT-88219-TB',
        patientAge: 44,
        gender: 'male',
        clinicalSymptoms: ['Productive Cough (>3 wks)', 'Hemoptysis', 'Night Sweats', 'Weight Loss'],
        notes: 'Referred from pulmonary clinic. Suspected reactivation TB.'
      },
      imageUrl: generateSyntheticCXR('active_tb_cavitary'),
      originalFileName: 'CXR_TB_POS_RUL_CAVITY_942.dcm',
      tbProbability: 0.942,
      confidenceScore: 0.961,
      riskLevel: 'high',
      primaryFinding: 'Marked focal anomaly consistent with Right Upper Lobe Cavitary Tuberculosis',
      detailedFindings: [
        'Prominent 2.8 cm thick-walled ring-like radiolucency in Right Upper Lobe (RUL) apical segment.',
        'Extensive surrounding alveolar infiltration and tree-in-bud peribronchial nodularity.',
        'Elevated right hilum suggesting subtle volume loss in the upper lobe.',
        'Left lung field clear of overt cavitary disease or confluent consolidation.',
        'Costophrenic angles sharp; cardiac silhouette within normal limits (CTR < 0.50).'
      ],
      zoneBreakdown: [
        {
          zone: 'Right Upper Lobe',
          abnormalProbability: 0.96,
          status: 'Cavitary Anomaly',
          findingDescription: 'Active cavitary lesion with dense peripheral consolidative halo.'
        },
        {
          zone: 'Right Mid/Lower Lobe',
          abnormalProbability: 0.32,
          status: 'Suspicious Infiltrate',
          findingDescription: 'Minor bronchovascular accentuation; no discrete consolidation.'
        },
        {
          zone: 'Left Upper Lobe',
          abnormalProbability: 0.14,
          status: 'Clear',
          findingDescription: 'No focal airspace disease or apical capping.'
        },
        {
          zone: 'Left Mid/Lower Lobe',
          abnormalProbability: 0.08,
          status: 'Clear',
          findingDescription: 'Normal lung parenchymal attenuation; sharp costophrenic angle.'
        }
      ],
      heatmapCoordinates: [
        { x: 31.6, y: 33.5, radius: 14, intensity: 0.98, label: 'Primary Cavitary Focus (RUL)' },
        { x: 26.0, y: 26.5, radius: 8, intensity: 0.72, label: 'Apical Satellite Infiltrate' },
        { x: 37.0, y: 28.0, radius: 9, intensity: 0.65, label: 'Peribronchial Clustering' }
      ],
      recommendations: [
        'Urgent confirmatory Molecular Testing: GeneXpert MTB/RIF assay on three consecutive morning sputum samples.',
        'Immediate Sputum Smear Microscopy for Acid-Fast Bacilli (AFB).',
        'Place patient on airborne infection isolation precautions pending sputum bacteriological confirmation.',
        'Schedule high-resolution Chest Computed Tomography (HRCT) to evaluate endobronchial dissemination and cavity wall thickness.'
      ],
      qualityMetrics: {
        resolution: '2048 x 2048 px (Full Diagnostic Field)',
        exposureScore: 'Optimal',
        inhalationAssessment: 'Adequate',
        claheApplied: true
      }
    }
  },
  {
    id: 'sample-normal-clear',
    title: 'Normal Adult Chest X-ray',
    description: 'Bilateral lung fields clear and fully expanded. Sharp costophrenic angles with normal cardiac contours and no evidence of active or prior TB.',
    riskCategory: 'low',
    tag: 'TB Suspicion: Low (Clear)',
    filename: 'CXR_NORMAL_ADULT_104.png',
    imageUrl: generateSyntheticCXR('normal'),
    mockResult: {
      id: 'res-norm-02',
      timestamp: new Date().toISOString(),
      patient: {
        patientId: 'PT-10492-CHK',
        patientAge: 32,
        gender: 'female',
        clinicalSymptoms: ['Routine Health Clearance / Pre-employment'],
        notes: 'No respiratory complaints. Non-smoker.'
      },
      imageUrl: generateSyntheticCXR('normal'),
      originalFileName: 'CXR_NORMAL_ADULT_104.png',
      tbProbability: 0.038,
      confidenceScore: 0.978,
      riskLevel: 'low',
      primaryFinding: 'No radiographic features suspicious for active or latent Pulmonary Tuberculosis',
      detailedFindings: [
        'Bilateral lung parenchyma unremarkable without focal opacification, cavitation, or consolidation.',
        'Both apices are clear with symmetric clavicular alignment.',
        'Hilar vessels, mediastinal contours, and tracheal air column normal in caliber and position.',
        'Cardiac silhouette size normal; cardiothoracic ratio estimated at 0.44.',
        'Both costophrenic and cardiophrenic sulci are crisp and well-aerated.'
      ],
      zoneBreakdown: [
        {
          zone: 'Right Upper Lobe',
          abnormalProbability: 0.04,
          status: 'Clear',
          findingDescription: 'Clear lung field; no apical pleural thickening or reticular opacities.'
        },
        {
          zone: 'Right Mid/Lower Lobe',
          abnormalProbability: 0.03,
          status: 'Clear',
          findingDescription: 'Normal bronchovascular arborization.'
        },
        {
          zone: 'Left Upper Lobe',
          abnormalProbability: 0.05,
          status: 'Clear',
          findingDescription: 'Aortic knob normal; lung parenchyma clear.'
        },
        {
          zone: 'Left Mid/Lower Lobe',
          abnormalProbability: 0.03,
          status: 'Clear',
          findingDescription: 'Diaphragmatic dome smooth; sulcus sharp.'
        }
      ],
      heatmapCoordinates: [],
      recommendations: [
        'No radiographic evidence of active pulmonary tuberculosis.',
        'Routine clinical follow-up as clinically indicated.',
        'If clinical suspicion persists based on unexplained systemic symptoms, correlate with interferon-gamma release assay (IGRA) or Mantoux TST.'
      ],
      qualityMetrics: {
        resolution: '2048 x 2048 px',
        exposureScore: 'Optimal',
        inhalationAssessment: 'Adequate',
        claheApplied: true
      }
    }
  },
  {
    id: 'sample-tb-bilateral',
    title: 'Bilateral Reticulonodular TB Pattern',
    description: 'Disseminated patchy reticulonodular opacities across both lung fields, suspicious for active post-primary dissemination or miliary disease.',
    riskCategory: 'high',
    tag: 'TB Suspicion: High (Bilateral)',
    filename: 'CXR_TB_BILATERAL_DISSEM_318.dcm',
    imageUrl: generateSyntheticCXR('bilateral_tb'),
    mockResult: {
      id: 'res-tb-bilat-03',
      timestamp: new Date().toISOString(),
      patient: {
        patientId: 'PT-99341-MIL',
        patientAge: 51,
        gender: 'female',
        clinicalSymptoms: ['Fever of Unknown Origin', 'Dry Cough', 'Fatigue', 'Anorexia'],
        notes: 'Immunocompromised patient. Urgent screening requested.'
      },
      imageUrl: generateSyntheticCXR('bilateral_tb'),
      originalFileName: 'CXR_TB_BILATERAL_DISSEM_318.dcm',
      tbProbability: 0.884,
      confidenceScore: 0.912,
      riskLevel: 'high',
      primaryFinding: 'Multifocal bilateral micronodular and reticular opacification consistent with Pulmonary TB',
      detailedFindings: [
        'Diffuse bilateral reticulonodular interstitial pattern predominantly affecting middle and upper lung zones.',
        'Bilateral hazy airspace opacities with subtle confluence in left mid-lower lung zones.',
        'Hilar shadows appear mildly accentuated bilaterally; no gross calcification.',
        'Cardiac borders preserved; no blunting of costophrenic recesses.'
      ],
      zoneBreakdown: [
        {
          zone: 'Right Upper Lobe',
          abnormalProbability: 0.82,
          status: 'Suspicious Infiltrate',
          findingDescription: 'Prominent reticular infiltrates and scattered micro-nodules.'
        },
        {
          zone: 'Right Mid/Lower Lobe',
          abnormalProbability: 0.69,
          status: 'Suspicious Infiltrate',
          findingDescription: 'Peribronchial cuffing with interstitial ground-glass haziness.'
        },
        {
          zone: 'Left Upper Lobe',
          abnormalProbability: 0.76,
          status: 'Suspicious Infiltrate',
          findingDescription: 'Patchy nodular opacities extending into axillary subsegment.'
        },
        {
          zone: 'Left Mid/Lower Lobe',
          abnormalProbability: 0.85,
          status: 'Consolidation',
          findingDescription: 'Confluent infiltrative opacity in lingula and retrocardiac zone.'
        }
      ],
      heatmapCoordinates: [
        { x: 30.0, y: 31.4, radius: 12, intensity: 0.86, label: 'Right Infiltrative Focus' },
        { x: 68.3, y: 37.1, radius: 11, intensity: 0.81, label: 'Left Mid-Zone Nodularity' },
        { x: 71.6, y: 55.7, radius: 13, intensity: 0.92, label: 'Left Lower Consolidation' }
      ],
      recommendations: [
        'Rapid GeneXpert MTB/RIF test and AFB smear stained with Ziehl-Neelsen / Auramine-O.',
        'Evaluation for extrapulmonary involvement given bilateral disseminated pattern.',
        'HIV co-infection screening and CD4/viral load assessment.',
        'Consultation with Infectious Disease specialist for guideline-directed standard 4-drug anti-TB regimen initiation.'
      ],
      qualityMetrics: {
        resolution: '1920 x 1920 px',
        exposureScore: 'Optimal',
        inhalationAssessment: 'Adequate',
        claheApplied: true
      }
    }
  },
  {
    id: 'sample-tb-apical',
    title: 'Apical Fibronodular Lesion (Borderline/Moderate)',
    description: 'Indeterminate apical fibronodular opacities in right apex. Requires differentiation between quiescent scarred TB and low-grade active infection.',
    riskCategory: 'moderate',
    tag: 'TB Suspicion: Moderate',
    filename: 'CXR_APICAL_FIBRONODULAR_07.jpg',
    imageUrl: generateSyntheticCXR('apical_nodular'),
    mockResult: {
      id: 'res-tb-apic-04',
      timestamp: new Date().toISOString(),
      patient: {
        patientId: 'PT-41052-IND',
        patientAge: 59,
        gender: 'male',
        clinicalSymptoms: ['Mild Dry Cough', 'Occasional Night Sweats'],
        notes: 'History of heavy smoking; baseline radiograph.'
      },
      imageUrl: generateSyntheticCXR('apical_nodular'),
      originalFileName: 'CXR_APICAL_FIBRONODULAR_07.jpg',
      tbProbability: 0.582,
      confidenceScore: 0.824,
      riskLevel: 'moderate',
      primaryFinding: 'Right Apical fibronodular density; indeterminate activity level',
      detailedFindings: [
        '1.4 cm localized fibronodular opacity in the right lung apex with fine linear extensions.',
        'No patent cavitary defect or fluid meniscus identified.',
        'Mild right apical pleural thickening; left apex completely clear.',
        'No pleural effusion or hilar lymphadenopathy visible.'
      ],
      zoneBreakdown: [
        {
          zone: 'Right Upper Lobe',
          abnormalProbability: 0.68,
          status: 'Suspicious Infiltrate',
          findingDescription: 'Localized fibronodular cluster with architectural retraction.'
        },
        {
          zone: 'Right Mid/Lower Lobe',
          abnormalProbability: 0.18,
          status: 'Clear',
          findingDescription: 'Clear parenchyma without active airspace disease.'
        },
        {
          zone: 'Left Upper Lobe',
          abnormalProbability: 0.12,
          status: 'Clear',
          findingDescription: 'Normal apical architecture.'
        },
        {
          zone: 'Left Mid/Lower Lobe',
          abnormalProbability: 0.09,
          status: 'Clear',
          findingDescription: 'Costophrenic angles sharp; diaphragm normal.'
        }
      ],
      heatmapCoordinates: [
        { x: 30.5, y: 28.0, radius: 10, intensity: 0.74, label: 'Right Apical Fibronodular Zone' }
      ],
      recommendations: [
        'Comparison with prior chest radiographs to assess lesion stability over time.',
        'Induced sputum induction for AFB culture and GeneXpert MTB/RIF.',
        'Consider low-dose thoracic CT scan to rule out early cavitation or calcified granuloma.',
        'Repeat chest radiograph in 6-8 weeks if bacteriological tests are non-conclusive.'
      ],
      qualityMetrics: {
        resolution: '1536 x 2048 px',
        exposureScore: 'Optimal',
        inhalationAssessment: 'Adequate',
        claheApplied: true
      }
    }
  }
];

/**
 * Procedural AI analysis simulation for arbitrary user-uploaded chest radiographs
 */
export function simulateAnalysisForUpload(
  imageUrl: string,
  fileName: string,
  patient: any
): AnalysisResult {
  // Deterministic hash from fileName so repeated uploads of same file produce consistent realistic results
  let hash = 0;
  for (let i = 0; i < fileName.length; i++) {
    hash = (hash << 5) - hash + fileName.charCodeAt(i);
    hash |= 0;
  }
  const positiveMod = Math.abs(hash) % 100;

  // Let approx 50% be suspicious if filename contains tb/positive or randomly distributed
  const isSuspicious =
    fileName.toLowerCase().includes('tb') ||
    fileName.toLowerCase().includes('pos') ||
    fileName.toLowerCase().includes('cavity') ||
    positiveMod > 40;

  if (isSuspicious) {
    const prob = 0.82 + (positiveMod % 15) * 0.01;
    return {
      id: `analysis-${Date.now()}`,
      timestamp: new Date().toISOString(),
      patient: {
        patientId: patient.patientId || `PT-${Math.floor(10000 + Math.random() * 90000)}`,
        patientAge: patient.patientAge || 45,
        gender: patient.gender || 'unspecified',
        clinicalSymptoms: patient.clinicalSymptoms || ['Unspecified Respiratory Symptoms'],
        notes: patient.notes || 'Uploaded CXR evaluation.'
      },
      imageUrl,
      originalFileName: fileName,
      tbProbability: Number(prob.toFixed(3)),
      confidenceScore: 0.935,
      riskLevel: prob > 0.85 ? 'high' : 'moderate',
      primaryFinding: 'High probability of Tuberculosis-associated parenchymal abnormalities',
      detailedFindings: [
        'Focal dense radiopacity detected in upper thoracic field with irregular margins.',
        'Micro-nodular cluster surrounding primary activation focus.',
        'Mild volume reduction noted in upper lung field with architectural distortion.',
        'Contralateral lung field demonstrates mild reactive interstitial changes.'
      ],
      zoneBreakdown: [
        {
          zone: 'Right Upper Lobe',
          abnormalProbability: 0.89,
          status: 'Cavitary Anomaly',
          findingDescription: 'Focal consolidation with potential central excavation.'
        },
        {
          zone: 'Right Mid/Lower Lobe',
          abnormalProbability: 0.28,
          status: 'Clear',
          findingDescription: 'Clear mid-zone vascular branches.'
        },
        {
          zone: 'Left Upper Lobe',
          abnormalProbability: 0.22,
          status: 'Clear',
          findingDescription: 'Subtle apical capping; no overt cavitation.'
        },
        {
          zone: 'Left Mid/Lower Lobe',
          abnormalProbability: 0.12,
          status: 'Clear',
          findingDescription: 'Diaphragmatic contours intact.'
        }
      ],
      heatmapCoordinates: [
        { x: 32.5, y: 32.0, radius: 14, intensity: 0.94, label: 'Primary Detected Focus' },
        { x: 27.0, y: 26.0, radius: 8, intensity: 0.70, label: 'Peribronchial Extension' }
      ],
      recommendations: [
        'Perform sputum GeneXpert MTB/RIF and AFB staining as soon as possible.',
        'Implement respiratory isolation precautions until bacteriological status is ascertained.',
        'Urgent consultation with Pulmonology / Tuberculosis specialist.',
        'Obtain high-resolution chest CT scan for anatomical confirmation.'
      ],
      qualityMetrics: {
        resolution: 'Standard Diagnostic Radiograph',
        exposureScore: 'Optimal',
        inhalationAssessment: 'Adequate',
        claheApplied: true
      }
    };
  } else {
    return {
      id: `analysis-${Date.now()}`,
      timestamp: new Date().toISOString(),
      patient: {
        patientId: patient.patientId || `PT-${Math.floor(10000 + Math.random() * 90000)}`,
        patientAge: patient.patientAge || 35,
        gender: patient.gender || 'unspecified',
        clinicalSymptoms: patient.clinicalSymptoms || ['Routine Screening'],
        notes: patient.notes || 'Routine CXR screening.'
      },
      imageUrl,
      originalFileName: fileName,
      tbProbability: 0.052,
      confidenceScore: 0.968,
      riskLevel: 'low',
      primaryFinding: 'No radiographic patterns associated with Tuberculosis detected',
      detailedFindings: [
        'Lungs are clear and normally expanded without evidence of consolidation or cavitary lesions.',
        'Cardiothoracic ratio normal; hilar and mediastinal contours within standard anatomical limits.',
        'Costophrenic angles sharp and clear bilaterally; no pleural thickening observed.'
      ],
      zoneBreakdown: [
        { zone: 'Right Upper Lobe', abnormalProbability: 0.05, status: 'Clear', findingDescription: 'Clear lung field.' },
        { zone: 'Right Mid/Lower Lobe', abnormalProbability: 0.04, status: 'Clear', findingDescription: 'Unremarkable.' },
        { zone: 'Left Upper Lobe', abnormalProbability: 0.04, status: 'Clear', findingDescription: 'Normal apices.' },
        { zone: 'Left Mid/Lower Lobe', abnormalProbability: 0.03, status: 'Clear', findingDescription: 'Sharp sulcus.' }
      ],
      heatmapCoordinates: [],
      recommendations: [
        'No radiographic signs of active tuberculosis.',
        'Correlate with clinical history and bacteriological testing if patient exhibits ongoing constitutional symptoms.'
      ],
      qualityMetrics: {
        resolution: 'Standard Diagnostic Radiograph',
        exposureScore: 'Optimal',
        inhalationAssessment: 'Adequate',
        claheApplied: true
      }
    };
  }
}
