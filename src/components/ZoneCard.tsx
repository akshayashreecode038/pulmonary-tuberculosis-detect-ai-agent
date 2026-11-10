import React from 'react';
import { LungZoneResult } from '../types';

interface ZoneCardProps {
  zones: LungZoneResult[];
}

export const ZoneCard: React.FC<ZoneCardProps> = ({ zones }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Anatomical Lung Zone Breakdown
          </h3>
          <p className="text-xs text-slate-500">
            Independent localized neural activation by thoracic quadrant
          </p>
        </div>
        <span className="rounded bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-mono text-teal-800 font-semibold">
          4-Zone Triaging
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {zones.map((z, idx) => {
          const probPercent = Math.round(z.abnormalProbability * 100);
          const isSuspicious = probPercent >= 50;
          const isBorderline = probPercent >= 25 && probPercent < 50;

          return (
            <div
              key={idx}
              className={`rounded-xl border p-3.5 space-y-2.5 transition-all ${
                isSuspicious 
                  ? 'border-rose-200 bg-rose-50/60' 
                  : isBorderline 
                  ? 'border-amber-200 bg-amber-50/60' 
                  : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  {z.zone}
                </span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                  isSuspicious 
                    ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                    : isBorderline 
                    ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {z.status}
                </span>
              </div>

              {/* Probability meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Anomaly Index</span>
                  <span className={isSuspicious ? 'text-rose-700 font-bold' : isBorderline ? 'text-amber-700' : 'text-emerald-700'}>
                    {probPercent}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      isSuspicious ? 'bg-rose-600' : isBorderline ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${probPercent}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {z.findingDescription}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
