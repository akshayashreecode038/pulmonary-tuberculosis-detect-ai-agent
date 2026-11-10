import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, 
  Layers, 
  SplitSquareVertical, 
  Sliders, 
  RotateCcw, 
  Crosshair, 
  Flame
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface HeatmapViewerProps {
  result: AnalysisResult;
}

export const HeatmapViewer: React.FC<HeatmapViewerProps> = ({ result }) => {
  const [opacity, setOpacity] = useState<number>(0.65);
  const [viewMode, setViewMode] = useState<'overlay' | 'split' | 'original'>('overlay');
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [colormap, setColormap] = useState<'jet' | 'turbo' | 'thermal'>('jet');
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (viewMode === 'original' || result.heatmapCoordinates.length === 0) {
      return;
    }

    result.heatmapCoordinates.forEach((spot) => {
      const centerX = (spot.x / 100) * width;
      const centerY = (spot.y / 100) * height;
      const radius = (spot.radius / 100) * width * 1.8;

      const grad = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );

      if (colormap === 'jet') {
        grad.addColorStop(0, `rgba(239, 68, 68, ${0.95 * spot.intensity})`);
        grad.addColorStop(0.25, `rgba(249, 115, 22, ${0.85 * spot.intensity})`);
        grad.addColorStop(0.5, `rgba(234, 179, 8, ${0.7 * spot.intensity})`);
        grad.addColorStop(0.75, `rgba(6, 182, 212, ${0.4 * spot.intensity})`);
        grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
      } else if (colormap === 'turbo') {
        grad.addColorStop(0, `rgba(220, 38, 38, ${0.98 * spot.intensity})`);
        grad.addColorStop(0.3, `rgba(245, 158, 11, ${0.8 * spot.intensity})`);
        grad.addColorStop(0.6, `rgba(16, 185, 129, ${0.5 * spot.intensity})`);
        grad.addColorStop(0.85, `rgba(14, 165, 233, ${0.25 * spot.intensity})`);
        grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      } else {
        grad.addColorStop(0, `rgba(255, 0, 85, ${0.95 * spot.intensity})`);
        grad.addColorStop(0.4, `rgba(255, 102, 0, ${0.75 * spot.intensity})`);
        grad.addColorStop(0.8, `rgba(0, 220, 255, ${0.35 * spot.intensity})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [result, colormap, viewMode]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm text-slate-900">
      
      {/* Header and Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              Grad-CAM Saliency Visualization
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-mono text-amber-700 border border-amber-200">
                Layer4 Conv Activations
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Neural network attention map highlighting focal pathological features
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('overlay')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors ${
              viewMode === 'overlay'
                ? 'bg-white text-teal-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Overlay
          </button>
          
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-white text-teal-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SplitSquareVertical className="h-3.5 w-3.5" />
            Side-by-Side
          </button>

          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors ${
              viewMode === 'original'
                ? 'bg-white text-teal-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Original
          </button>
        </div>
      </div>

      {/* Main Image Display Viewport (Dark medical stage preserved for radiographic clarity) */}
      <div className={`grid gap-4 ${viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* Primary / Overlay View */}
        <div className="relative mx-auto flex flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-black p-2 shadow-lg">
          <div 
            className="relative max-h-[500px] w-full max-w-[480px] overflow-hidden rounded-lg"
            style={{ filter: isInverted ? 'invert(1) hue-rotate(180deg)' : 'none' }}
          >
            <img 
              src={result.imageUrl} 
              alt="Analyzed Chest X-Ray" 
              className="h-full w-full object-contain select-none"
            />

            {viewMode !== 'original' && (
              <canvas
                ref={canvasRef}
                width={600}
                height={700}
                className="pointer-events-none absolute inset-0 h-full w-full object-contain mix-blend-screen"
                style={{ opacity: opacity }}
              />
            )}

            {showAnnotations && viewMode !== 'original' && result.heatmapCoordinates.map((coord, idx) => (
              <div
                key={idx}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${coord.x}%`,
                  top: `${coord.y}%`,
                  width: `${coord.radius * 2.2}%`,
                  height: `${coord.radius * 2.2}%`,
                }}
              >
                <div className="h-full w-full rounded-full border-2 border-dashed border-rose-400/90 animate-pulse bg-rose-500/20 flex items-center justify-center shadow-lg">
                  <div className="h-2 w-2 rounded-full bg-rose-500" />
                </div>
                
                <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap rounded bg-slate-900/95 px-2 py-0.5 text-[10px] font-semibold text-rose-300 border border-rose-800/80 shadow-md">
                  {coord.label} ({Math.round(coord.intensity * 100)}%)
                </div>
              </div>
            ))}
          </div>

          <div className="absolute top-4 left-4 rounded bg-slate-900/90 px-2 py-1 text-[10px] font-mono text-cyan-300 border border-slate-700 backdrop-blur-xs">
            {viewMode === 'split' ? 'HEATMAP OVERLAY' : 'ACTIVE SCREENING VIEW'}
          </div>
        </div>

        {/* Second Viewport for Side-by-Side Mode */}
        {viewMode === 'split' && (
          <div className="relative mx-auto flex flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-black p-2 shadow-lg">
            <div className="relative max-h-[500px] w-full max-w-[480px] overflow-hidden rounded-lg">
              <img 
                src={result.imageUrl} 
                alt="Baseline Chest X-Ray" 
                className="h-full w-full object-contain select-none"
              />
            </div>
            <div className="absolute top-4 left-4 rounded bg-slate-900/90 px-2 py-1 text-[10px] font-mono text-slate-300 border border-slate-700 backdrop-blur-xs">
              ORIGINAL RADIOGRAPH
            </div>
          </div>
        )}
      </div>

      {/* Interactive Controls Strip */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          
          {/* Opacity Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5 font-medium">
                <Sliders className="h-3.5 w-3.5 text-teal-600" />
                Heatmap Opacity:
              </span>
              <span className="font-mono text-teal-700 font-bold">{Math.round(opacity * 100)}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              disabled={viewMode === 'original'}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          {/* Colormap Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-700 font-medium block">Colormap Palette:</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setColormap('jet')}
                className={`flex-1 rounded-lg py-1 px-2 text-[11px] font-medium border transition-colors ${
                  colormap === 'jet'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 font-semibold shadow-2xs'
                    : 'border-slate-300 bg-white text-slate-600 hover:text-slate-900'
                }`}
              >
                Jet (Medical)
              </button>
              <button
                type="button"
                onClick={() => setColormap('turbo')}
                className={`flex-1 rounded-lg py-1 px-2 text-[11px] font-medium border transition-colors ${
                  colormap === 'turbo'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 font-semibold shadow-2xs'
                    : 'border-slate-300 bg-white text-slate-600 hover:text-slate-900'
                }`}
              >
                Turbo
              </button>
              <button
                type="button"
                onClick={() => setColormap('thermal')}
                className={`flex-1 rounded-lg py-1 px-2 text-[11px] font-medium border transition-colors ${
                  colormap === 'thermal'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 font-semibold shadow-2xs'
                    : 'border-slate-300 bg-white text-slate-600 hover:text-slate-900'
                }`}
              >
                Thermal
              </button>
            </div>
          </div>

          {/* Toggles: Markers, Invert */}
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-medium transition-colors ${
                showAnnotations
                  ? 'border-rose-300 bg-rose-50 text-rose-800 font-semibold'
                  : 'border-slate-300 bg-white text-slate-600 hover:text-slate-900'
              }`}
            >
              <Crosshair className="h-3.5 w-3.5" />
              <span>Target Markers</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInverted(!isInverted)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-medium transition-colors ${
                isInverted
                  ? 'border-amber-300 bg-amber-50 text-amber-800 font-semibold'
                  : 'border-slate-300 bg-white text-slate-600 hover:text-slate-900'
              }`}
              title="Invert radiograph polarity (Black-Bone view)"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Invert</span>
            </button>
          </div>
        </div>

        {/* Grad-CAM Saliency Spectrum Legend */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 pt-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600 font-medium">Saliency Intensity:</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-blue-600 font-medium">Baseline (0.0)</span>
              <div className="h-2 w-28 rounded bg-gradient-to-r from-blue-500 via-cyan-400 via-yellow-400 to-red-500 border border-slate-300" />
              <span className="text-[10px] text-red-600 font-medium">High Activation (1.0)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Heatmap computed from the final convolutional feature maps using Grad-CAM.
          </p>
        </div>
      </div>
    </div>
  );
};
