import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, Key, Globe } from 'lucide-react';
import { ApiConfig } from '../types';
import { getApiConfig, saveApiConfig } from '../services/api';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<ApiConfig>(getApiConfig());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleSave = () => {
    saveApiConfig(config);
    onClose();
  };

  const handleTestConnection = async () => {
    if (!config.useLiveApi) {
      setTestStatus('success');
      setTestMessage('Clinical Simulator active. Full synthetic inference ready.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Pinging backend endpoint...');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      
      const res = await fetch(config.endpointUrl, {
        method: 'OPTIONS',
        signal: controller.signal,
        headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}
      }).catch(async () => {
        return fetch(config.endpointUrl.replace('/predict', '/health'), {
          method: 'GET',
          signal: controller.signal
        });
      });

      clearTimeout(timeout);

      if (res && res.ok) {
        setTestStatus('success');
        setTestMessage('Endpoint reachable! HTTP 200 received from ML inference server.');
      } else {
        setTestStatus('failed');
        setTestMessage(`Server responded with status ${res ? res.status : 'error'}. Ensure CORS is enabled.`);
      }
    } catch (err: any) {
      setTestStatus('failed');
      setTestMessage('Could not connect to backend. Is the Python/FastAPI server running locally on this port?');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-600">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900">Inference Backend Configuration</h3>
              <p className="text-xs text-slate-500">Toggle live REST API or medical simulation mode</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setConfig({ ...config, useLiveApi: false })}
            className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
              !config.useLiveApi
                ? 'border-teal-500 bg-teal-50/70 text-teal-900 ring-1 ring-teal-400'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="font-semibold text-xs text-slate-900">Clinical Simulator</span>
              {!config.useLiveApi && <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />}
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Self-contained mode with real clinical cases &amp; Grad-CAM heatmaps.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setConfig({ ...config, useLiveApi: true })}
            className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
              config.useLiveApi
                ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-1 ring-emerald-400'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="font-semibold text-xs text-slate-900">Live REST API</span>
              {config.useLiveApi && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Connect to your external Python/FastAPI PyTorch ML backend.
            </p>
          </button>
        </div>

        {/* Backend Endpoint Form (Visible when live mode is selected) */}
        {config.useLiveApi && (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 mb-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-teal-600" />
                REST API Predict Endpoint URL
              </label>
              <input
                type="text"
                value={config.endpointUrl}
                onChange={(e) => setConfig({ ...config, endpointUrl: e.target.value })}
                placeholder="http://localhost:8000/api/predict"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <p className="mt-1 text-[10px] text-slate-500">
                Accepts multipart/form-data with image payload <code className="text-teal-700 font-bold">image</code>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-teal-600" />
                API Authorization Token (Optional)
              </label>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="Bearer eyJhbGciOi..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        )}

        {/* Test Connection Button & Status */}
        <div className="mb-5">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testStatus === 'testing' ? 'animate-spin text-teal-600' : ''}`} />
              Test Connection
            </button>
            <span className="text-[11px] text-slate-500">
              Timeout: {config.timeoutMs / 1000}s
            </span>
          </div>

          {testStatus !== 'idle' && (
            <div className={`mt-2.5 flex items-start gap-2 rounded-lg p-2.5 text-xs ${
              testStatus === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : testStatus === 'failed'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {testStatus === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />}
              {testStatus === 'failed' && <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />}
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-teal-600/20 hover:bg-teal-700 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
