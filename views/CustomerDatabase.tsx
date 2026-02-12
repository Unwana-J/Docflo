
import React, { useState, useMemo, useRef } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  FileUp, 
  MoreVertical, 
  Mail, 
  Building2, 
  Phone, 
  Trash2, 
  Edit3, 
  X, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  Download,
  AlertCircle,
  Loader2,
  Sparkles,
  Tag as TagIcon
} from 'lucide-react';
import { Team, Customer } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface CustomerDatabaseProps {
  activeTeam: Team;
  onUpdateTeam: (updatedTeam: Team) => void;
}

const CustomerDatabase: React.FC<CustomerDatabaseProps> = ({ activeTeam, onUpdateTeam }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return activeTeam.customers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.email.toLowerCase().includes(q) || 
      c.company.toLowerCase().includes(q)
    );
  }, [activeTeam.customers, searchQuery]);

  const handleSaveCustomer = () => {
    if (!editingCustomer?.name || !editingCustomer?.email) return;

    const isNew = !editingCustomer.id;
    const customerToSave: Customer = {
      id: editingCustomer.id || `cust-${Date.now()}`,
      name: editingCustomer.name || '',
      email: editingCustomer.email || '',
      company: editingCustomer.company || '',
      phone: editingCustomer.phone || '',
      address: editingCustomer.address || '',
      status: editingCustomer.status || 'ACTIVE',
      tags: editingCustomer.tags || [],
      createdAt: editingCustomer.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedCustomers = isNew 
      ? [customerToSave, ...activeTeam.customers]
      : activeTeam.customers.map(c => c.id === customerToSave.id ? customerToSave : c);

    onUpdateTeam({ ...activeTeam, customers: updatedCustomers });
    setIsEditorOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      onUpdateTeam({ 
        ...activeTeam, 
        customers: activeTeam.customers.filter(c => c.id !== id) 
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportStatus("Analyzing headers with Gemini...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvContent = event.target?.result as string;
      const lines = csvContent.split('\n').filter(l => l.trim());
      const headers = lines[0];

      // Simulate AI Header Mapping using Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      try {
        const prompt = `I have a CSV with these headers: "${headers}". 
        Please map them to the following fields: [name, email, company, phone]. 
        Return a JSON object where keys are my target fields and values are the CSV header names. 
        If a header doesn't exist, use null.`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        const mapping = JSON.parse(response.text || "{}");
        const csvHeaders = headers.split(',').map(h => h.trim());
        
        const importedCustomers: Customer[] = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const getVal = (field: string) => {
            const header = mapping[field];
            const index = csvHeaders.indexOf(header);
            return index > -1 ? values[index] : '';
          };

          return {
            id: `cust-import-${Math.random().toString(36).substr(2, 9)}`,
            name: getVal('name') || 'Unknown',
            email: getVal('email') || '',
            company: getVal('company') || '',
            phone: getVal('phone') || '',
            status: 'ACTIVE',
            tags: ['Imported'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        });

        onUpdateTeam({ 
          ...activeTeam, 
          customers: [...importedCustomers, ...activeTeam.customers] 
        });
        setImportStatus(`Successfully imported ${importedCustomers.length} customers.`);
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err) {
        console.error(err);
        setImportStatus("Import failed. Check CSV format.");
      } finally {
        setImportLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Customer Hub</h1>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-200">
              Database Active
            </span>
          </div>
          <p className="text-slate-500 font-medium mt-1">Manage client profiles and contact data for artifact generation.</p>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".csv" 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border-2 border-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-blue-200 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm"
          >
            {importLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
            Smart Import
          </button>
          <button 
            onClick={() => {
              setEditingCustomer({ status: 'ACTIVE', tags: [] });
              setIsEditorOpen(true);
            }}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Customer
          </button>
        </div>
      </header>

      {importStatus && (
        <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-3xl flex items-center gap-4 text-blue-700 animate-in slide-in-from-top-4 duration-300 shadow-sm">
           <Sparkles className="w-6 h-6 animate-pulse" />
           <p className="font-black text-sm uppercase tracking-tight">{importStatus}</p>
        </div>
      )}

      {/* Main Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Database className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Records</p>
              <h4 className="text-2xl font-black text-slate-900">{activeTeam.customers.length}</h4>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Leads</p>
              <h4 className="text-2xl font-black text-slate-900">
                {activeTeam.customers.filter(c => c.status === 'ACTIVE').length}
              </h4>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Companies</p>
              <h4 className="text-2xl font-black text-slate-900">
                {new Set(activeTeam.customers.map(c => c.company)).size}
              </h4>
           </div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter by name, company, or email..." 
                className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-4 font-bold text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <button className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
              <Filter className="w-5 h-5" />
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Name</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Info</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {customer.name[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 tracking-tight">{customer.name}</p>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3" /> {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> {customer.company}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> {customer.phone || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1.5">
                      {customer.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-tight">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      customer.status === 'ACTIVE' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          setEditingCustomer(customer);
                          setIsEditorOpen(true);
                        }}
                        className="p-2.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="p-2.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-slate-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                      <Database className="w-8 h-8" />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No matching records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsEditorOpen(false)} />
           <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl">
                       <Edit3 className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black tracking-tight">{editingCustomer?.id ? 'Edit Profile' : 'New Customer'}</h3>
                       <p className="text-slate-400 text-xs font-medium">Capture client details for document automation.</p>
                    </div>
                 </div>
                 <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                       <input 
                        type="text" 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
                        value={editingCustomer?.name || ''}
                        onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                       <input 
                        type="email" 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
                        value={editingCustomer?.email || ''}
                        onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company</label>
                       <input 
                        type="text" 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
                        value={editingCustomer?.company || ''}
                        onChange={(e) => setEditingCustomer({ ...editingCustomer, company: e.target.value })}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                       <input 
                        type="tel" 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
                        value={editingCustomer?.phone || ''}
                        onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Address</label>
                    <textarea 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-900 focus:border-blue-500 outline-none transition-all h-24"
                      value={editingCustomer?.address || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                    />
                 </div>

                 <div className="pt-4 border-t border-slate-100 flex gap-4">
                    <button 
                      onClick={handleSaveCustomer}
                      className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                    >
                       Save Profile
                    </button>
                    <button 
                      onClick={() => setIsEditorOpen(false)}
                      className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                       Discard
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDatabase;
