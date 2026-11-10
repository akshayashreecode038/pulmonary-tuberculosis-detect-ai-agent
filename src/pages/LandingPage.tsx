import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ArrowRight, 
  Upload, 
  CheckCircle2, 
  Cpu, 
  FileText, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  Flame,
  Server
} from 'lucide-react';
import { generateSyntheticCXR } from '../services/cxrGenerator';

export const LandingPage: React.FC = () => {
  const sampleCxr = generateSyntheticCXR('active_tb_cavitary');

  return (
    <div className="space-y-20 pb-16 text-slate-900">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 lg:pt-24 border-b border-slate-200 bg-gradient-to-b from-white via-teal-50/20 to-slate-50">
        
        {/* Subtle Background Glows */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-teal-500/10 blur-[120px]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800">
                <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
                <span>Deep Learning Diagnostic Decision Support</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                AI-Powered Early Detection of <span className="bg-gradient-to-r from-teal-700 via-cyan-700 to-blue-700 bg-clip-text text-transparent">Tuberculosis</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Analyze chest X-ray images with an AI-assisted screening system designed to identify patterns associated with tuberculosis.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/detect"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-600/25 hover:from-teal-700 hover:to-cyan-700 hover:shadow-teal-600/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Sparkles className="h-4 w-4 fill-white" />
                  <span>Analyze Chest X-ray</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs"
                >
                  <span>How It Works</span>
                </a>
              </div>

              {/* Small Mandatory Disclaimer */}
              <div className="flex items-start gap-2 pt-2 text-xs text-slate-500 max-w-xl mx-auto lg:mx-0">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  This tool is intended for screening/research support and does not replace professional medical evaluation or confirmatory testing.
                </p>
              </div>

              {/* Key Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-left">
                <div>
                  <div className="font-mono text-lg sm:text-xl font-bold text-slate-900">DenseNet-121</div>
                  <div className="text-[11px] text-slate-500">Backbone Architecture</div>
                </div>
                <div>
                  <div className="font-mono text-lg sm:text-xl font-bold text-teal-700">&lt; 3.0s</div>
                  <div className="text-[11px] text-slate-500">Screening Latency</div>
                </div>
                <div>
                  <div className="font-mono text-lg sm:text-xl font-bold text-emerald-700">Grad-CAM</div>
                  <div className="text-[11px] text-slate-500">Explainable AI Maps</div>
                </div>
              </div>

            </div>

            {/* Right Column: Visual Diagram */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
                
                {/* Workflow Visualization Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-teal-600" />
                    <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Screening Pipeline Architecture
                    </span>
                  </div>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-mono text-emerald-800 border border-emerald-200 font-semibold">
                    DIAGNOSTIC PIPELINE
                  </span>
                </div>

                {/* Flow Diagram */}
                <div className="space-y-3">
                  
                  {/* Step 1: CHEST X-RAY Card */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center gap-3">
                    <div className="h-14 w-12 shrink-0 rounded-lg overflow-hidden border border-slate-800 bg-black">
                      <img src={sampleCxr} alt="Chest Radiograph" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. CHEST X-RAY</h4>
                        <span className="text-[10px] font-mono text-teal-700 font-semibold">DICOM / PNG</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        PA upright chest radiograph with CLAHE contrast enhancement
                      </p>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  <div className="flex justify-center text-teal-600">
                    <div className="h-4 w-0.5 bg-gradient-to-b from-teal-500 to-cyan-500" />
                  </div>

                  {/* Step 2: AI ANALYSIS Card */}
                  <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 flex items-center gap-3">
                    <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded-lg bg-teal-100 border border-teal-300 text-teal-700">
                      <Cpu className="h-6 w-6 animate-pulse" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">2. AI ANALYSIS</h4>
                        <span className="text-[10px] font-mono text-amber-700 font-semibold">Grad-CAM Active</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Deep feature extraction &amp; parenchymal anomaly segmentation
                      </p>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  <div className="flex justify-center text-teal-600">
                    <div className="h-4 w-0.5 bg-gradient-to-b from-cyan-500 to-emerald-500" />
                  </div>

                  {/* Step 3: TB SCREENING RESULT Card */}
                  <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 flex items-center gap-3">
                    <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded-lg bg-rose-100 border border-rose-200 text-rose-700">
                      <Flame className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">3. TB SCREENING RESULT</h4>
                        <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-rose-800 border border-rose-300">
                          94.2% Risk
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Right Upper Lobe Cavitary Lesion localized with Saliency Heatmap
                      </p>
                    </div>
                  </div>

                </div>

                {/* Bottom interactive prompt */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Preloaded demo cases available</span>
                  <Link to="/detect" className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1">
                    Try Live Demo <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>

        <div className="h-12" />
      </section>

      {/* "How It Works" Section */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Four-Step Clinical Protocol
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            How It Works
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            From image upload to radiologist-ready visualization, our pipeline is structured for rapid screening and triage.
          </p>
        </div>

        {/* 4 Connected Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* Step 1: Upload */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-600">
                <Upload className="h-6 w-6" />
              </div>
              <span className="font-mono text-2xl font-bold text-slate-300">01</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 1 — Upload</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                User uploads a chest X-ray in standard medical formats (DICOM, PNG, or high-res JPEG).
              </p>
            </div>
            <div className="text-[11px] text-teal-700 font-mono font-medium">
              • Drag &amp; drop or sample case
            </div>
          </div>

          {/* Step 2: Validate */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <span className="font-mono text-2xl font-bold text-slate-300">02</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 2 — Validate</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                The system checks the uploaded image for diagnostic quality, aspect ratio, and proper thoracic field of view.
              </p>
            </div>
            <div className="text-[11px] text-cyan-700 font-mono font-medium">
              • CLAHE contrast normalization
            </div>
          </div>

          {/* Step 3: Analyze */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
                <Cpu className="h-6 w-6" />
              </div>
              <span className="font-mono text-2xl font-bold text-slate-300">03</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 3 — Analyze</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                The image is processed by the AI model. Deep convolutional networks isolate focal cavitations and reticular infiltrates.
              </p>
            </div>
            <div className="text-[11px] text-indigo-700 font-mono font-medium">
              • DenseNet-121 inference engine
            </div>
          </div>

          {/* Step 4: Result */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                <FileText className="h-6 w-6" />
              </div>
              <span className="font-mono text-2xl font-bold text-slate-300">04</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 4 — Result</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                The system displays the model output, Grad-CAM heatmap visualization, lung quadrant breakdown, and follow-up guidance.
              </p>
            </div>
            <div className="text-[11px] text-emerald-700 font-mono font-medium">
              • Exportable clinical report
            </div>
          </div>

        </div>
      </section>

      {/* Key Features Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700">
            System Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Engineered for Clinical Precision
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Combining state-of-the-art vision models with explainable AI to assist physicians in early tuberculosis triaging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">AI-Powered Pattern Recognition</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trained on extensive clinical datasets (Shenzhen, Montgomery County, NIH) to detect micro-nodules, 
              apical caps, and cavitary anomalies characteristic of Mycobacterium tuberculosis.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Grad-CAM Heatmap Localization</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transparent, explainable AI: visualizes exact spatial activations on the radiograph with interactive opacity 
              sliders, side-by-side comparison, and lesion target markers.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">4-Zone Anatomical Triaging</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Provides granular assessments across the Right Upper, Right Mid/Lower, Left Upper, and Left Mid/Lower lung fields 
              to isolate unilateral vs bilateral disease.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">One-Click Clinical Summary</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate standardized, formatted clinical screening reports complete with patient ID, risk scoring, 
              annotated X-ray capture, and reviewing physician signature line.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
              <Server className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">REST API Ready Architecture</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Easily connect to your live Python / FastAPI / PyTorch ML inference endpoint or use the robust 
              built-in clinical simulator with high-fidelity benchmark cases.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Medical Safety Guardrails</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Engineered with clear clinical boundaries: displays confidence intervals, quality flags, 
              and mandatory diagnostic recommendations (GeneXpert MTB/RIF confirmatory testing).
            </p>
          </div>

        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-teal-200 bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 p-8 sm:p-12 text-center space-y-6 shadow-sm relative overflow-hidden">
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Ready to Screen a Chest Radiograph?
            </h2>
            <p className="text-sm text-slate-600">
              Upload your DICOM or PNG file, or explore immediate results using one of our verified clinical TB benchmark cases.
            </p>
          </div>

          <div className="flex justify-center">
            <Link
              to="/detect"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-teal-600/30 hover:bg-teal-700 transition-all transform hover:scale-105 active:scale-95"
            >
              <Sparkles className="h-4 w-4 fill-white" />
              <span>Launch Screening Tool</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
