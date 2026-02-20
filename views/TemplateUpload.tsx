import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload,
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Loader2,
  FileText,
  MousePointer2,
  Monitor,
  Layout,
  CheckCircle2,
  Undo2,
  Save,
  Trash2,
  Eye,
  Plus
} from 'lucide-react';
import { Team, DocumentTemplate, TemplateField, FieldType, FieldCategory, BoundingBox, FieldStyle } from '../types';
import { detectTemplateFields } from '../services/geminiService';
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface TemplateUploadProps {
  onComplete: (template: DocumentTemplate) => void;
  onCancel: () => void;
  activeTeam: Team;
}

const TemplateUpload: React.FC<TemplateUploadProps> = ({ onComplete, onCancel, activeTeam }) => {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [templateData, setTemplateData] = useState<Partial<DocumentTemplate>>({
    name: '',
    description: '',
    category: 'Sales',
    tags: [],
    fields: []
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderPage = useCallback(async (pageNum: number, pdf: pdfjsLib.PDFDocumentProxy) => {
    if (!canvasRef.current) return;
    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      const viewport = page.getViewport({ scale: 2.0 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      setPreviewUrl(canvas.toDataURL('image/png'));
    } catch (err) {
      console.error("PDF Render Error:", err);
      setError("Failed to render PDF page.");
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.type.startsWith('image/')) {
      setError('Please upload a PDF or an image file.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsUploading(true);

    try {
      if (selectedFile.type === 'application/pdf') {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        await renderPage(1, pdf);
      } else {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        setPdfDoc(null);
        setTotalPages(1);
      }
      setStep(2);
    } catch (err) {
      setError('Error loading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAIDetect = async () => {
    if (!previewUrl) return;
    setIsUploading(true);
    setError(null);

    try {
      // Use the previewUrl (which is the current page as PNG for PDFs)
      const base64Data = previewUrl.split(',')[1];
      const result = await detectTemplateFields(base64Data, 'image/png');

      const newFields: TemplateField[] = result.fields.map((f: any, idx: number) => ({
        id: `field-${Date.now()}-${idx}`,
        name: f.variableName || f.name,
        type: (f.type as FieldType) || FieldType.TEXT,
        category: FieldCategory.DYNAMIC,
        required: true,
        rect: f.rect,
        style: f.style,
        pageIndex: currentPage - 1
      }));

      setTemplateData(prev => ({
        ...prev,
        name: prev.name || result.suggestedTitle,
        fields: [...(prev.fields || []), ...newFields]
      }));
      setStep(3);
    } catch (err: any) {
      setError(err.message || "AI Analysis failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!templateData.name) {
      setError("Template name is required.");
      return;
    }

    const newTemplate: DocumentTemplate = {
      id: `tpl-${Date.now()}`,
      name: templateData.name || 'Untitled',
      description: templateData.description || '',
      category: templateData.category || 'Other',
      tags: templateData.tags || [],
      content: '', // In a real app, this would be the master template storage
      fidelityImage: previewUrl || '',
      fields: templateData.fields || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      history: [{
        id: `v1-${Date.now()}`,
        version: '1.0',
        date: new Date().toISOString(),
        author: 'System',
        changes: 'Initial creation via AI'
      }]
    };

    onComplete(newTemplate);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onCancel}
            className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-4 font-black text-[10px] uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Workspace
          </button>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Initialize Intelligence</h2>
        </div>

        <div className="flex items-center gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex items-center gap-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${step >= i ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {step > i ? <CheckCircle2 className="w-4 h-4" /> : i}
              </div>
              {i < 3 && <div className={`w-8 h-0.5 ${step > i ? 'bg-blue-600' : 'bg-slate-100'}`} />}
            </div>
          ))}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <div className="bg-red-50 border-2 border-red-100 text-red-600 p-6 rounded-[2rem] flex items-center gap-4 animate-in shake duration-500 shadow-sm">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p className="font-black text-xs uppercase tracking-widest">{error}</p>
        </div>
      )}

      {step === 1 && (
        <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-20 text-center space-y-8 shadow-sm hover:border-blue-600 transition-all group">
          <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto group-hover:bg-blue-600 group-hover:text-white transition-all group-hover:rotate-6">
            <Upload className="w-12 h-12" />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Ingest Master Document</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">Upload a high-fidelity PDF or Image. Our AI will analyze the structure to identify dynamic variables and branding nodes.</p>
          </div>
          <div className="relative pt-4">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center gap-3 mx-auto">
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} Selection Master
            </button>
          </div>
        </div>
      )}

      {step === 2 && previewUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-12">
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="w-full md:w-1/3 bg-white/5 border border-white/10 rounded-[2rem] p-2 aspect-[3/4] overflow-hidden relative group">
                  <img src={previewUrl} className="w-full h-full object-cover rounded-[1.5rem]" alt="Template Preview" />
                  {totalPages > 1 && (
                    <div className="absolute bottom-6 inset-x-6 flex items-center justify-between">
                      <button
                        onClick={() => {
                          const prev = Math.max(1, currentPage - 1);
                          setCurrentPage(prev);
                          if (pdfDoc) renderPage(prev, pdfDoc);
                        }}
                        disabled={currentPage === 1}
                        className="p-2 bg-black/50 backdrop-blur-xl rounded-xl hover:bg-black/70 disabled:opacity-30"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-black/50 backdrop-blur-xl px-3 py-1.5 rounded-lg">Page {currentPage} / {totalPages}</span>
                      <button
                        onClick={() => {
                          const next = Math.min(totalPages, currentPage + 1);
                          setCurrentPage(next);
                          if (pdfDoc) renderPage(next, pdfDoc);
                        }}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-black/50 backdrop-blur-xl rounded-xl hover:bg-black/70 disabled:opacity-30"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-8">
                  <div className="space-y-4">
                    <span className="text-blue-400 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2"><Sparkles className="w-5 h-5" /> Intelligence Ready</span>
                    <h3 className="text-4xl font-black tracking-tight leading-tight">Proceed with AI Variable Extraction?</h3>
                    <p className="text-white/50 text-lg font-medium leading-relaxed max-w-xl">DocuFlow AI will scan the current page of the document to identify dynamic input zones, typography styles, and branding constraints.</p>
                  </div>
                  <div className="flex items-center gap-6 pt-4">
                    <button
                      onClick={handleAIDetect}
                      disabled={isUploading}
                      className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-3 disabled:opacity-50"
                    >
                      {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : <Eye className="w-5 h-5 text-blue-600" />}
                      Run Full Analysis
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="text-white/40 hover:text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                      Manual Setup <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-12 shadow-sm space-y-8">
              <div className="flex items-center justify-between pb-8 border-b border-slate-50">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Template Identity</h3>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Core Confirmed
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Name</label>
                  <input
                    type="text"
                    value={templateData.name}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 font-black text-slate-900 focus:bg-white focus:border-blue-600 transition-all focus:outline-none"
                    placeholder="e.g. Q1 Workshop Contract"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                  <select
                    value={templateData.category}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 font-black text-slate-900 focus:bg-white focus:border-blue-600 transition-all focus:outline-none appearance-none"
                  >
                    <option>Sales</option>
                    <option>Finance</option>
                    <option>HR</option>
                    <option>Operations</option>
                    <option>Legal</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brief Description</label>
                <textarea
                  value={templateData.description}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 font-medium text-slate-700 focus:bg-white focus:border-blue-600 transition-all focus:outline-none resize-none"
                  placeholder="State the purpose of this intelligence module..."
                />
              </div>
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-12 shadow-sm space-y-8">
              <div className="flex items-center justify-between pb-8 border-b border-slate-50">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Detected Variables</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full">{templateData.fields?.length || 0} Dynamic Nodes</span>
              </div>

              <div className="space-y-4">
                {templateData.fields?.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50/20 transition-all group">
                    <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-blue-600 font-black text-xs">
                      {idx + 1}
                    </div>
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => {
                          const updated = [...(templateData.fields || [])];
                          updated[idx].name = e.target.value;
                          setTemplateData(prev => ({ ...prev, fields: updated }));
                        }}
                        className="bg-transparent font-black text-slate-900 focus:outline-none focus:text-blue-600"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => {
                          const updated = [...(templateData.fields || [])];
                          updated[idx].type = e.target.value as FieldType;
                          setTemplateData(prev => ({ ...prev, fields: updated }));
                        }}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer"
                      >
                        <option value={FieldType.TEXT}>Text</option>
                        <option value={FieldType.DATE}>Date</option>
                        <option value={FieldType.NUMBER}>Number</option>
                      </select>
                      <div className="hidden md:flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase">
                        Page {(field.pageIndex || 0) + 1}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const updated = templateData.fields?.filter(f => f.id !== field.id);
                        setTemplateData(prev => ({ ...prev, fields: updated }));
                      }}
                      className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newField: TemplateField = {
                      id: `manual-${Date.now()}`,
                      name: 'new_variable',
                      type: FieldType.TEXT,
                      category: FieldCategory.DYNAMIC,
                      required: true,
                      pageIndex: currentPage - 1,
                      rect: { ymin: 100, xmin: 100, ymax: 150, xmax: 400 }, // Default position (top-left)
                      style: { fontSize: '1.2vw', color: '#ef4444', fontWeight: 'bold' } // Red to stand out
                    };
                    setTemplateData(prev => ({ ...prev, fields: [...(prev.fields || []), newField] }));
                  }}
                  className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Manual Variable
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl space-y-8">
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Actions</h4>
              <div className="space-y-4">
                <button
                  onClick={handleSaveTemplate}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  <Save className="w-5 h-5" /> Deploy Template
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  <Undo2 className="w-5 h-5" /> Reset Module
                </button>
              </div>

              <div className="pt-8 border-t border-white/5">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-4">Integration Summary</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-xs font-medium text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Multi-Page Navigation
                  </li>
                  <li className="flex items-center gap-3 text-xs font-medium text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> AI Style Recognition
                  </li>
                  <li className="flex items-center gap-3 text-xs font-medium text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Branding Constraint Check
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-2 overflow-hidden shadow-sm">
              <div className="p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Preview</p>
              </div>
              <div className="aspect-[3/4] bg-slate-50 rounded-[2.5rem] overflow-hidden relative">
                <img src={previewUrl || ''} className="w-full h-full object-cover" alt="Draft" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateUpload;
