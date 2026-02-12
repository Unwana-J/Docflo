
import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  Search, 
  Folder, 
  FileText, 
  History, 
  Info, 
  Code, 
  Archive, 
  MoreHorizontal,
  ChevronDown,
  ExternalLink,
  Tag as TagIcon,
  Star,
  Clock,
  PlusCircle,
  Filter,
  X
} from 'lucide-react';
import { Team, DocumentTemplate, FieldType } from '../types';

interface RepositoryProps {
  activeTeam: Team;
  onTemplateClick: (template: DocumentTemplate) => void;
  onAddNewTemplate: () => void;
}

const Repository: React.FC<RepositoryProps> = ({ activeTeam, onTemplateClick, onAddNewTemplate }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'instructions' | 'history'>('overview');

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    activeTeam.templates.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [activeTeam.templates]);

  const selectedTemplate = activeTeam.templates.find(t => t.id === selectedTemplateId);
  const selectedCategory = activeTeam.categories.find(c => c.id === selectedCategoryId);

  const filteredTemplates = useMemo(() => {
    return activeTeam.templates.filter(t => {
      // Category filter
      if (selectedCategoryId && selectedCategory && t.category !== selectedCategory.name) return false;
      
      // Sub-category filter
      if (selectedSubCategory && t.subCategory !== selectedSubCategory) return false;
      
      // Tag filter
      if (selectedTag && !t.tags?.includes(selectedTag)) return false;
      
      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) || 
          t.description.toLowerCase().includes(q) ||
          t.tags?.some(tag => tag.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [activeTeam.templates, selectedCategoryId, selectedCategory, selectedSubCategory, selectedTag, searchQuery]);

  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedSubCategory(null);
    setSelectedTag(null);
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team Repository</h1>
          <p className="text-slate-500 font-medium">Browse, manage, and use your shared document assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search templates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:outline-none transition-all w-full md:w-80 shadow-sm"
            />
          </div>
          <button 
            onClick={onAddNewTemplate}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <PlusCircle className="w-4 h-4" /> Add New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1">
        {/* Sidebar Controls */}
        <aside className="col-span-12 lg:col-span-3 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" /> Categories
              </h3>
              {(selectedCategoryId || selectedTag || searchQuery) && (
                <button onClick={clearFilters} className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase">
                  Reset
                </button>
              )}
            </div>
            
            <div className="space-y-1">
              <button 
                onClick={() => setSelectedCategoryId(null)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${!selectedCategoryId ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Folder className={`w-4 h-4 ${!selectedCategoryId ? 'text-blue-100' : 'text-slate-400'}`} />
                All Templates
              </button>
              
              {activeTeam.categories.map(cat => (
                <div key={cat.id}>
                  <button 
                    onClick={() => {
                      setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id);
                      setSelectedSubCategory(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedCategoryId === cat.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Folder className={`w-4 h-4 ${selectedCategoryId === cat.id ? 'text-blue-600' : 'text-slate-400'}`} />
                      {cat.name}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${selectedCategoryId === cat.id ? 'rotate-180' : ''}`} />
                  </button>
                  {selectedCategoryId === cat.id && (
                    <div className="ml-8 mt-1 space-y-1 border-l-2 border-slate-100 pl-3 py-1">
                      {cat.subCategories.map(sub => (
                        <button 
                          key={sub}
                          onClick={() => setSelectedSubCategory(selectedSubCategory === sub ? null : sub)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedSubCategory === sub ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-900'}`}
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

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 ml-2">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all flex items-center gap-1.5 ${selectedTag === tag ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <TagIcon className="w-3 h-3" /> {tag}
                </button>
              ))}
              {allTags.length === 0 && <p className="text-[10px] text-slate-300 italic px-2">No tags available</p>}
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          {selectedTemplate ? (
            <div className="flex flex-col bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl animate-in slide-in-from-right-4 duration-500">
              {/* Detail Header */}
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 gap-6">
                <div className="flex items-center gap-6">
                  <button onClick={() => setSelectedTemplateId(null)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedTemplate.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{selectedTemplate.category}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase">v{selectedTemplate.version}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onTemplateClick(selectedTemplate)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> Use Template
                  </button>
                  <button className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors border border-transparent hover:border-slate-200">
                    <Star className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Detail Navigation */}
              <div className="flex border-b border-slate-100 px-8">
                {[
                  { id: 'overview', label: 'Overview', icon: Info },
                  { id: 'schema', label: 'Field Schema', icon: Code },
                  { id: 'history', label: 'Version History', icon: History }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-5 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
                  </button>
                ))}
              </div>

              {/* Detail Content */}
              <div className="p-10">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div>
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Description</h5>
                        <p className="text-slate-700 text-lg font-medium leading-relaxed">{selectedTemplate.description}</p>
                      </div>
                      
                      <div className="space-y-4">
                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata Tags</h5>
                         <div className="flex flex-wrap gap-2">
                           {selectedTemplate.tags?.map(tag => (
                             <span key={tag} className="px-4 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-2 border border-slate-100">
                               <TagIcon className="w-3.5 h-3.5 text-slate-400" />
                               {tag}
                             </span>
                           ))}
                           {(!selectedTemplate.tags || selectedTemplate.tags.length === 0) && <p className="text-xs text-slate-300 italic">No tags assigned</p>}
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Deployed</p>
                          <p className="text-sm font-bold text-slate-900">{new Date(selectedTemplate.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Usage Count</p>
                          <p className="text-sm font-bold text-slate-900">{selectedTemplate.usageCount || 0} Downloads</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-100 rounded-[2.5rem] border-8 border-slate-50 p-2 relative group overflow-hidden shadow-inner aspect-[3/4]">
                       <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-10 backdrop-blur-sm">
                          <button onClick={() => onTemplateClick(selectedTemplate)} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform">
                             <ExternalLink className="w-5 h-5" /> Open in Workspace
                          </button>
                       </div>
                       <div className="bg-white h-full w-full rounded-[1.5rem] p-8 overflow-hidden flex flex-col gap-4 opacity-40">
                          <div className="h-6 w-1/3 bg-slate-100 rounded-lg" />
                          <div className="h-2 w-full bg-slate-50 rounded" />
                          <div className="h-2 w-5/6 bg-slate-50 rounded" />
                          <div className="h-2 w-full bg-slate-50 rounded" />
                          <div className="h-40 w-full bg-slate-50 rounded-2xl mt-4" />
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'schema' && (
                  <div className="space-y-4 max-w-3xl">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Detected Variables & Data Types</h5>
                    {selectedTemplate.fields.map(f => (
                      <div key={f.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                            <Code className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-900 tracking-tight">{f.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest bg-blue-100/50 px-2 py-0.5 rounded">{f.type}</span>
                               <span className={`text-[10px] font-bold uppercase tracking-widest ${f.required ? 'text-amber-600' : 'text-slate-400'}`}>{f.required ? 'Mandatory' : 'Optional'}</span>
                            </div>
                          </div>
                        </div>
                        {f.defaultValue && (
                          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 shadow-sm">
                            Default: {f.defaultValue}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 max-w-3xl">
                    {(selectedTemplate.history || []).slice().reverse().map((h, i) => (
                      <div key={h.id} className="relative pl-14 group">
                        <div className="absolute left-4 top-2 w-4 h-4 bg-white border-4 border-blue-600 rounded-full z-10 ring-8 ring-white" />
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:shadow-lg transition-all hover:-translate-y-1">
                          <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-4">
                                <span className="text-lg font-black text-slate-900 tracking-tight">Revision {h.version}</span>
                                {i === 0 && (
                                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest">
                                    Current Version
                                  </span>
                                )}
                             </div>
                             <div className="flex items-center gap-2 text-slate-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-tight">{new Date(h.date).toLocaleDateString()}</span>
                             </div>
                          </div>
                          <p className="text-slate-600 font-medium leading-relaxed mb-6">{h.changes}</p>
                          <div className="flex items-center gap-3 border-t border-slate-200/50 pt-6">
                             <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                               {h.author[0]}
                             </div>
                             <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Modified by {h.author}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {filteredTemplates.length === 0 ? (
                <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 p-24 text-center flex flex-col items-center justify-center shadow-sm">
                   <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 text-slate-200">
                      <Archive className="w-12 h-12" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 mb-2">No Artifacts Found</h3>
                   <p className="text-slate-400 font-medium max-w-xs mb-10">Adjust your search terms or filters to locate specific templates.</p>
                   <button onClick={clearFilters} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-700 transition-colors">Clear all filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                  {filteredTemplates.map(tmpl => (
                    <div 
                      key={tmpl.id} 
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className="bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col h-full"
                    >
                      <div className="h-44 bg-slate-50 rounded-[2rem] mb-8 flex items-center justify-center group-hover:bg-blue-50 transition-colors relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <FileText className="w-14 h-14 text-slate-200 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-500" />
                        <div className="absolute top-4 right-4 px-2.5 py-1 bg-white border border-slate-100 rounded-xl text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                          v{tmpl.version}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1 mb-2">{tmpl.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium mb-6">{tmpl.description}</p>
                        
                        <div className="flex flex-wrap gap-1.5 mb-8">
                          {tmpl.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[9px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-tight">
                              {tag}
                            </span>
                          ))}
                          {tmpl.tags && tmpl.tags.length > 3 && (
                            <span className="text-[9px] font-black text-slate-300 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-tight">
                              +{tmpl.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                         <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded">
                              {tmpl.category}
                            </span>
                         </div>
                         <div className="flex items-center gap-4 text-slate-300">
                            <Clock className="w-4 h-4" />
                            <MoreHorizontal className="w-5 h-5 group-hover:text-slate-900 transition-colors" />
                         </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={onAddNewTemplate}
                    className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-6 hover:border-blue-300 hover:bg-blue-50/20 transition-all group min-h-[350px]"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 group-hover:text-blue-500 shadow-xl transition-all group-hover:scale-110">
                      <PlusCircle className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <span className="text-base font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest block mb-1">Upload New</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reconstruct a Document</span>
                    </div>
                  </button>
                </div>
              )}
            </>
          )}
        </main>
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

export default Repository;
