import React, { useState } from 'react';
import {
  Archive, Search, Plus, ChevronRight, Clock, Tag
} from 'lucide-react';
import { DocumentTemplate, Team } from '../types';

interface TemplateRepositoryProps {
  activeTeam: Team;
  onTemplateClick: (template: DocumentTemplate) => void;
  onNewTemplate: () => void;
}

const TemplateRepository: React.FC<TemplateRepositoryProps> = ({ activeTeam, onTemplateClick, onNewTemplate }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Use the workspace's own custom categories
  const categoryTabs = ['All', ...(activeTeam.categories || [])];

  const filtered = activeTeam.templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' || t.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Template Repository</h1>
          <p className="text-slate-500 mt-1">{activeTeam.templates.length} templates in {activeTeam.name}</p>
        </div>
        <button
          onClick={onNewTemplate}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all"
        >
          <Plus className="w-5 h-5" /> New Template
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categoryTabs.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 text-center">
          <Archive className="w-12 h-12 mx-auto mb-4 text-slate-200" />
          <h3 className="font-bold text-lg text-slate-700 mb-1">No templates yet</h3>
          <p className="text-slate-400 text-sm mb-6">Upload a document to create your first AI-powered template.</p>
          <button
            onClick={onNewTemplate}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all"
          >
            <Plus className="w-4 h-4" /> Create Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(tmpl => (
            <div
              key={tmpl.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all group cursor-pointer"
              onClick={() => onTemplateClick(tmpl)}
            >
              {/* Preview area */}
              <div className="h-44 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border-b border-slate-100 relative">
                <div className="text-slate-200 group-hover:text-blue-200 transition-colors">
                  <svg width="52" height="66" viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 4C0 1.79086 1.79086 0 4 0H32L48 16V56C48 58.2091 46.2091 60 44 60H4C1.79086 60 0 58.2091 0 56V4Z" fill="currentColor"/>
                    <path d="M32 0L48 16H36C33.7909 16 32 14.2091 32 12V0Z" fill="white" fillOpacity="0.3"/>
                  </svg>
                </div>
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-white border border-slate-100 text-[10px] font-black text-slate-400 rounded-full uppercase tracking-widest shadow-sm">
                  {tmpl.category}
                </span>
              </div>
              {/* Details */}
              <div className="p-5">
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{tmpl.name}</h3>
                {tmpl.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tmpl.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {tmpl.fields.length} fields
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    v{tmpl.version}
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-300 group-hover:text-blue-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateRepository;
