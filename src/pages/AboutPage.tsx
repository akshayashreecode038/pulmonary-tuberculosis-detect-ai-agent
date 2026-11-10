import React from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  ShieldAlert, 
  Layers
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-slate-900">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800">
          <Activity className="h-3.5 w-3.5 text-teal-600" />
          <span>Clinical &amp; Architectural Specifications</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          About TB-Detect AI
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Detailed technical documentation on the convolutional vision architecture, validation benchmarks, 
          Grad-CAM explainability, and clinical screening safety standards.
        </p>
      </div>

      {/* Model Architecture Specs */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-600">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Deep Convolutional Neural Network (DenseNet-121)</h2>
            <p className="text-xs text-slate-500">Backbone feature extractor and multi-scale transfer learning</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          The core model leverages a <strong>DenseNet-121</strong> (Densely Connected Convolutional Network) architecture, 
          pre-trained on ImageNet and fine-tuned on multi-institutional chest radiograph corpora. Dense connections allow each layer 
          to receive feature maps from all prior layers, encouraging feature reuse, mitigating vanishing gradients, and enabling 
          fine-grained recognition of subtle apical fibronodular infiltrates and subtle cavitary wall irregularities.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="font-mono text-teal-700 text-sm font-bold">CLAHE Normalized</span>
            <p className="text-slate-500 text-[11px]">
              Contrast Limited Adaptive Histogram Equalization suppresses thoracic exposure artifacts.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="font-mono text-teal-700 text-sm font-bold">DenseBlock 4</span>
            <p className="text-slate-500 text-[11px]">
              Final feature layer utilized for Grad-CAM gradient backpropagation and saliency extraction.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="font-mono text-teal-700 text-sm font-bold">2048 x 2048 Matrix</span>
            <p className="text-slate-500 text-[11px]">
              High resolution processing preserving small apical micro-calcifications and subtle blunting.
            </p>
          </div>
        </div>
      </section>

      {/* Benchmark Datasets */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Validation &amp; Training Benchmark Datasets</h2>
            <p className="text-xs text-slate-500">Curated datasets from international clinical institutions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900">Shenzhen Hospital Set</h4>
              <span className="rounded bg-teal-50 border border-teal-200 px-1.5 py-0.5 text-[10px] text-teal-800 font-mono font-bold">662 CXRs</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Collected by Guangdong Hospital for TB and Tuberculosis Prevention and Control. Features confirmed clinical pulmonary TB cases with radiologist consensus.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900">Montgomery County Set</h4>
              <span className="rounded bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 text-[10px] text-cyan-800 font-mono font-bold">138 CXRs</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Cooperative collection between Montgomery County (Maryland, USA) Dept of Health and the National Library of Medicine (NLM).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900">NIH ChestX-ray14</h4>
              <span className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[10px] text-indigo-800 font-mono font-bold">112k CXRs</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Hospitalized patient cohort used for multi-label thoracic disease pre-training and negative baseline control calibration.
            </p>
          </div>
        </div>
      </section>

      {/* Grad-CAM Explainable AI Explanation */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Grad-CAM (Gradient-Weighted Class Activation Mapping)</h2>
            <p className="text-xs text-slate-500">Visual interpretability to prevent black-box decision making</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Deep learning models in medicine must provide transparent reasoning. Grad-CAM computes gradients of the target score 
          (Tuberculosis positive) with respect to the final convolutional feature maps. High gradients localize spatial coordinates 
          where the neural network identified suspicious radiographic patterns (e.g. upper lobe cavitation, apical caps, or reticular infiltrates), 
          allowing physicians to confirm that predictions correspond to true anatomical pathology rather than imaging artifacts.
        </p>
      </section>

      {/* Medical Ethics & Decision Support Boundary */}
      <section className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-rose-200 pb-3">
          <ShieldAlert className="h-6 w-6 text-rose-600 shrink-0" />
          <h2 className="text-base font-bold text-rose-950">Clinical Safety Framework &amp; Regulatory Boundaries</h2>
        </div>

        <p className="text-xs sm:text-sm text-rose-900 leading-relaxed">
          Under World Health Organization (WHO) operational handbooks on tuberculosis screening, computer-aided detection (CAD) 
          software is evaluated as a <strong>triaging tool</strong> to select individuals who should undergo confirmatory molecular testing 
          (such as GeneXpert MTB/RIF or Truenat). 
        </p>

        <ul className="text-xs text-rose-800 space-y-1.5 list-disc pl-5">
          <li>TB-Detect AI is not intended to provide a standalone definitive diagnosis.</li>
          <li>All positive screening results require microbiological confirmation prior to chemotherapy initiation.</li>
          <li>In low-resource or high-burden settings, CAD reduces laboratory cartridge workload by pre-filtering non-suspicious cases.</li>
        </ul>
      </section>

    </div>
  );
};
