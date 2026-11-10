import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileCheck, 
  AlertCircle, 
  Image as ImageIcon, 
  Check, 
  User, 
  Stethoscope,
  X
} from 'lucide-react';
import { PatientMetadata, SampleCase } from '../types';
import { SAMPLE_CASES } from '../services/mockData';

interface ImageDropzoneProps {
  onImageSelected: (file: File | null, imageUrl: string, fileName: string, sampleCaseId?: string) => void;
  patientMetadata: PatientMetadata;
  setPatientMetadata: React.Dispatch<React.SetStateAction<PatientMetadata>>;
  selectedSampleId?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageSelected,
  patientMetadata,
  setPatientMetadata,
  selectedSampleId
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeFileName, setActiveFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const symptomOptions = [
    'Persistent Cough (> 2 weeks)',
    'Hemoptysis (Coughing blood)',
    'Nocturnal Diaphoresis (Night sweats)',
    'Unexplained Weight Loss',
    'Low-grade Afternoon Fever',
    'Pleuritic Chest Pain'
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndProcessFile = (file: File) => {
    setValidationError(null);

    const validExtensions = ['image/jpeg', 'image/png', 'image/webp', 'application/dicom'];
    const isDicomExt = file.name.toLowerCase().endsWith('.dcm') || file.name.toLowerCase().endsWith('.dicom');
    
    if (!validExtensions.includes(file.type) && !isDicomExt && !file.type.startsWith('image/')) {
      setValidationError('Unsupported format. Please upload a standard Chest Radiograph (JPEG, PNG, or DICOM .dcm).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setValidationError('File exceeds 25MB maximum diagnostic upload limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const resultUrl = e.target?.result as string;
      setPreviewUrl(resultUrl);
      setActiveFileName(file.name);
      onImageSelected(file, resultUrl, file.name, undefined);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleSelectSample = (sample: SampleCase) => {
    setValidationError(null);
    setPreviewUrl(sample.imageUrl);
    setActiveFileName(sample.filename);
    
    setPatientMetadata({
      patientId: sample.mockResult.patient.patientId,
      patientAge: sample.mockResult.patient.patientAge,
      gender: sample.mockResult.patient.gender,
      clinicalSymptoms: sample.mockResult.patient.clinicalSymptoms,
      notes: sample.mockResult.patient.notes
    });

    onImageSelected(null, sample.imageUrl, sample.filename, sample.id);
  };

  const toggleSymptom = (symptom: string) => {
    const current = patientMetadata.clinicalSymptoms || [];
    if (current.includes(symptom)) {
      setPatientMetadata({
        ...patientMetadata,
        clinicalSymptoms: current.filter(s => s !== symptom)
      });
    } else {
      setPatientMetadata({
        ...patientMetadata,
        clinicalSymptoms: [...current, symptom]
      });
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setActiveFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageSelected(null, '', '', undefined);
  };

  return (
    <div className="space-y-6">
      
      {/* Upload Zone Card */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !previewUrl && fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-6 transition-all text-center ${
          isDragging 
            ? 'border-teal-500 bg-teal-50/50' 
            : previewUrl 
            ? 'border-slate-300 bg-white shadow-xs' 
            : 'border-slate-300 bg-white hover:border-teal-400 hover:bg-teal-50/20 cursor-pointer shadow-2xs'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/png,image/jpeg,image/webp,.dcm,.dicom" 
          onChange={handleFileInputChange}
          className="hidden" 
        />

        {previewUrl ? (
          <div className="relative flex flex-col md:flex-row items-center gap-6 justify-center">
            {/* CXR Preview Frame */}
            <div className="relative h-60 w-52 overflow-hidden rounded-xl border border-slate-800 bg-black shadow-md">
              <img 
                src={previewUrl} 
                alt="Selected Chest Radiograph" 
                className="h-full w-full object-contain"
              />
              <div className="absolute top-2 left-2 rounded bg-slate-900/90 px-1.5 py-0.5 text-[9px] font-mono text-teal-400 border border-slate-700">
                PREVIEW
              </div>
            </div>

            {/* Selected File Details */}
            <div className="text-left space-y-2 max-w-xs">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                <FileCheck className="h-4 w-4" />
                <span>Radiograph Loaded &amp; Validated</span>
              </div>
              <h4 className="font-mono text-sm font-semibold text-slate-900 truncate" title={activeFileName}>
                {activeFileName}
              </h4>
              <p className="text-xs text-slate-500">
                Ready for deep learning inference &amp; Grad-CAM saliency localization.
              </p>
              
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                >
                  Change File
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200 text-teal-600">
              <UploadCloud className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Drag and drop a Chest X-ray (PA View)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Supports DICOM (.dcm), High-Res PNG, JPEG (up to 25MB)
              </p>
            </div>
            <div className="pt-2">
              <button 
                type="button"
                className="rounded-xl bg-slate-100 border border-slate-300 px-4 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-colors shadow-2xs"
              >
                Browse Local Files
              </button>
            </div>
          </div>
        )}

        {validationError && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Preset Medical Benchmark Cases */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-teal-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Or Test With Benchmark Medical Cases
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            1-Click instant test radiograph
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_CASES.map((sample) => {
            const isSelected = selectedSampleId === sample.id || activeFileName === sample.filename;
            const isHighRisk = sample.riskCategory === 'high';
            const isLowRisk = sample.riskCategory === 'low';

            return (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`group relative cursor-pointer rounded-xl border p-3 transition-all ${
                  isSelected 
                    ? 'border-teal-500 bg-teal-50/70 shadow-xs ring-1 ring-teal-400' 
                    : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <div className="flex gap-3 items-start">
                  {/* Thumbnail */}
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-black">
                    <img 
                      src={sample.imageUrl} 
                      alt={sample.title} 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-teal-600/30 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white drop-shadow" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase ${
                      isHighRisk 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : isLowRisk 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {sample.riskCategory === 'high' ? 'TB Suspicious' : sample.riskCategory === 'low' ? 'Normal CXR' : 'Borderline'}
                    </span>
                    <h5 className="text-xs font-semibold text-slate-900 truncate">
                      {sample.title}
                    </h5>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                      {sample.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Patient Demographic & Clinical Context */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <User className="h-4 w-4 text-teal-600" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Patient Demographics &amp; Symptoms (Optional Clinical Context)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Patient ID / Reference</label>
            <input 
              type="text"
              value={patientMetadata.patientId}
              onChange={(e) => setPatientMetadata({ ...patientMetadata, patientId: e.target.value })}
              placeholder="e.g. PT-94021-TB"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Patient Age</label>
            <input 
              type="number"
              value={patientMetadata.patientAge || ''}
              onChange={(e) => setPatientMetadata({ ...patientMetadata, patientAge: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="e.g. 42"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
            <select
              value={patientMetadata.gender || 'unspecified'}
              onChange={(e) => setPatientMetadata({ ...patientMetadata, gender: e.target.value as any })}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
            >
              <option value="unspecified">Unspecified / De-identified</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Symptoms Checklist */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-1.5">
            <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
            Check Active Clinical Symptoms:
          </label>
          <div className="flex flex-wrap gap-2">
            {symptomOptions.map((sym) => {
              const checked = patientMetadata.clinicalSymptoms?.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => toggleSymptom(sym)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                    checked
                      ? 'bg-teal-50 text-teal-800 border border-teal-300 font-semibold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {checked ? '✓ ' : '+ '}
                  {sym}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
