
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  RefreshCw,
  Settings,
  Download,
  FileCheck,
  ChevronRight,
  Layout,
  Lock,
  Printer,
  FileText,
  AlertCircle
} from 'lucide-react';
import { DocumentTemplate, Team } from '../types';

interface DocumentGeneratorProps {
  template: DocumentTemplate;
  team: Team;
  onBack: () => void;
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ template, team, onBack }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    // Initialize form with defaults
    const initialData: Record<string, string> = {};
    template.fields.forEach(field => {
      initialData[field.name] = field.defaultValue || '';
    });
    setFormData(initialData);
  }, [template]);

  const handleExport = (type: 'pdf' | 'docx') => {
    setIsExporting(true);
    setExportProgress(0);
    
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    setTimeout(() => {
      setIsExporting(false);
      setExportProgress(0);
      alert(`Successfully generated and finalized ${template.name}.${type}`);
    }, 1500);
  };

  // Logic to inject interactive styles and user data into the AI-generated HTML
  const generatedHtml = useMemo(() => {
    let html = template.content;
    template.fields.forEach(field => {
      const value = formData[field.name];
      const isFocused = focusedField === field.name;
      const isPlaceholder = !value;
      
      const highlightClass = isFocused 
        ? 'bg-blue-500 text-white shadow-lg ring-4 ring-blue-500/10' 
        : isPlaceholder 
          ? 'bg-amber-100 text-amber-800 border-amber-200 border-b-2 font-bold px-2'
          : 'bg-blue-50 text-blue-700 border-blue-100 font-bold px-1';
      
      const displayValue = value || `[${field.name}]`;
      const replacement = `<span class="inline-block rounded-sm transition-all duration-300 ${highlightClass}" data-field-id="${field.name}">${displayValue}</span>`;
      
      const placeholder = `{{${field.name}}}`;
      const escaped = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(escaped, 'g'), replacement);
    });
    return html;
  }, [template.content, template.fields, formData, focusedField]);

  return (
    <div className="h-full flex flex-col gap-8 animate-in slide-in-from-bottom-6 duration-700 pb-12">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="group p-3 bg-white hover:bg-slate-900 border border-slate-200 hover:border-slate-900 rounded-2xl shadow-sm transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6 text-slate-500 group-hover:text-white" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{template.name}</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">LOYALTY TEMPLATE</span>
            </div>
            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Design High-Fidelity Artifact • v{template.version}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            disabled={isExporting}
            onClick={() => handleExport('docx')}
            className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-base font-bold text-slate-700 hover:border-blue-200 hover:bg-blue-50/20 transition-all shadow-sm disabled:opacity-50"
          >
            <Download className="w-5 h-5 text-slate-400" />
            Word
          </button>
          <button 
            disabled={isExporting}
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-base font-bold hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 relative overflow-hidden group"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Finalizing...</span>
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-100" 
                  style={{ width: `${exportProgress}%` }}
                />
              </>
            ) : (
              <>
                <Printer className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Export PDF</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-0">
        <div className="lg:col-span-8 bg-slate-200 rounded-[3rem] border-8 border-slate-100 flex flex-col min-h-0 overflow-hidden relative group shadow-inner">
          <div className="absolute top-8 left-8 z-10">
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur rounded-full px-4 py-2 text-[10px] font-black text-white shadow-2xl tracking-[0.1em] border border-white/20">
              <Lock className="w-3 h-3 text-emerald-400" />
              ARTIFACT CLONE
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-12 flex justify-center custom-scrollbar">
            <div className="bg-white w-full max-w-[850px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.2)] min-h-[1100px] border border-slate-200 rounded-sm relative p-0 overflow-hidden">
               <div 
                className="h-full w-full p-20"
                dangerouslySetInnerHTML={{ __html: generatedHtml }}
                onMouseOver={(e) => {
                  const target = e.target as HTMLElement;
                  const fieldName = target.closest('[data-field-id]')?.getAttribute('data-field-id');
                  if (fieldName) setFocusedField(fieldName);
                }}
                onMouseOut={() => setFocusedField(null)}
               />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col min-h-0 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/80">
            <h2 className="text-xl font-black flex items-center gap-3 text-slate-900">
              <Settings className="w-6 h-6 text-blue-600" />
              Input Mapping
            </h2>
            <p className="text-slate-400 text-sm mt-2 font-bold uppercase tracking-tight">The layout is locked to original spec</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {template.fields.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                <p className="text-slate-500 font-bold">Static Document: No Variables</p>
              </div>
            ) : (
              template.fields.map((field) => (
                <div key={field.id} className="space-y-3 group">
                  <div className="flex justify-between items-center px-1">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">
                      {field.name}
                      {field.required && <span className="text-blue-500 ml-1">*</span>}
                    </label>
                  </div>
                  {field.type === 'DROPDOWN' ? (
                    <div className="relative">
                      <select 
                        className={`
                          w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 
                          focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer
                          ${focusedField === field.name ? 'border-blue-500 bg-white shadow-lg' : ''}
                        `}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                        onFocus={() => setFocusedField(field.name)}
                        onBlur={() => setFocusedField(null)}
                      >
                        <option value="">Select Option</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none rotate-90" />
                    </div>
                  ) : (
                    <input 
                      type={field.type === 'DATE' ? 'date' : field.type === 'NUMBER' ? 'number' : 'text'}
                      className={`
                        w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 
                        focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all placeholder-slate-300
                        ${focusedField === field.name ? 'border-blue-500 bg-white shadow-lg' : ''}
                      `}
                      placeholder={`Enter ${field.name}...`}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                      onFocus={() => setFocusedField(field.name)}
                      onBlur={() => setFocusedField(null)}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.4);
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.6);
        }
      `}</style>
    </div>
  );
};

export default DocumentGenerator;
