
import React, { useState, useRef, useMemo } from 'react';
import { 
  Layers, 
  FileUp, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Search, 
  X, 
  ChevronRight, 
  ArrowLeft,
  Download,
  AlertCircle,
  FileText,
  Table as TableIcon,
  Sparkles,
  Zap,
  Clock,
  Settings2
} from 'lucide-react';
import { Team, DocumentTemplate, BulkGenJob } from '../types';
import { GoogleGenAI } from "@google/genai";
import { processBulkGeneration } from '../services/documentService';

interface BulkGeneratorProps {
  activeTeam: Team;
}

type Step = 'select_template' | 'upload_csv' | 'mapping' | 'processing' | 'finished';

const BulkGenerator: React.FC<BulkGeneratorProps> = ({ activeTeam }) => {
  const [step, setStep] = useState<Step>('select_template');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [csvData, setCsvData] = useState<{ headers: string[], rows: string[][] } | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({}); // TemplateField.name -> CSV Header
  const [isMappingLoading, setIsMappingLoading] = useState(false);

  const [job, setJob] = useState<BulkGenJob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTemplates = useMemo(() => {
    return activeTeam.templates.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTeam.templates, searchQuery]);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(row => row.split(',').map(v => v.trim()));
      
      setCsvData({ headers, rows });
      setStep('mapping');
      autoMapHeaders(headers, selectedTemplate!);
    };
    reader.readAsText(file);
  };

  const autoMapHeaders = async (csvHeaders: string[], template: DocumentTemplate) => {
    setIsMappingLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const fieldList = template.fields.map(f => f.name).join(', ');
    const headerList = csvHeaders.join(', ');

    const prompt = `I have a template with these fields: [${fieldList}]. 
    I have a CSV with these headers: [${headerList}].
    Please map each template field to the most likely CSV header.
    Return a JSON object where keys are template fields and values are CSV headers. If no match, use null.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const aiMapping = JSON.parse(response.text || "{}");
      setMapping(aiMapping);
    } catch (err) {
      console.error("AI Mapping failed", err);
    } finally {
      setIsMappingLoading(false);
    }
  };

  const startGeneration = async () => {
    if (!selectedTemplate || !csvData) return;

    const mappedData = csvData.rows.map(row => {
      const rowData: Record<string, string> = {};
      Object.entries(mapping).forEach(([fieldName, headerName]) => {
        const index = csvData.headers.indexOf(headerName);
        if (index > -1) rowData[fieldName] = row[index];
      });
      return rowData;
    });

    const newJob: BulkGenJob = {
      id: `job-${Date.now()}`,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      totalRecords: mappedData.length,
      processedRecords: 0,
      status: 'PROCESSING'
    };

    setJob(newJob);
    setStep('processing');

    try {
      const downloadUrl = await processBulkGeneration(
        selectedTemplate,
        mappedData,
        (processed) => setJob(prev => prev ? { ...prev, processedRecords: processed } : null)
      );

      setJob(prev => prev ? { ...prev, status: 'COMPLETED', downloadUrl } : null);
      setStep('finished');
    } catch (err) {
      setJob(prev => prev ? { ...prev, status: 'FAILED', error: 'Generation failed.' } : null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Bulk Production</h1>
            <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg shadow-blue-100">
              High-Velocity
            </span>
          </div>
          <p className="text-slate-500 font-medium mt-1">Generate thousands of documents from a single data source.</p>
        </div>
        
        {step !== 'select_template' && (
          <button 
            onClick={() => {
              setStep('select_template');
              setSelectedTemplate(null);
              setJob(null);
            }}
            className="text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel Job
          </button>
        )}
      </header>

      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        {[
          { id: 'select_template', label: 'Template' },
          { id: 'upload_csv', label: 'Data Source' },
          { id: 'mapping', label: 'Field Mapping' },
          { id: 'processing', label: 'Production' }
        ].map((s, idx) => {
          const isDone = ['select_template', 'upload_csv', 'mapping', 'processing', 'finished'].indexOf(step) > idx;
          const isCurrent = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                isCurrent ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' : 
                isDone ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                'bg-white border-slate-100 text-slate-300'
              }`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-black w-4 h-4 flex items-center justify-center border border-current rounded-full">{idx + 1}</span>}
                <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
              </div>
              {idx < 3 && <ChevronRight className="w-4 h-4 text-slate-200" />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Select Template Step */}
      {step === 'select_template' && (
        <div className="space-y-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search templates for bulk generation..." 
              className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-4 font-bold focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(t => (
              <button 
                key={t.id}
                onClick={() => {
                  setSelectedTemplate(t);
                  setStep('upload_csv');
                }}
                className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] text-left hover:border-blue-400 hover:shadow-2xl transition-all group"
              >
                <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-all">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{t.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{t.category}</p>
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                   <Layers className="w-3.5 h-3.5" />
                   {t.fields.length} variables detected
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload CSV Step */}
      {step === 'upload_csv' && selectedTemplate && (
        <div className="max-w-3xl mx-auto py-12">
          <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-20 text-center space-y-8 hover:border-blue-200 transition-all">
             <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
                <TableIcon className="w-10 h-10" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Upload Production Data</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">
                   Provide a CSV file containing the data to populate {selectedTemplate.name}.
                </p>
             </div>
             <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv" 
              onChange={handleCsvUpload} 
             />
             <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-all flex items-center gap-3 mx-auto"
             >
                <FileUp className="w-5 h-5" /> Select CSV File
             </button>
          </div>
        </div>
      )}

      {/* Mapping Step */}
      {step === 'mapping' && selectedTemplate && csvData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                     <Settings2 className="w-6 h-6 text-blue-600" /> Field Configuration
                  </h3>
                  {isMappingLoading && (
                    <div className="flex items-center gap-2 text-blue-600">
                       <Loader2 className="w-4 h-4 animate-spin" />
                       <span className="text-[10px] font-black uppercase tracking-widest">AI Mapping...</span>
                    </div>
                  )}
               </div>
               
               <div className="p-8 space-y-4">
                  {selectedTemplate.fields.map(field => (
                    <div key={field.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 gap-4">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 font-black">
                             {field.name[0]}
                          </div>
                          <div>
                             <p className="font-black text-slate-900 text-sm tracking-tight">{field.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{field.type}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block" />
                          <select 
                            value={mapping[field.name] || ''}
                            onChange={(e) => setMapping({ ...mapping, [field.name]: e.target.value })}
                            className="bg-white border-2 border-slate-100 rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 focus:border-blue-500 outline-none w-full md:w-64"
                          >
                            <option value="">Skip field</option>
                            {csvData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Zap className="w-24 h-24" />
               </div>
               <div className="relative z-10 space-y-8">
                  <h3 className="text-xl font-black tracking-tight">Production Summary</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase">Template</span>
                        <span className="font-black">{selectedTemplate.name}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase">Records</span>
                        <span className="font-black">{csvData.rows.length} documents</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase">Format</span>
                        <span className="font-black">WORD (.doc)</span>
                     </div>
                  </div>
                  
                  <button 
                    onClick={startGeneration}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
                  >
                     <Sparkles className="w-5 h-5" /> Execute Production
                  </button>
               </div>
            </div>
            
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Sample Data (First 3)</h4>
               <div className="space-y-3">
                  {csvData.rows.slice(0, 3).map((row, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-medium text-slate-600 truncate">
                       {row.join(' | ')}
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Step */}
      {(step === 'processing' || step === 'finished') && job && (
        <div className="max-w-2xl mx-auto py-20 text-center">
           <div className="relative w-32 h-32 mx-auto mb-10">
              <div className={`absolute inset-0 bg-blue-100 rounded-[2.5rem] transition-all duration-1000 ${step === 'finished' ? 'scale-110 opacity-0' : 'animate-pulse opacity-50'}`} />
              <div className={`relative w-32 h-32 ${step === 'finished' ? 'bg-emerald-600' : 'bg-blue-600'} rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-all duration-500`}>
                 {step === 'finished' ? <CheckCircle2 className="w-16 h-16 text-white" /> : <Loader2 className="w-16 h-16 text-white animate-spin" />}
              </div>
           </div>
           
           <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {step === 'finished' ? 'Production Complete' : 'Executing Production'}
           </h3>
           <p className="text-slate-400 font-medium mt-2">
              {step === 'finished' ? `Successfully generated ${job.totalRecords} documents.` : `Synthesizing artifacts and stabilizing layouts...`}
           </p>
           
           <div className="mt-12 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                 <span>Progress</span>
                 <span>{Math.round((job.processedRecords / job.totalRecords) * 100)}%</span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border-2 border-white shadow-inner">
                 <div 
                  className={`h-full transition-all duration-500 rounded-full ${step === 'finished' ? 'bg-emerald-500' : 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)]'}`}
                  style={{ width: `${(job.processedRecords / job.totalRecords) * 100}%` }}
                 />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                 {job.processedRecords} of {job.totalRecords} records processed
              </p>
           </div>
           
           {step === 'finished' && job.downloadUrl && (
             <div className="mt-12 animate-in slide-in-from-bottom-4 duration-500">
                <a 
                  href={job.downloadUrl} 
                  download={`${job.templateName}_Bulk_Export.zip`}
                  className="inline-flex items-center gap-4 bg-slate-900 text-white px-12 py-6 rounded-2xl font-black text-lg shadow-2xl hover:bg-emerald-600 transition-all active:scale-95"
                >
                   <Download className="w-6 h-6" /> Download ZIP Archive
                </a>
                <button 
                  onClick={() => setStep('select_template')}
                  className="block mx-auto mt-8 text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-[0.2em] transition-all"
                >
                  Start New Batch
                </button>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default BulkGenerator;
