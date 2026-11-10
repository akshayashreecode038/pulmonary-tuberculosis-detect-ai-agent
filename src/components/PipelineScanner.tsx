import React from 'react';
import { Activity, CheckCircle2 } from 'lucide-react';
import { PIPELINE_STAGES } from '../services/api';

interface PipelineScannerProps {
  currentStageIndex: number;
  overallPercent: number;
  imageUrl: string;
  fileName: string;
}

export const PipelineScanner: React.FC<PipelineScannerProps> = ({
  currentStageIndex,
  overallPercent,
  imageUrl,
  fileName
}) => {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-8 text-slate-900">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800">
          <Activity className="h-3.5 w-3.5 animate-pulse text-teal-600" />
          <span>Clinical Inference Pipeline in Progress</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Analyzing Chest Radiograph for TB Biomarkers
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Evaluating parenchymal densities, apical cavitations, and hilar architectural changes
        </p>
      </div>

      {/* Centerpiece: Scanned Image with Radar Beam Sweep */}
      <div className="relative mx-auto h-64 w-52 overflow-hidden rounded-2xl border-2 border-teal-500/50 bg-black shadow-lg">
        <img 
          src={imageUrl} 
          alt="CXR Scanning" 
          className="h-full w-full object-contain filter contrast-125"
        />

        {/* Animated Radar Scanning Line */}
        <div className="absolute inset-0 pointer-events-none radar-sweep" />

        {/* Target Reticles */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded bg-slate-900/90 px-2 py-0.5 text-[9px] font-mono text-teal-400 border border-slate-700">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping" />
          SCANNING: {fileName.substring(0, 16)}...
        </div>

        <div className="absolute bottom-2 right-2 rounded bg-slate-900/90 px-2 py-0.5 text-[9px] font-mono text-teal-400 border border-slate-700">
          {overallPercent}%
        </div>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Pipeline Progression
          </span>
          <span className="font-mono text-sm font-bold text-teal-700">
            {overallPercent}%
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Multi-Stage Visual Pipeline */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Inference Architecture Steps
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;

            return (
              <div
                key={stage.id}
                className={`flex items-start gap-3 rounded-xl border p-3 transition-all ${
                  isCurrent
                    ? 'border-teal-500 bg-teal-50/70 shadow-xs ring-1 ring-teal-400'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-200 bg-slate-50/60 opacity-60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  {isCurrent && (
                    <div className="h-4 w-4 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
                  )}
                  {isPending && (
                    <div className="h-4 w-4 rounded-full border border-slate-300 bg-slate-200" />
                  )}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <h5 className={`text-xs font-semibold truncate ${
                    isCurrent ? 'text-teal-900' : isCompleted ? 'text-emerald-900' : 'text-slate-600'
                  }`}>
                    {stage.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 line-clamp-1 leading-tight">
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
