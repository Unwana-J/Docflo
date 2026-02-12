
import React, { useState, useMemo, useRef } from 'react';
import { 
  Upload, 
  FileUp, 
  Loader2, 
  X, 
  AlertCircle, 
  Sparkles, 
  FileText,
  ShieldCheck,
  Lock,
  Zap,
  Edit3,
  Trash2,
  Settings2
} from 'lucide-react';
import { detectTemplateFields } from '../services/geminiService';
import { TemplateField, FieldType, DocumentTemplate, Team, FieldCategory } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs';

interface TemplateUploadProps {
  onComplete: (template: DocumentTemplate) => void;
  onCancel: () => void;
  activeTeam: Team;
}

type UploadStep = 'upload' | 'preview' | 'scanning' | 'refine';

const TemplateUpload: React.FC<TemplateUploadProps> = ({ onComplete, onCancel, activeTeam }) => {
  const [step, setStep] = useState<UploadStep>('upload');
  const [templateName, setTemplateName] = useState('');
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [fidelityImage, setFidelityImage] = useState<string | null>(null);
  const [aiAnalysisImage, setAiAnalysisImage] = useState<string | null>(null);

  const [pendingFile, setPendingFile] = useState<{
    data?: string;
    type: string;
    name: string;
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep('preview');
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const data = (reader.result as string).split(',')[1];
      setPendingFile({ data, type: file.type, name: file.name });
      
      if (file.type === 'application/pdf') {
        try {
          const loadingTask = pdfjsLib.getDocument({ data: atob(data) });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          
          // 1. High-res version for the UI Background (PNG)
          const viewportUI = page.getViewport({ scale: 2.0 });
          const canvasUI = document.createElement('canvas');
          canvasUI.height = viewportUI.height;
          canvasUI.width = viewportUI.width;
          await page.render({ canvasContext: canvasUI.getContext('2d')!, viewport: viewportUI }).promise;
          setFidelityImage(canvasUI.toDataURL('image/png'));

          // 2. Compressed version for the AI Analysis (JPEG)
          const viewportAI = page.getViewport({ scale: 1.5 }); // Slightly lower scale for AI
          const canvasAI = document.createElement('canvas');
          canvasAI.height = viewportAI.height;
          canvasAI.width = viewportAI.width;
          await page.render({ canvasContext: canvasAI.getContext('2d')!, viewport: viewportAI }).promise;
          setAiAnalysisImage(canvasAI.toDataURL('image/jpeg', 0.8)); // 80% quality JPEG is much smaller
        } catch (err) {
          setError("Failed to process PDF pages.");
        }
      } else if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          // Set UI Image
          setFidelityImage(reader.result as string);
          
          // Create compressed AI analysis image
          const canvas = document.createElement('canvas');
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height *= maxDim / width;
              width = maxDim;
            } else {
              width *= maxDim / height;
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setAiAnalysisImage(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async () => {
    if (!pendingFile || !aiAnalysisImage) return;
    setLoading(true);
    setStep('scanning');
    setError(null);

    try {
      const imgData = aiAnalysisImage.split(',')[1];
      const result = await detectTemplateFields(imgData, 'image/jpeg');
      
      setFields(result.fields);
      setTemplateName(prev => prev || result.suggestedTitle);
      setStep('refine');
    } catch (err: any) {
      setError(err.message || 'AI analysis failed.');
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      setError("Please provide a name for this template.");
      return;
    }

    onComplete({
      id: `tmpl-${Date.now()}`,
      name: templateName,
      description: 'Pixel-perfect fidelity template.',
      category: activeTeam.categories[0]?.name || 'General',
      tags: [],
      content: '', 
      fidelityImage: fidelityImage || '',
      fidelityMaster: pendingFile?.data,
      fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      history: [{ id: 'v1', version: '1.0.0', date: new Date().toISOString(), author: 'System', changes: 'Initial master sync.' }]
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
             <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Fidelity Workshop</h2>
            <p className="text-slate-500 font-medium tracking-tight uppercase text-[10px] font-black">Design Integrity Preservation Active</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X className="w-6 h-6" /></button>
      </div>

      {step === 'upload' && (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-24 text-center hover:border-blue-400 hover:bg-blue-50/10 group transition-all duration-300">
          <div className="bg-blue-600 text-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-105 transition-transform">
            <Upload className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-black mb-4 text-slate-900">Upload Branded Template</h3>
          <p className="text-slate-400 mb-10 max-w-lg mx-auto text-lg font-medium leading-relaxed">
            We'll lock the original design as a background and map variables with pixel-perfect coordinates.
          </p>
          <input type="file" id="file-upload" className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} />
          <label htmlFor="file-upload" className="inline-flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold cursor-pointer hover:bg-slate-800 shadow-2xl transition-all">
            <FileUp className="w-6 h-6" /> Select Master File
          </label>
        </div>
      )}

      {step === 'preview' && fidelityImage && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
              <h3 className="text-xl font-black text-blue-600 uppercase tracking-tight flex items-center gap-2">
                <FileText className="w-6 h-6" /> Template Sync
              </h3>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Name</label>
                 <input 
                  type="text" 
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Service Agreement"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black focus:border-blue-500 focus:outline-none transition-all"
                 />
              </div>
              <button 
                onClick={startAnalysis}
                className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 text-xl"
              >
                <Sparkles className="w-6 h-6" /> Analyze Design
              </button>
            </div>
          </div>
          <div className="lg:col-span-8 bg-slate-200 rounded-[3rem] p-1 shadow-inner overflow-hidden flex items-center justify-center">
             <div className="bg-white shadow-2xl max-w-full">
               <img src={fidelityImage} className="max-w-full h-auto block" alt="Template Preview" />
             </div>
          </div>
        </div>
      )}

      {step === 'scanning' && (
        <div className="bg-white rounded-[4rem] border border-slate-100 p-40 text-center shadow-2xl">
          <div className="relative w-32 h-32 mx-auto mb-12">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25" />
            <div className="relative w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-pulse">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
          </div>
          <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Coordinate Extraction Active</h3>
          <p className="text-slate-400 max-w-md mx-auto text-xl font-medium leading-relaxed">
            Detecting pixel-perfect placement for variable fields while locking branding elements.
          </p>
        </div>
      )}

      {step === 'refine' && fidelityImage && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 bg-slate-200 rounded-[3rem] p-2 overflow-auto shadow-inner h-[800px] flex justify-center">
            <div className="bg-white shadow-2xl relative" style={{ height: 'fit-content' }}>
              <img src={fidelityImage} className="block" alt="Fidelity Master" />
              {fields.map(field => field.rect && (
                <div 
                  key={field.id}
                  className={`absolute border-2 transition-all duration-300 flex items-center justify-center text-[10px] font-black overflow-hidden ${hoveredField === field.id ? 'border-blue-600 bg-blue-600/20' : 'border-blue-400 bg-blue-400/10'}`}
                  style={{
                    top: `${field.rect.ymin / 10}%`,
                    left: `${field.rect.xmin / 10}%`,
                    height: `${(field.rect.ymax - field.rect.ymin) / 10}%`,
                    width: `${(field.rect.xmax - field.rect.xmin) / 10}%`
                  }}
                  onMouseEnter={() => setHoveredField(field.id)}
                  onMouseLeave={() => setHoveredField(null)}
                >
                  <span className="bg-blue-600 text-white px-1 whitespace-nowrap">{field.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl flex-1 flex flex-col overflow-hidden">
               <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                  <Settings2 className="w-6 h-6 text-blue-600" /> Detected Fields
               </h3>
               <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {fields.map(f => (
                    <div 
                      key={f.id} 
                      onMouseEnter={() => setHoveredField(f.id)}
                      onMouseLeave={() => setHoveredField(null)}
                      className={`p-4 rounded-2xl border-2 transition-all ${hoveredField === f.id ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 bg-slate-50'}`}
                    >
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Dynamic Field
                          </span>
                          <button onClick={() => setFields(fields.filter(x => x.id !== f.id))}><Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-500" /></button>
                       </div>
                       <input 
                        type="text" 
                        value={f.name}
                        onChange={(e) => setFields(fields.map(x => x.id === f.id ? { ...x, name: e.target.value } : x))}
                        className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-black focus:border-blue-600 outline-none"
                       />
                    </div>
                  ))}
               </div>
               <button onClick={saveTemplate} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xl hover:bg-blue-600 transition-all mt-6 shadow-2xl flex items-center justify-center gap-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" /> Deploy Master
               </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-4 border-red-100 p-8 rounded-3xl flex items-center gap-6 text-red-600 shadow-2xl animate-in slide-in-from-top-6">
          <AlertCircle className="w-10 h-10 flex-shrink-0" />
          <p className="font-black text-lg">{error}</p>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default TemplateUpload;
