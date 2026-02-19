import React, { useState, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  UserPlus,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  X,
  ChevronRight
} from 'lucide-react';
import { Team, Customer } from '../types';

interface CustomerDatabaseProps {
  activeTeam: Team;
  onUpdateTeam: (updatedTeam: Team) => void;
}

const CustomerDatabase: React.FC<CustomerDatabaseProps> = ({ activeTeam, onUpdateTeam }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LEAD' | 'INACTIVE'>('ALL');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);
  const [loading, setLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return activeTeam.customers.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activeTeam.customers, searchQuery, statusFilter]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const newCustomers: Customer[] = results.data.map((row: any) => ({
          id: `cust-${Math.random().toString(36).substr(2, 9)}`,
          name: row.name || row.Name || 'Unknown',
          email: row.email || row.Email || '',
          company: row.company || row.Company || 'Individual',
          phone: row.phone || row.Phone || '',
          address: row.address || row.Address || '',
          status: 'LEAD',
          tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));

        onUpdateTeam({
          ...activeTeam,
          customers: [...newCustomers, ...activeTeam.customers]
        });
        setLoading(false);
        setImportStatus(`Successfully imported ${newCustomers.length} customers.`);
        setTimeout(() => setImportStatus(null), 3000);
      },
      error: (err) => {
        console.error("CSV Parse Error:", err);
        setLoading(false);
        setImportStatus("Import failed.");
        setTimeout(() => setImportStatus(null), 3000);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteCustomer = (id: string) => {
    onUpdateTeam({
      ...activeTeam,
      customers: activeTeam.customers.filter(c => c.id !== id)
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Customer Database</h2>
          <p className="text-slate-500 font-medium tracking-tight uppercase text-[10px] font-black">Centralized CRM Node Active</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Import CSV
          </button>
          <button
            onClick={() => setEditingCustomer({})}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
          >
            <UserPlus className="w-4 h-4" /> Add Customer
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="bg-blue-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest animate-in slide-in-from-top-4 duration-300 shadow-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" /> {importStatus}
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-[2rem] pl-16 pr-8 py-6 font-black text-slate-900 focus:border-blue-500 focus:outline-none transition-all shadow-sm text-lg"
          />
        </div>

        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className={`p-6 border-2 rounded-[2rem] transition-all shadow-sm flex items-center gap-3 ${statusFilter !== 'ALL' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-100 text-slate-400 hover:text-slate-900'}`}
          >
            <Filter className="w-6 h-6" />
            {statusFilter !== 'ALL' && <span className="text-[10px] font-black uppercase tracking-widest">{statusFilter}</span>}
          </button>

          {isFilterMenuOpen && (
            <div className="absolute right-0 mt-4 w-64 bg-white border border-slate-100 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="space-y-2">
                {['ALL', 'ACTIVE', 'LEAD', 'INACTIVE'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status as any);
                      setIsFilterMenuOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="group bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 hover:border-blue-600 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {customer.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{customer.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{customer.company}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${customer.status === 'ACTIVE' ? 'bg-green-100 text-green-600' :
                        customer.status === 'LEAD' ? 'bg-amber-100 text-amber-600' :
                          'bg-slate-100 text-slate-400'
                      }`}>
                      {customer.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteCustomer(customer.id)}
                className="p-3 text-slate-200 hover:text-red-500 transition-colors"
                title="Delete Customer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 group/item">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-blue-600 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-500 truncate">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-blue-600 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{customer.phone}</span>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Added {new Date(customer.createdAt).toLocaleDateString()}</span>
              <button
                onClick={() => setEditingCustomer(customer)}
                className="text-blue-600 font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
              >
                Full Profile <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerDatabase;
