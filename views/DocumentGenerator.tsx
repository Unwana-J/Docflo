
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Printer, 
  Sparkles, 
  X, 
  Loader2, 
  Layout, 
  Zap,
  Eye,
  Settings,
  ScanLine
} from 'lucide-react';
import { DocumentTemplate, Team, FieldCategory } from '../types';
import { fillFormWithAI } from '../services/geminiService';

interface DocumentGeneratorProps {
  template: DocumentTemplate;
  team: Team;
  onBack: () => void;
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ template, team, onBack }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const initialData: Record<string, string> = {};
    template.fields.forEach(field => {
      initialData[field.name] = field.defaultValue || '';
    });
    setFormData(initialData);
  }, [template]);

  const handleSmartFill = async () => {
    if (!assistantPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await fillFormWithAI(template.name, template.fields, assistantPrompt);
      setFormData(prev => ({ ...prev, ...result }));
      setIsAssistantOpen(false);
      setAssistantPrompt('');
    } catch (err) { console.error(err); } finally { setIsAiLoading(false); }
  };

  const handlePrint = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 500);
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in slide-in-from-bottom-6 pb-12 print:p-0">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 print:hidden">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{template.name}</h1>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Brand Fidelity Locked</span>
              </div>
            </div>
            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-300" /> Immutable Production Mode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAssistantOpen(true)}
            className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
          >
            <Sparkles className="w-5 h-5" /> Smart Fill
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200"
          >
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
            Export Artifact
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-0 print:block">
        <div className="lg:col-span-8 bg-slate-200 rounded-[3.5rem] border-8 border-slate-100 flex flex-col min-h-0 overflow-auto relative shadow-inner print:bg-white print:border-0 print:rounded-0 print:overflow-visible">
          <div className="absolute top-8 left-8 z-10 print:hidden">
             <div className="bg-slate-900/90 backdrop-blur rounded-full px-4 py-2 text-[9px] font-black text-white shadow-2xl tracking-[0.1em] border border-white/20 flex items-center gap-2">
                <ScanLine className="w-3 h-3 text-emerald-400" /> FIDELITY OVERLAY ACTIVE
             </div>
          </div>
          
          <div className="p-12 flex justify-center print:p-0">
            <div className="relative bg-white shadow-2xl print:shadow-none" style={{ height: 'fit-content' }}>
              <img src={template.fidelityImage} className="block w-[1000px] h-auto" alt="Fidelity Master" />
              {template.fields.map(field => field.rect && (
                <div 
                  key={field.id}
                  className={`absolute flex items-center transition-all ${focusedField === field.name ? 'ring-4 ring-blue-500/20 bg-blue-50/10' : ''}`}
                  style={{
                    top: `${field.rect.ymin / 10}%`,
                    left: `${field.rect.xmin / 10}%`,
                    height: `${(field.rect.ymax - field.rect.ymin) / 10}%`,
                    width: `${(field.rect.xmax - field.rect.xmin) / 10}%`,
                    fontSize: field.style?.fontSize || 'calc(1.1vw)',
                    fontWeight: field.style?.fontWeight || 'bold',
                    color: field.style?.color || '#0f172a',
                    textAlign: field.style?.textAlign || 'left',
                    justifyContent: field.style?.textAlign === 'center' ? 'center' : field.style?.textAlign === 'right' ? 'flex-end' : 'flex-start',
                    padding: '2px 4px'
                  }}
                >
                  <span className={`${!formData[field.name] ? 'text-amber-500/50 italic print:hidden' : ''}`}>
                    {formData[field.name] || `[${field.name}]`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-[3rem] border border-slate-200 shadow-xl flex flex-col min-h-0 print:hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/80">
            <h2 className="text-xl font-black flex items-center gap-3 text-slate-900">
              <Layout className="w-6 h-6 text-blue-600" /> Field Controls
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Branding is locked to original design</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {template.fields.map((field) => (
              <div key={field.id} className="space-y-3">
                <div className="flex justify-between px-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     {field.name} {field.required && <span className="text-red-500">*</span>}
                   </label>
                   <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Dynamic</span>
                </div>
                <input 
                  type={field.type === 'DATE' ? 'date' : field.type === 'NUMBER' ? 'number' : 'text'}
                  className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all ${focusedField === field.name ? 'border-blue-500 bg-white shadow-lg' : ''}`}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                  onFocus={() => setFocusedField(field.name)}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAssistantOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isAiLoading && setIsAssistantOpen(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
             <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-3"><Sparkles className="w-6 h-6" /> AI Fill Assistant</h3>
                <button onClick={() => setIsAssistantOpen(false)}><X className="w-6 h-6" /></button>
             </div>
             <div className="p-10 space-y-8">
                <textarea 
                  autoFocus
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 h-40 text-lg font-medium focus:border-blue-500 outline-none"
                  placeholder="Describe the document context..."
                  value={assistantPrompt}
                  onChange={(e) => setAssistantPrompt(e.target.value)}
                />
                <button 
                  onClick={handleSmartFill}
                  disabled={isAiLoading || !assistantPrompt.trim()}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Generate Values'}
                </button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          @page { margin: 0; }
          body { margin: 0; }
          .print-hidden { display: none !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default DocumentGenerator;
