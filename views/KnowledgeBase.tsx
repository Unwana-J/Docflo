import React, { useState } from 'react';
import {
  Plus,
  Search,
  ChevronRight,
  Star,
  Download,
  Settings2,
  FileText,
  Tag,
  Clock,
  LayoutGrid,
  Filter,
  Users,
  Building2,
  Sparkles,
  Zap,
  MoreVertical
} from 'lucide-react';
import { Team, DocumentTemplate, Category, FieldCategory } from '../types';

interface RepositoryProps {
  activeTeam: Team;
  onUpdateTeam: (updatedTeam: Team) => void;
  onTemplateClick: (template: DocumentTemplate) => void;
  onAddNewTemplate: () => void;
}

const Repository: React.FC<RepositoryProps> = ({
  activeTeam,
  onUpdateTeam,
  onTemplateClick,
  onAddNewTemplate
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCategory = activeTeam.categories.find(c => c.id === selectedCategoryId);
  const selectedTemplate = activeTeam.templates.find(t => t.id === selectedTemplateId);

  const filteredTemplates = activeTeam.templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategoryId || t.category === (selectedCategory?.name || '');
    const matchesSubCategory = !selectedSubCategory || t.subCategory === selectedSubCategory;
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Template Knowledge Base</h2>
          <p className="text-slate-500 font-medium tracking-tight uppercase text-[10px] font-black">Authorized Design Modules Active</p>
        </div>
        <button
          onClick={onAddNewTemplate}
          className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
        >
          <Plus className="w-5 h-5" /> New Template
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates by name, tag, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-[2rem] pl-16 pr-8 py-6 font-black text-slate-900 focus:border-blue-500 focus:outline-none transition-all shadow-sm text-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Categories</h3>
          <div className="space-y-1">
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setSelectedSubCategory(null);
              }}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black transition-all ${!selectedCategoryId ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <span className="flex items-center gap-3"><LayoutGrid className="w-5 h-5" /> All Templates</span>
              <span className="text-[10px] opacity-60">{activeTeam.templates.length}</span>
            </button>
            {activeTeam.categories.map(cat => (
              <div key={cat.id} className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setSelectedSubCategory(null);
                  }}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black transition-all ${selectedCategoryId === cat.id ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  <span className="flex items-center gap-3"><Tag className="w-5 h-5" /> {cat.name}</span>
                </button>
                {selectedCategoryId === cat.id && cat.subCategories.length > 0 && (
                  <div className="ml-8 space-y-1">
                    {cat.subCategories.map(sub => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubCategory(sub)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${selectedSubCategory === sub ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-9 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`group bg-white border-2 rounded-[2.5rem] p-8 cursor-pointer transition-all duration-300 relative overflow-hidden ${selectedTemplateId === template.id ? 'border-blue-600 shadow-2xl scale-[1.02]' : 'border-slate-100 hover:border-slate-300 shadow-sm'}`}
              >
                {template.isFavorite && (
                  <div className="absolute top-0 right-0 p-4">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                  </div>
                )}
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-2xl transition-all ${selectedTemplateId === template.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase">{template.category}</span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{template.name}</h3>
                <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6 line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{template.usageCount || 0} uses</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform ${selectedTemplateId === template.id ? 'translate-x-2 text-blue-600' : 'text-slate-200 group-hover:translate-x-1 group-hover:text-slate-400'}`} />
                </div>
              </div>
            ))}
          </div>

          {selectedTemplate && (
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-10">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-white/10 backdrop-blur-xl rounded-[1.5rem] border border-white/10">
                      <FileText className="w-10 h-10 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight">{selectedTemplate.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1.5 text-xs text-blue-400 font-black uppercase tracking-widest"><Sparkles className="w-4 h-4" /> AI Integrated</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        <span className="text-xs text-white/50 font-medium">Updated {new Date(selectedTemplate.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const updatedTemplates = activeTeam.templates.map(t =>
                          t.id === selectedTemplate.id ? { ...t, isFavorite: !t.isFavorite } : t
                        );
                        onUpdateTeam({ ...activeTeam, templates: updatedTemplates });
                      }}
                      className={`p-3 hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-white/10 ${selectedTemplate.isFavorite ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 'text-white/40'}`}
                    >
                      <Star className={`w-5 h-5 ${selectedTemplate.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-3 hover:bg-white/10 rounded-2xl text-white/40 transition-all border border-transparent hover:border-white/10"><Download className="w-5 h-5" /></button>
                    <button className="p-3 hover:bg-white/10 rounded-2xl text-white/40 transition-all border border-transparent hover:border-white/10"><Settings2 className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-colors">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2"><Zap className="w-3 h-3 text-blue-400" /> Variables</p>
                    <p className="text-2xl font-black tracking-tight">{selectedTemplate.fields.filter(f => f.category === FieldCategory.DYNAMIC).length}</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-colors">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2"><Building2 className="w-3 h-3 text-blue-400" /> branding</p>
                    <p className="text-2xl font-black tracking-tight">{selectedTemplate.fields.filter(f => f.category === FieldCategory.BRANDING).length}</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-colors">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2"><Users className="w-3 h-3 text-blue-400" /> permissions</p>
                    <p className="text-2xl font-black tracking-tight">Full Group</p>
                  </div>
                </div>

                <button
                  onClick={() => onTemplateClick(selectedTemplate)}
                  className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black shadow-2xl hover:bg-blue-500 transition-all flex items-center justify-center gap-3 text-xl"
                >
                  <Sparkles className="w-6 h-6" /> Initialize Processor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Repository;
