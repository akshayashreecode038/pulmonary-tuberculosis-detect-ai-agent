import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Activity, Gauge } from 'lucide-react';
import { AnalysisResult } from '../types';

interface RiskGaugeProps {
  result: AnalysisResult;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ result }) => {
  const probPercent = Math.round(result.tbProbability * 100);
  const confPercent = Math.round(result.confidenceScore * 100);
  const isHigh = result.riskLevel === 'high';
  const isModerate = result.riskLevel === 'moderate';
  const isLow = result.riskLevel === 'low';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-sm text-slate-900">
      
      {/* Primary Triage Status Header Banner */}
      <div className={`rounded-xl p-4 border flex items-start justify-between gap-4 ${
        isHigh 
          ? 'bg-rose-50 border-rose-200 text-rose-950' 
          : isModerate 
          ? 'bg-amber-50 border-amber-200 text-amber-950' 
          : 'bg-emerald-50 border-emerald-200 text-emerald-950'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            isHigh ? 'bg-rose-100 text-rose-700' : isModerate ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {isHigh && <ShieldAlert className="h-5 w-5" />}
            {isModerate && <AlertTriangle className="h-5 w-5" />}
            {isLow && <CheckCircle2 className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase opacity-80">
                Screening Assessment
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              <span className="text-xs font-mono font-bold">
                {isHigh ? 'PRIORITY TRIAGE' : isModerate ? 'FURTHER REVIEW' : 'ROUTINE'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              {isHigh 
                ? 'High Suspicion for Tuberculosis' 
                : isModerate 
                ? 'Moderate / Indeterminate Anomaly' 
                : 'Low Suspicion / No TB Patterns Detected'}
            </h2>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              {result.primaryFinding}
            </p>
          </div>
        </div>
      </div>

      {/* Quantitative Gauges & Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* TB Probability Meter */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Activity className="h-4 w-4 text-teal-600" />
              TB Pattern Probability
            </span>
            <span className="font-mono text-[11px]">Threshold: &gt;50%</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`font-mono text-3xl font-extrabold tracking-tight ${
              isHigh ? 'text-rose-700' : isModerate ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {probPercent}%
            </span>
            <span className="text-xs text-slate-500">likelihood</span>
          </div>

          {/* Probability Progress Bar */}
          <div className="relative h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                isHigh ? 'bg-rose-600' : isModerate ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.max(probPercent, 4)}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0% (Clear)</span>
            <span>50% (Borderline)</span>
            <span>100% (High)</span>
          </div>
        </div>

        {/* Model Confidence Metric */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Gauge className="h-4 w-4 text-teal-600" />
              AI Model Confidence
            </span>
            <span className="font-mono text-[11px]">Softmax Entropy</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-teal-700 tracking-tight">
              {confPercent}%
            </span>
            <span className="text-xs text-slate-500">certainty score</span>
          </div>

          <div className="relative h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-1000"
              style={{ width: `${confPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Low Certainty</span>
            <span>High Reliability</span>
          </div>
        </div>
      </div>

      {/* Radiographic Exposure & Pre-processing Quality */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Diagnostic Quality:</span>
          <span className="rounded bg-white border border-slate-200 px-2 py-0.5 font-mono text-[11px] text-slate-700">
            {result.qualityMetrics.exposureScore}
          </span>
          <span className="rounded bg-white border border-slate-200 px-2 py-0.5 font-mono text-[11px] text-slate-700">
            Inspiration: {result.qualityMetrics.inhalationAssessment}
          </span>
          <span className="rounded bg-teal-50 border border-teal-200 px-2 py-0.5 font-mono text-[11px] text-teal-800 font-semibold">
            CLAHE: Active
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          ID: {result.id}
        </span>
      </div>
    </div>
  );
};
