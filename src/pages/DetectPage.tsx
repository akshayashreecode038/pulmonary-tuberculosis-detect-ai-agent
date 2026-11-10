import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Info
} from 'lucide-react';
import { PatientMetadata, AnalysisResult } from '../types';
import { ImageDropzone } from '../components/ImageDropzone';
import { PipelineScanner } from '../components/PipelineScanner';
import { analyzeChestXray } from '../services/api';

interface DetectPageProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export const DetectPage: React.FC<DetectPageProps> = ({ onAnalysisComplete }) => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [selectedSampleId, setSelectedSampleId] = useState<string | undefined>(undefined);

  const [patientMetadata, setPatientMetadata] = useState<PatientMetadata>({
    patientId: 'PT-' + Math.floor(10000 + Math.random() * 90000),
    patientAge: 42,
    gender: 'unspecified',
    clinicalSymptoms: ['Persistent Cough (> 2 weeks)']
  });

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [overallPercent, setOverallPercent] = useState<number>(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleImageSelected = (
    file: File | null,
    url: string,
    name: string,
    sampleId?: string
  ) => {
    setSelectedFile(file);
    setImageUrl(url);
    setFileName(name);
    setSelectedSampleId(sampleId);
    setAnalysisError(null);
  };

  const handleStartAnalysis = async () => {
    if (!imageUrl) {
      setAnalysisError('Please select or upload a chest X-ray image before running analysis.');
      return;
    }

    setIsAnalyzing(true);
    setCurrentStageIndex(0);
    setOverallPercent(0);
    setAnalysisError(null);

    try {
      const result = await analyzeChestXray(
        selectedFile,
        imageUrl,
        fileName || 'Chest_Radiograph.png',
        patientMetadata,
        selectedSampleId,
        (stageIndex, percent) => {
          setCurrentStageIndex(stageIndex);
          setOverallPercent(percent);
        }
      );

      onAnalysisComplete(result);
      navigate('/results');
    } catch (err: any) {
      console.error('Analysis failed', err);
      setAnalysisError(err.message || 'Analysis processing failed. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-900">
      
      {isAnalyzing ? (
        <PipelineScanner
          currentStageIndex={currentStageIndex}
          overallPercent={overallPercent}
          imageUrl={imageUrl}
          fileName={fileName}
        />
      ) : (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
                <Activity className="h-3.5 w-3.5" />
                <span>Diagnostic Triage Tool</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Chest X-ray Tuberculosis Screening
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Upload a DICOM or high-resolution PA chest radiograph to evaluate for tuberculosis-associated 
                cavitary lesions, apical consolidation, and interstitial infiltrates.
              </p>
            </div>

            {/* Quick Helper Badge */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 flex items-center gap-3 shrink-0 shadow-2xs">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-semibold text-slate-800">HIPAA &amp; Privacy Safe</div>
                <div className="text-[11px] text-slate-400">De-identified client-side processing</div>
              </div>
            </div>
          </div>

          {/* Main Dropzone & Patient Form */}
          <ImageDropzone
            onImageSelected={handleImageSelected}
            patientMetadata={patientMetadata}
            setPatientMetadata={setPatientMetadata}
            selectedSampleId={selectedSampleId}
          />

          {analysisError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3 text-xs text-slate-500 text-center sm:text-left">
              <Info className="h-4 w-4 text-teal-600 shrink-0 hidden sm:block" />
              <span>
                {imageUrl 
                  ? `Radiograph loaded: "${fileName}". Ready for multi-scale DenseNet-121 inference.` 
                  : 'Select an X-ray above or choose a benchmark case to begin analysis.'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartAnalysis}
              disabled={!imageUrl}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold shadow-md transition-all ${
                imageUrl
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-teal-600/25 hover:from-teal-700 hover:to-cyan-700 hover:shadow-teal-600/35 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <Sparkles className="h-4 w-4 fill-current" />
              <span>Analyze Chest Radiograph</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
