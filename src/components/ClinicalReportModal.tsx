import React from 'react';
import { X, Printer, ShieldAlert, FileText } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ClinicalReportModalProps {
  result: AnalysisResult;
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  result,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isHigh = result.riskLevel === 'high';
  const isModerate = result.riskLevel === 'moderate';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-300 bg-white shadow-2xl text-slate-900 my-8">
        
        {/* Top bar with Print and Close */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 no-print bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-teal-600" />
            <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
              Clinical Screening Report Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-6 sm:p-8 space-y-6 bg-white text-slate-900 rounded-b-2xl print:p-0">
          
          {/* Header */}
          <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                  TB
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  TB-Detect AI Medical Systems
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Computer-Assisted Pulmonary Tuberculosis Screening &amp; Decision Support
              </p>
            </div>
            <div className="text-right text-xs font-mono text-slate-500">
              <div>REPORT #{result.id}</div>
              <div>{new Date(result.timestamp).toLocaleDateString()} {new Date(result.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>

          {/* Patient Demographics & Exam Info Table */}
          <div className="rounded-xl border border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50">
            <div>
              <span className="block text-slate-500 font-medium">Patient ID:</span>
              <span className="font-mono font-bold text-slate-900">{result.patient.patientId}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium">Age / Gender:</span>
              <span className="font-medium text-slate-900">
                {result.patient.patientAge ? `${result.patient.patientAge} yrs` : 'N/A'} / {result.patient.gender || 'N/A'}
              </span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium">Exam Modality:</span>
              <span className="font-mono text-slate-900">Chest Radiograph (PA View)</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium">Image Reference:</span>
              <span className="font-mono text-slate-900 truncate block">{result.originalFileName}</span>
            </div>
          </div>

          {/* Primary Screening Assessment Box */}
          <div className={`rounded-xl p-4 border ${
            isHigh 
              ? 'bg-rose-50 border-rose-200 text-rose-950' 
              : isModerate 
              ? 'bg-amber-50 border-amber-200 text-amber-950' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center justify-between mb-1 text-xs font-semibold uppercase tracking-wider">
              <span>Overall Triage Status</span>
              <span className="font-mono">
                Probability: {Math.round(result.tbProbability * 100)}% | Model Confidence: {Math.round(result.confidenceScore * 100)}%
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {result.primaryFinding}
            </h3>
          </div>

          {/* Detailed Radiographic Observations */}
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold uppercase tracking-wider text-slate-800">
              Detailed AI Radiographic Observations
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 leading-relaxed">
              {result.detailedFindings.map((finding, idx) => (
                <li key={idx}>{finding}</li>
              ))}
            </ul>
          </div>

          {/* Anatomical Quadrant Matrix */}
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold uppercase tracking-wider text-slate-800">
              Anatomical Lung Zone Evaluation
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-2.5">Lung Zone</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Anomaly Score</th>
                    <th className="p-2.5">Observed Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {result.zoneBreakdown.map((z, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="p-2.5 font-medium text-slate-900">{z.zone}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          z.status === 'Clear' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'
                        }`}>
                          {z.status}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-800">{Math.round(z.abnormalProbability * 100)}%</td>
                      <td className="p-2.5 text-slate-600">{z.findingDescription}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommended Next Clinical Steps */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
            <h4 className="font-semibold uppercase tracking-wider text-teal-800">
              Guideline-Directed Clinical Follow-up Pathway
            </h4>
            <ul className="list-decimal pl-5 space-y-1 text-slate-700">
              {result.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>

          {/* Medical Disclaimer & Signature Block */}
          <div className="border-t border-slate-200 pt-4 space-y-4 text-[11px] text-slate-500">
            <div className="flex items-start gap-2 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>SCREENING DISCLAIMER:</strong> This AI-generated assessment is an adjunct decision-support tool. 
                It does not constitute a final diagnosis. Sputum smear microscopy, GeneXpert molecular testing, or 
                confirmatory radiologist review is mandatory before initiating chemotherapy or anti-tuberculosis therapy.
              </p>
            </div>

            <div className="flex justify-between pt-6 border-t border-dashed border-slate-300">
              <div>
                <div className="h-8 border-b border-slate-400 w-48 mb-1" />
                <span className="text-slate-600">Reviewing Clinician Signature</span>
              </div>
              <div className="text-right">
                <div className="h-8 border-b border-slate-400 w-36 mb-1" />
                <span className="text-slate-600">Date &amp; License Number</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
