import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, 
  UploadCloud, 
  History, 
  Info, 
  Settings2, 
  Server,
  Sparkles
} from 'lucide-react';
import { ApiConfig } from '../types';
import { getApiConfig } from '../services/api';
import { ApiConfigModal } from './ApiConfigModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(getApiConfig());

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-cyan-700 shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">TB-Detect</span>
                <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-teal-700 border border-teal-200 uppercase">
                  AI Medical
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Pulmonary Tuberculosis Screening Platform
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200/80' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Overview
            </Link>

            <Link
              to="/detect"
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/detect') 
                  ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200/80' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="h-4 w-4 text-teal-600" />
              Screening Tool
            </Link>

            <Link
              to="/history"
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/history') 
                  ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200/80' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <History className="h-4 w-4" />
              Scan History
            </Link>

            <Link
              to="/about"
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/about') 
                  ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200/80' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Info className="h-4 w-4" />
              How It Works
            </Link>
          </nav>

          {/* Right Action Cluster: Mode Indicator & Analyze CTA */}
          <div className="flex items-center gap-3">
            {/* Backend connection pill */}
            <button
              onClick={() => setConfigModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-colors shadow-2xs"
              title="Configure REST API Endpoint or Local Simulation"
            >
              <Server className="h-3.5 w-3.5 text-teal-600" />
              <span className="hidden lg:inline text-[11px] font-mono">
                {apiConfig.useLiveApi ? 'Live API Connected' : 'Clinical Simulator'}
              </span>
              <span className={`h-2 w-2 rounded-full ${apiConfig.useLiveApi ? 'bg-emerald-500 shadow-xs' : 'bg-teal-500'}`} />
              <Settings2 className="h-3 w-3 text-slate-400 hover:text-slate-700 ml-0.5" />
            </button>

            {/* Main CTA */}
            <Link
              to="/detect"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-teal-600/20 hover:from-teal-700 hover:to-cyan-700 hover:shadow-teal-600/30 transition-all active:scale-95"
            >
              <Sparkles className="h-4 w-4 fill-white" />
              <span>Analyze CXR</span>
            </Link>
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="flex md:hidden border-t border-slate-200 bg-white px-4 py-2 justify-around text-xs">
          <Link to="/" className={`py-1 ${isActive('/') ? 'text-teal-600 font-bold' : 'text-slate-600'}`}>Overview</Link>
          <Link to="/detect" className={`py-1 ${isActive('/detect') ? 'text-teal-600 font-bold' : 'text-slate-600'}`}>Analyze</Link>
          <Link to="/history" className={`py-1 ${isActive('/history') ? 'text-teal-600 font-bold' : 'text-slate-600'}`}>History</Link>
          <Link to="/about" className={`py-1 ${isActive('/about') ? 'text-teal-600 font-bold' : 'text-slate-600'}`}>Clinical Model</Link>
        </div>
      </header>

      {/* Backend API Configuration Modal */}
      <ApiConfigModal 
        isOpen={configModalOpen} 
        onClose={() => {
          setConfigModalOpen(false);
          setApiConfig(getApiConfig());
        }} 
      />
    </>
  );
};
