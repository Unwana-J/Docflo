
import React, { useState, useMemo } from 'react';
import { 
  Upload, 
  FileUp, 
  Loader2, 
  CheckCircle2, 
  X, 
  Settings2, 
  AlertCircle, 
  Sparkles, 
  Type as TypeIcon, 
  Calendar, 
  Hash, 
  ChevronDown, 
  FileText,
  Eye,
  Maximize2,
  Trash2,
  Plus,
  FileCode,
  ChevronRight
} from 'lucide-react';
import { detectTemplateFields } from '../services/geminiService';
import { TemplateField, FieldType, DocumentTemplate } from '../types';

// PDF and DOCX processing
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs';

interface TemplateUploadProps {
  onComplete: (template: DocumentTemplate) => void;
  onCancel: () => void;
}

type UploadStep = 'upload' | 'preview' | 'choice' | 'scanning' | 'refine';

const TemplateUpload: React.FC<TemplateUploadProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<UploadStep>('upload');
  const [fileContent, setFileContent] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);

  const [pendingFile, setPendingFile] = useState<{
    data?: string;
    text?: string;
    html?: string;
    blobUrl?: string;
    type: string;
    name: string;
    size: number;
    isGeneratingPreview?: boolean;
  } | null>(null);

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setStep('preview');
    setPendingFile({ type: file.type, name: file.name, size: file.size, isGeneratingPreview: true });

    try {
      const isPdf = file.type === 'application/pdf';
      const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const isImage = file.type.startsWith('image/');
      
      let data: string | undefined;
      let text: string | undefined;
      let html: string | undefined;
      let blobUrl: string | undefined;

      if (isPdf) {
        blobUrl = URL.createObjectURL(file);
        data = await readFileAsBase64(file);
      } else if (isDocx) {
        const buffer = await readFileAsArrayBuffer(file);
        const textResult = await mammoth.extractRawText({ arrayBuffer: buffer });
        const htmlResult = await mammoth.convertToHtml({ arrayBuffer: buffer });
        text = textResult.value;
        html = htmlResult.value;
        data = await readFileAsBase64(file);
      } else if (isImage) {
        blobUrl = URL.createObjectURL(file);
        data = await readFileAsBase64(file);
      } else {
        const reader = new FileReader();
        text = await new Promise((res) => {
          reader.onload = () => res(reader.result as string);
          reader.readAsText(file);
        });
      }

      setPendingFile({
        data,
        text,
        html,
        blobUrl,
        type: file.type,
        name: file.name,
        size: file.size,
        isGeneratingPreview: false
      });
    } catch (err: any) {
      setError('Failed to read file.');
      setStep('upload');
    }
  };

  const [manualCoords, setManualCoords] = useState<{ x: number, y: number } | null>(null);

  const startAnalysis = async () => {
    if (!pendingFile) return;
    setLoading(true);
    setIsRetrying(false);
    setRetryAttempt(0);
    setError(null);
    setStep('scanning');

    try {
      const result = await detectTemplateFields(
        pendingFile.data, 
        pendingFile.type, 
        pendingFile.text,
        (attempt: number) => {
          setIsRetrying(true);
          setRetryAttempt(attempt);
        }
      );
      setFileContent(result.processedContent);
      setFields(result.fields);
      setTemplateName(result.suggestedTitle);
      setStep('refine');
    } catch (err: any) {
      setError(err.message || 'AI analysis failed.');
      setIsRetrying(false);
      // Wait for user to hit "Try again" manually, or cancel
    } finally {
      setLoading(false);
    }
  };

  // Logic to inject interactive styles into the AI-generated HTML
  const refinedHtml = useMemo(() => {
    let html = fileContent;
    fields.forEach(field => {
      const isHovered = hoveredField === field.id;
      const highlightClass = isHovered 
        ? 'bg-blue-600 text-white shadow-xl scale-110 ring-4 ring-blue-500/20' 
        : 'bg-blue-100 text-blue-700 border-blue-200';
      
      const placeholder = `{{${field.name}}}`;
      // Use a more complex replacement to handle potential HTML within the AI response
      const replacement = `<span class="inline-block px-2 py-0.5 rounded-md font-bold transition-all duration-300 border ${highlightClass}" data-field-id="${field.id}">[${field.name}]</span>`;
      
      // Escape for regex and replace
      const escaped = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(escaped, 'g'), replacement);
    });
    return html;
  }, [fileContent, fields, hoveredField]);

  const updateField = (id: string, updates: Partial<TemplateField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const addFieldManually = (coords?: { x: number, y: number }) => {
    const newField: TemplateField = {
      id: `field-manual-${Date.now()}`,
      name: `NewVariable${fields.length + 1}`,
      type: FieldType.TEXT,
      required: true,
      x: coords?.x,
      y: coords?.y,
      width: 150,
      height: 30,
      page: 1
    };
    setFields([...fields, newField]);
  };

  const saveTemplate = () => {
    onComplete({
      id: `tmpl-${Date.now()}`,
      name: templateName,
      description: 'AI-generated template from document import.',
      category: 'General',
      content: fileContent,
      fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Template Workshop</h2>
          <p className="text-slate-500 font-medium">Full high-fidelity document layout reconstruction</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {step === 'upload' && (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-32 text-center hover:border-blue-400 hover:bg-blue-50/10 group transition-all duration-300">
          <div className="bg-blue-600 text-white w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl group-hover:scale-105 transition-transform">
            <Upload className="w-12 h-12" />
          </div>
          <h3 className="text-4xl font-black mb-4 text-slate-900">Drop your file here</h3>
          <p className="text-slate-400 mb-12 max-w-lg mx-auto text-xl font-medium leading-relaxed">
            Upload Word, PDF, or Images. We'll reconstruct the full visual design, including colors and typography.
          </p>
          <input type="file" id="file-upload" className="hidden" accept=".docx,.pdf,.txt,image/*" onChange={handleFileUpload} />
          <label htmlFor="file-upload" className="inline-flex items-center gap-4 bg-slate-900 text-white px-12 py-6 rounded-2xl font-bold cursor-pointer hover:bg-slate-800 shadow-2xl transition-all active:scale-95">
            <FileUp className="w-7 h-7" /> Choose File
          </label>
        </div>
      )}

      {step === 'preview' && pendingFile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-xl font-black flex items-center gap-3 text-blue-600 uppercase tracking-tight">
                <FileCode className="w-6 h-6" /> Source File
              </h3>
              <div className="space-y-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Filename</p>
                   <p className="font-bold text-slate-900 truncate">{pendingFile.name}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Details</p>
                   <p className="font-bold text-slate-900">{formatSize(pendingFile.size)} • {pendingFile.type.split('/')[1]?.toUpperCase()}</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setStep('choice')} 
              className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-4 text-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue to Setup <ChevronDown className="w-8 h-8 -rotate-90" />
            </button>
            <button onClick={() => setStep('upload')} className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 transition-colors uppercase text-xs tracking-widest">Swap File</button>
          </div>
          
          <div className="lg:col-span-8 bg-slate-200 rounded-[3rem] border-8 border-slate-100 h-[700px] flex flex-col overflow-hidden shadow-inner">
             <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-black text-xs text-slate-400 uppercase tracking-[0.2em]">Original Visual View</span>
                <Maximize2 className="w-4 h-4 text-slate-300" />
             </div>
             <div className="flex-1 overflow-auto bg-slate-200/50 p-12">
                {pendingFile.isGeneratingPreview ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-blue-500 w-16 h-16 mb-6" />
                    <p className="text-slate-400 font-black uppercase tracking-widest">Loading Document...</p>
                  </div>
                ) : (
                  <div className="bg-white min-h-full w-full max-w-[800px] mx-auto shadow-2xl p-16 border border-slate-300 rounded-sm">
                    {pendingFile.blobUrl && pendingFile.type === 'application/pdf' ? (
                      <embed src={pendingFile.blobUrl} className="w-full h-[1000px]" type="application/pdf" />
                    ) : pendingFile.html ? (
                      <div className="prose prose-slate max-w-none font-serif leading-relaxed" dangerouslySetInnerHTML={{ __html: pendingFile.html }} />
                    ) : pendingFile.blobUrl && pendingFile.type.startsWith('image/') ? (
                      <img src={pendingFile.blobUrl} className="w-full h-auto rounded shadow-lg" />
                    ) : (
                      <div className="whitespace-pre-wrap font-serif text-lg text-slate-800 leading-[1.8]">{pendingFile.text}</div>
                    )}
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {step === 'choice' && (
        <div className="max-w-4xl mx-auto space-y-10 py-12 animate-in slide-in-from-bottom-8 duration-500">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">How would you like to build this template?</h3>
            <p className="text-slate-500 text-lg font-medium">Choose between automated AI reconstruction or precision manual setup.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button 
              onClick={startAnalysis}
              className="group bg-white border-2 border-slate-100 p-10 rounded-[3rem] text-left hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[4rem] -translate-y-12 translate-x-12 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform" />
              <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-3">AI Reconstruction</h4>
              <p className="text-slate-500 font-medium leading-relaxed mb-6">Gemini will analyze the document, extract variables, and rebuild a high-fidelity HTML version automatically.</p>
              <div className="flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest">
                Start AI Scanning <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            <button 
              onClick={() => {
                setFileContent(''); // Clear content to trigger manual visual view
                setStep('refine'); 
              }}
              className="group bg-white border-2 border-slate-100 p-10 rounded-[3rem] text-left hover:border-slate-900 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -translate-y-12 translate-x-12 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform" />
              <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Settings2 className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-3">Manual Setup</h4>
              <p className="text-slate-500 font-medium leading-relaxed mb-6">Skip the AI scanning and manually identify the variables you want to extract from this document yourself.</p>
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-widest">
                Identify Manually <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>

          <button 
            onClick={() => setStep('preview')}
            className="block mx-auto text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase text-xs tracking-[0.2em]"
          >
            ← Back to Preview
          </button>
        </div>
      )}

      {step === 'scanning' && (
        <div className="bg-white rounded-[4rem] border border-slate-100 p-40 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50 overflow-hidden">
            <div className="h-full bg-blue-600 animate-[loading-bar_2s_ease-in-out_infinite]" style={{width: '40%'}} />
          </div>
          <div className="relative w-32 h-32 mx-auto mb-12">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25" />
            <div className="relative w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl transform rotate-12">
              <Sparkles className="w-16 h-16 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">
            {isRetrying ? `AI rate limit detected (Retry #${retryAttempt})...` : 'AI Layout Reconstruction...'}
          </h3>
          <p className="text-slate-400 max-w-md mx-auto text-xl font-medium leading-relaxed">
            {isRetrying 
              ? 'AI is processing, please wait... we are safely retrying your request to ensure quality.'
              : 'Gemini is analyzing the original colors, typography, and structural design to build a high-fidelity template.'}
          </p>
        </div>
      )}

      {step === 'refine' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 bg-slate-200 rounded-[3rem] border-8 border-slate-100 overflow-hidden shadow-inner h-[800px] flex flex-col relative">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
               <div className="flex items-center gap-4">
                 <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Fidelity Template Preview</span>
               </div>
               <div className="flex items-center gap-2 bg-blue-600/10 px-4 py-1.5 rounded-full border border-blue-600/20">
                 <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                 <span className="text-[10px] text-blue-600 font-black uppercase tracking-tight">Design Elements Captured</span>
               </div>
            </div>
            
            <div className="flex-1 overflow-auto p-12 custom-scrollbar flex justify-center bg-slate-300/30">
              <div 
                className="bg-white w-full max-w-[850px] shadow-2xl min-h-[1100px] border border-slate-300 rounded-sm relative p-2 overflow-hidden"
                onClick={(e) => {
                  if (step === 'refine' && !refinedHtml) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 1000;
                    const y = ((e.clientY - rect.top) / rect.height) * 1000;
                    addFieldManually({ x, y });
                  }
                }}
              >
                {refinedHtml ? (
                  <div 
                    className="p-16 h-full w-full"
                    dangerouslySetInnerHTML={{ __html: refinedHtml }}
                    onMouseOver={(e) => {
                      const target = e.target as HTMLElement;
                      const fieldId = target.closest('[data-field-id]')?.getAttribute('data-field-id');
                      if (fieldId) setHoveredField(fieldId);
                    }}
                    onMouseOut={() => setHoveredField(null)}
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    {pendingFile?.blobUrl ? (
                      <img src={pendingFile.blobUrl} className="max-w-full h-auto shadow-sm" alt="Template Preview" />
                    ) : (
                      <div className="text-slate-400 text-center space-y-4">
                        <FileText className="w-16 h-16 mx-auto opacity-20" />
                        <p className="font-bold">Original Document View</p>
                        <p className="text-sm italic">Click anywhere on the document to "anchor" a variable.</p>
                      </div>
                    )}
                    
                    {fields.map(f => f.x && f.y && (
                      <div 
                        key={f.id}
                        className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transition-transform ${hoveredField === f.id ? 'bg-blue-600 scale-150 z-20' : 'bg-slate-900 scale-100 z-10'}`}
                        style={{ 
                          left: `${(f.x / 1000) * 100}%`, 
                          top: `${(f.y / 1000) * 100}%`,
                          transform: 'translate(-50%, -50%)' 
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 flex flex-col">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                  <Settings2 className="w-8 h-8 text-blue-600" /> Variables
                </h3>
                <button 
                  onClick={addFieldManually}
                  className="bg-slate-100 hover:bg-slate-900 hover:text-white p-3 rounded-2xl transition-all shadow-sm"
                  title="Insert Field"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3 mb-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Template Identity</label>
                <input 
                  type="text" 
                  value={templateName} 
                  onChange={(e) => setTemplateName(e.target.value)} 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 font-black text-slate-900 focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all text-lg" 
                />
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
                {fields.map(field => (
                  <div 
                    key={field.id} 
                    onMouseEnter={() => setHoveredField(field.id)}
                    onMouseLeave={() => setHoveredField(null)}
                    className={`p-6 rounded-[2rem] border-2 transition-all duration-400 relative group ${hoveredField === field.id ? 'bg-blue-50 border-blue-200 shadow-xl ring-4 ring-blue-500/5' : 'bg-slate-50 border-slate-100'}`}
                  >
                    <button 
                      onClick={() => removeField(field.id)} 
                      className="absolute -top-3 -right-3 bg-white border-2 border-slate-100 rounded-full p-2.5 text-slate-300 hover:text-red-500 shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-4 mb-5">
                       <div className="p-3 bg-white rounded-2xl border-2 border-slate-50 text-blue-600 shadow-sm">
                          {field.type === FieldType.DATE ? <Calendar className="w-5 h-5" /> : field.type === FieldType.NUMBER ? <Hash className="w-5 h-5" /> : <TypeIcon className="w-5 h-5" />}
                       </div>
                       <input 
                        type="text" 
                        value={field.name} 
                        onChange={(e) => updateField(field.id, { name: e.target.value })} 
                        className="bg-transparent border-none p-0 text-base font-black text-slate-900 focus:ring-0 w-full placeholder-slate-300" 
                        placeholder="Tag name..." 
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <select 
                        value={field.type} 
                        onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })} 
                        className="flex-1 bg-white border-2 border-slate-100 rounded-[1.25rem] px-4 py-3 text-xs font-black text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      >
                        <option value={FieldType.TEXT}>PLAIN TEXT</option>
                        <option value={FieldType.NUMBER}>NUMBER</option>
                        <option value={FieldType.DATE}>DATE PICKER</option>
                        <option value={FieldType.DROPDOWN}>SELECT LIST</option>
                      </select>
                      <label className="flex items-center gap-2 px-5 bg-white border-2 border-slate-100 rounded-[1.25rem] cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={field.required} 
                          onChange={(e) => updateField(field.id, { required: e.target.checked })} 
                          className="w-5 h-5 text-blue-600 rounded-lg border-slate-200 focus:ring-blue-500" 
                        />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">REQ</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={saveTemplate} 
                className="w-full bg-slate-900 text-white py-6 rounded-[2.25rem] font-black shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-4 text-xl mt-6 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" /> Save & Deploy Template
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-4 border-red-100 p-8 rounded-[3rem] flex items-center justify-between gap-6 text-red-600 shadow-2xl animate-in slide-in-from-top-6 duration-400">
          <div className="flex items-center gap-6">
            <AlertCircle className="w-10 h-10 flex-shrink-0" />
            <p className="font-black text-lg tracking-tight">{error}</p>
          </div>
          {step === 'scanning' && error.includes('Rate limit') && (
            <button 
              onClick={() => {
                setError(null);
                startAnalysis(); 
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold shadow-sm transition-all whitespace-nowrap"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(203, 213, 225, 0.6);
          border-radius: 20px;
          border: 3px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.8);
          border: 3px solid transparent;
          background-clip: content-box;
        }
      `}</style>
    </div>
  );
};

export default TemplateUpload;
