import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, 
  Trash2, 
  ArrowRight,
  Search
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { getScanHistory, clearScanHistory } from '../services/api';

interface HistoryPageProps {
  onSelectResult: (result: AnalysisResult) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectResult }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRisk, setFilterRisk] = useState<string>('all');

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the local screening history log?')) {
      clearScanHistory();
      setHistory([]);
    }
  };

  const handleView = (item: AnalysisResult) => {
    onSelectResult(item);
    navigate('/results');
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch = 
      item.patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.primaryFinding.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = filterRisk === 'all' || item.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-900">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
            <History className="h-3.5 w-3.5" />
            <span>Audit &amp; Archival</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Screening Scan History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Local session archive of evaluated chest radiographs and triage classifications
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-100 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Patient ID, filename, or finding..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'high', 'moderate', 'low'].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setFilterRisk(level)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold capitalize transition-colors ${
                filterRisk === level
                  ? 'bg-teal-50 text-teal-800 border border-teal-300 font-bold shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* History List or Empty State */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center space-y-4 shadow-2xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <History className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No screening records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scans performed in this session will automatically appear here with their probability indices and heatmap captures.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const isHigh = item.riskLevel === 'high';
            const isModerate = item.riskLevel === 'moderate';

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  {/* Thumbnail */}
                  <div className="h-16 w-14 shrink-0 rounded-lg overflow-hidden border border-slate-800 bg-black">
                    <img 
                      src={item.imageUrl} 
                      alt={item.originalFileName} 
                      className="h-full w-full object-cover" 
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                        isHigh 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : isModerate 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {item.riskLevel} Risk ({Math.round(item.tbProbability * 100)}%)
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-900">
                        {item.patient.patientId}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                        • {item.originalFileName}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 truncate max-w-xl">
                      {item.primaryFinding}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                      <span>Confidence: {Math.round(item.confidenceScore * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* View Details Action */}
                <button
                  type="button"
                  onClick={() => handleView(item)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all shrink-0 shadow-2xs"
                >
                  <span>Review Analysis</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
