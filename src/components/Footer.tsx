import React from 'react';
import { ShieldAlert, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 no-print">
      {/* Prominent Clinical Disclaimer Strip */}
      <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-3">
        <div className="mx-auto max-w-7xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong className="text-amber-950 font-bold">MANDATORY CLINICAL &amp; RESEARCH DISCLAIMER:</strong>{' '}
            TB-Detect AI is engineered exclusively as a clinical screening and triaging support assistant. 
            It is not certified as an autonomous medical diagnostic device and does not substitute for standard 
            microbiological evaluation (such as sputum GeneXpert MTB/RIF or AFB smear) or direct interpretation 
            by a licensed radiologist or healthcare provider.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Platform info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-xs shadow-xs">
                TB
              </div>
              <span className="font-bold text-slate-900 text-base">TB-Detect AI</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-mono border border-slate-200">v2.4-MED</span>
            </div>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              Deep convolutional neural network architecture tailored for early detection of parenchymal, 
              cavitary, and infiltrative manifestations of Pulmonary Tuberculosis on posterior-anterior (PA) chest radiographs.
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-slate-400 font-medium">
              <span>DICOM Ready</span>
              <span>•</span>
              <span>Grad-CAM Saliency</span>
              <span>•</span>
              <span>Multi-zone Triaging</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Clinical Workflow</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/detect" className="hover:text-teal-700 transition-colors">Chest X-Ray Analysis</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-teal-700 transition-colors">Screening History Archive</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-700 transition-colors">Deep Learning Specifications</Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-teal-700 transition-colors">Quality Control Standards</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Medical Datasets & Reference */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Validation Datasets</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="hover:text-slate-900">
                <span>Shenzhen Hospital CXR Set</span>
              </li>
              <li className="hover:text-slate-900">
                <span>Montgomery County TB Set</span>
              </li>
              <li className="hover:text-slate-900">
                <span>NIH ChestX-ray14 Benchmark</span>
              </li>
              <li className="text-slate-400">
                <span>WHO TB Screening Guidelines</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} TB-Detect AI Medical Systems. Engineered for clinical screening support.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-600">
              <HeartHandshake className="h-3.5 w-3.5 text-rose-500" />
              Patient-First Design
            </span>
            <span>•</span>
            <span>Zero PHI Retention Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
