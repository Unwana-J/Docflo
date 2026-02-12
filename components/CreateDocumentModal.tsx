
import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  FileText, 
  ChevronRight, 
  ArrowLeft, 
  Download, 
  Clock, 
  TrendingUp,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Edit3,
  Calendar,
  Hash,
  Type as TypeIcon,
  ChevronDown,
  FileDown,
  Tag as TagIcon,
  Filter,
  ShieldCheck,
  Zap,
  ScanLine
} from 'lucide-react';
import { DocumentTemplate, Team, FieldType } from '../types';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
}

type ModalStep = 'selection' | 'editing' | 'success';

const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({ isOpen, onClose, team }) => {
  const [step, setStep] = useState<ModalStep>('selection');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    team.templates.forEach(t => cats.add(t.category));
    return ['All', ...Array.from(cats).sort()];
  }, [team.templates]);

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return team.templates.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(q) || 
                            t.description.toLowerCase().includes(q) ||
                            t.tags?.some(tag => tag.toLowerCase().includes(q));
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [team.templates, searchQuery, selectedCategory]);

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setGeneratedTitle(template.name);
    const initialData: Record<string, string> = {};
    template.fields.forEach(f => {
      initialData[f.name] = f.defaultValue || '';
    });
    setFormData(initialData);
    setStep('editing');
  };

  const handleBack = () => {
    if (step === 'editing') {
      setStep('selection');
      setError(null);
    } else {
      onClose();
    }
  };

  const resetModal = () => {
    setStep('selection');
    setSelectedTemplate(null);
    setFormData({});
    setSearchQuery('');
    setSelectedCategory('All');
    setGeneratedTitle('');
    setError(null);
  };

  const handleDownload = async (type: 'pdf' | 'docx') => {
    if (!selectedTemplate) return;

    const missingFields = selectedTemplate.fields
      .filter(f => f.required && !formData[f.name]?.trim())
      .map(f => f.name);

    if (missingFields.length > 0) {
      setError(`Required fields missing: ${missingFields.join(', ')}`);
      return;
    }

    setError(null);
    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (type === 'pdf') {
        window.print();
      } else {
        // Simple DOCX fallback for browser demo
        const blob = new Blob(['Document content'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${generatedTitle}.docx`;
        link.click();
      }
      setStep('success');
    } catch (err) {
      setError('Document generation failed.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 print:p-0">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 print:hidden" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-6xl h-full max-h-[900px] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 print:rounded-none print:shadow-none print:max-h-none print:bg-white print:overflow-visible">
        
        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50 print:hidden">
          <div className="flex items-center gap-4">
            {step === 'editing' && (
              <button onClick={handleBack} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"><ArrowLeft className="w-6 h-6" /></button>
            )}
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {step === 'selection' ? 'Create New Document' : step === 'editing' ? 'Document Workspace' : 'Artifact Ready'}
              </h2>
              <p className="text-sm text-slate-500 font-medium tracking-tight">
                {step === 'selection' ? 'Select a master template' : step === 'editing' ? `Preserving Fidelity for ${selectedTemplate?.name}` : 'Document successfully generated'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar print:p-0 print:overflow-visible">
          {step === 'selection' && (
            <div className="space-y-8 h-full flex flex-col">
              <div className="space-y-6 max-w-4xl mx-auto w-full">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search master templates..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl pl-16 pr-6 py-5 text-lg font-bold focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(tmpl => (
                  <div key={tmpl.id} onClick={() => handleSelectTemplate(tmpl)} className="bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 hover:shadow-2xl hover:border-blue-400 transition-all cursor-pointer group flex flex-col h-full">
                    <div className="h-40 bg-white rounded-[1.5rem] mb-6 flex items-center justify-center group-hover:bg-blue-50 transition-colors overflow-hidden relative">
                      <FileText className="w-12 h-12 text-slate-200 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
                      <div className="absolute top-4 right-4 px-2 py-1 bg-slate-900/5 text-[8px] font-black uppercase rounded">v{tmpl.version}</div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 tracking-tight line-clamp-1">{tmpl.name}</h3>
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{tmpl.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'editing' && selectedTemplate && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 print:block print:p-0">
              <div className="lg:col-span-4 space-y-6 print:hidden">
                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Artifact Name</label>
                    <input type="text" value={generatedTitle} onChange={(e) => setGeneratedTitle(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 focus:border-blue-500 outline-none transition-all shadow-sm" />
                 </div>
                 <div className="space-y-4">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Dynamic Field Values</label>
                   {selectedTemplate.fields.map(field => (
                     <div key={field.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                          {field.name} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <input 
                          type={field.type === FieldType.DATE ? 'date' : field.type === FieldType.NUMBER ? 'number' : 'text'}
                          className={`w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold transition-all ${focusedField === field.name ? 'border-blue-500 bg-white' : ''}`}
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                          onFocus={() => setFocusedField(field.name)}
                          onBlur={() => setFocusedField(null)}
                        />
                     </div>
                   ))}
                 </div>
              </div>

              <div className="lg:col-span-8 flex flex-col gap-6 print:block">
                <div className="flex-1 bg-slate-200 rounded-[2.5rem] border-8 border-slate-50 p-1 overflow-auto shadow-inner relative min-h-[500px] print:p-0 print:border-0 print:bg-white print:overflow-visible">
                   <div className="absolute top-6 right-6 z-10 flex gap-2 print:hidden">
                      <button onClick={() => handleDownload('docx')} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl flex items-center gap-2">Word</button>
                      <button onClick={() => handleDownload('pdf')} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl flex items-center gap-2">Export Artifact</button>
                   </div>
                   <div className="absolute top-6 left-6 z-10 print:hidden">
                      <div className="bg-slate-900/90 backdrop-blur rounded-full px-4 py-2 text-[8px] font-black text-white flex items-center gap-2 border border-white/10 shadow-xl">
                        <ScanLine className="w-3 h-3 text-emerald-400" /> PIXEL-PERFECT FIDELITY ACTIVE
                      </div>
                   </div>
                   <div className="h-full overflow-y-auto p-12 custom-scrollbar flex justify-center bg-slate-300/20 print:p-0 print:bg-white print:overflow-visible">
                      <div className="bg-white shadow-2xl relative print:shadow-none" style={{ height: 'fit-content' }}>
                         <img src={selectedTemplate.fidelityImage} className="block w-[1000px] h-auto" alt="Fidelity Master" />
                         {selectedTemplate.fields.map(field => field.rect && (
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
                              color: field.style?.color || '#000',
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
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
               <div className="w-32 h-32 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl"><CheckCircle2 className="w-16 h-16 text-emerald-600" /></div>
               <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Artifact Ready</h3>
               <p className="text-slate-500 max-w-md mx-auto text-lg font-medium leading-relaxed mb-12">Original branding preserved with filled data.</p>
               <div className="flex gap-4"><button onClick={resetModal} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all">Generate Another</button><button onClick={onClose} className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest">Close</button></div>
            </div>
          )}

          {isExporting && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-[110] flex flex-col items-center justify-center">
               <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25" />
                  <div className="relative w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl"><Loader2 className="w-10 h-10 text-white animate-spin" /></div>
               </div>
               <h4 className="text-2xl font-black text-slate-900 mb-2">Finalizing Artifact...</h4>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Locking layout & verifying branding</p>
            </div>
          )}

          {error && (
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[120]">
               <AlertCircle className="w-6 h-6" /><span className="font-black text-sm uppercase">{error}</span><button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 0; }
          body { margin: 0; }
          .print-hidden { display: none !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 20px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default CreateDocumentModal;
