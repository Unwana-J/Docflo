import React, { useState } from 'react';
import {
  BookOpen, Search, Plus, FileText, Link2,
  Globe, Star, ChevronRight, ExternalLink, Lightbulb
} from 'lucide-react';

const SAMPLE_ARTICLES = [
  {
    id: 'k1',
    title: 'How to use contract templates',
    category: 'Getting Started',
    summary: 'Learn how to upload a document, let AI extract variables, and generate populated contracts in seconds.',
    starred: true,
    url: '#'
  },
  {
    id: 'k2',
    title: 'Understanding RBAC permissions',
    category: 'Governance',
    summary: 'Understand the difference between ADMIN, MEMBER, and PENDING roles and what actions each can perform.',
    starred: false,
    url: '#'
  },
  {
    id: 'k3',
    title: 'Connecting a custom brand identity',
    category: 'Branding',
    summary: 'Add your logo, color palette, and letterhead to ensure every generated document matches your corporate standards.',
    starred: true,
    url: '#'
  },
  {
    id: 'k4',
    title: 'Inviting collaborators to your workspace',
    category: 'Team Management',
    summary: 'Generate invite links, track pending approvals, and manage your team\'s membership status from one place.',
    starred: false,
    url: '#'
  },
  {
    id: 'k5',
    title: 'AI variable extraction guide',
    category: 'AI Features',
    summary: 'DocuFlow AI uses Gemini to detect dates, names, amounts, and signatures automatically from any uploaded document.',
    starred: false,
    url: '#'
  }
];

const kbCategories = ['All', 'Getting Started', 'AI Features', 'Branding', 'Governance', 'Team Management'];

const KnowledgeBase: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [articles, setArticles] = useState(SAMPLE_ARTICLES);

  const filtered = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
                        a.summary.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || a.category === activeCategory;
    return matchSearch && matchCat;
  });

  const toggleStar = (id: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, starred: !a.starred } : a));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Knowledge Base</h1>
          <p className="text-slate-500 mt-1">Guides, references, and best practices for DocuFlow AI</p>
        </div>
      </div>

      {/* Hero tip */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4 items-start">
        <div className="bg-blue-600 rounded-xl p-3 flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-blue-900">Pro Tip</p>
          <p className="text-sm text-blue-700 mt-1">Upload any PDF, Word document, or image to instantly generate a reusable, AI-powered template with auto-detected variables.</p>
        </div>
      </div>

      {/* Search + Categories */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {kbCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
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

      {/* Articles */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-200" />
          <h3 className="font-bold text-lg text-slate-700 mb-1">No articles found</h3>
          <p className="text-slate-400 text-sm">Try a different search term or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(article => (
            <div key={article.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-200 transition-all group flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2 block">
                    {article.category}
                  </span>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {article.title}
                  </h3>
                </div>
                <button
                  onClick={() => toggleStar(article.id)}
                  className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors flex-shrink-0"
                >
                  <Star
                    className={`w-4 h-4 transition-colors ${article.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                  />
                </button>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed flex-1">{article.summary}</p>
              <a
                href={article.url}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors mt-auto"
                onClick={e => e.preventDefault()}
              >
                Read article <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
