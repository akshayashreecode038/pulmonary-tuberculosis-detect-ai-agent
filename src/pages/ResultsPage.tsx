import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  ShieldAlert, 
  FileText, 
  Stethoscope,
  Sparkles,
  Activity
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { HeatmapViewer } from '../components/HeatmapViewer';
import { RiskGauge } from '../components/RiskGauge';
import { ZoneCard } from '../components/ZoneCard';
import { ClinicalReportModal } from '../components/ClinicalReportModal';

interface ResultsPageProps {
  result: AnalysisResult | null;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ result }) => {
  const navigate = useNavigate();
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-500">
          <Activity className="h-8 w-8 text-teal-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">No Active Analysis Loaded</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please upload or select a chest X-ray to perform AI tuberculosis detection.
          </p>
        </div>
        <div>
          <Link
            to="/detect"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>Go to Screening Tool</span>
          </Link>
        </div>
      </div>
    );
  }

  const isHigh = result.riskLevel === 'high';
  const isModerate = result.riskLevel === 'moderate';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900">
      
      {/* Top Bar: Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/detect')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>New Scan</span>
          </button>
          
          <div className="h-4 w-px bg-slate-200" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Screening Results &amp; Diagnostic Findings
              </h1>
              <span className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                isHigh 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                  : isModerate 
                  ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {result.riskLevel.toUpperCase()} RISK
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span>Patient: <strong className="text-slate-800">{result.patient.patientId}</strong></span>
              <span>•</span>
              <span>Date: {new Date(result.timestamp).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/20"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Export Clinical Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Grad-CAM Heatmap Viewer */}
        <div className="lg:col-span-7 space-y-6">
          <HeatmapViewer result={result} />

          {/* Detailed Radiographic Observations Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-600" />
              Detailed Radiographic Observations
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
              {result.detailedFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Risk Gauge */}
          <RiskGauge result={result} />

          {/* 4-Zone Anatomical Analysis */}
          <ZoneCard zones={result.zoneBreakdown} />

          {/* Guideline-Directed Next Clinical Steps */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-teal-600" />
              Recommended Clinical Follow-up Pathway
            </h3>
            <div className="space-y-2">
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="font-mono text-teal-700 font-bold shrink-0">{idx + 1}.</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Disclaimer Card */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 flex items-start gap-3 leading-relaxed">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>DECISION SUPPORT NOTICE:</strong> This screening tool is an adjunct assistant and cannot replace microbiological bacteriological confirmation (GeneXpert MTB/RIF, AFB sputum culture).
            </p>
          </div>

        </div>
      </div>

      {/* Clinical Report Export Modal */}
      <ClinicalReportModal
        result={result}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

    </div>
  );
};
