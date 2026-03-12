import React, { useState } from 'react';
import {
  BookOpen, Search, Plus, FileText, Link2,
  Globe, Star, ChevronRight, ExternalLink, Lightbulb, Palette
} from 'lucide-react';

const SAMPLE_ARTICLES = [
  {
    id: 'k1',
    title: 'How to use contract templates',
    category: 'Getting Started',
    summary: 'Learn how to upload a document, let AI extract variables, and generate populated contracts in seconds.',
    starred: true,
    content: (
      <div className="space-y-6">
        <p>DocuFlow AI streamlines your document workflow by turning static files into intelligent templates. Follow these steps to get started:</p>
        <section className="space-y-3">
          <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</span>
            Initial Upload
          </h4>
          <p className="text-slate-600 pl-8">Drag your PDF or Word document into the <strong>Template Workshop</strong>. Our engine will analyze the layout immediately.</p>
        </section>
        <section className="space-y-3">
          <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</span>
            Variable Extraction
          </h4>
          <p className="text-slate-600 pl-8">Click <strong>Reconstruct Layout</strong>. Gemini Vision will identify placeholders like <code>{"{{clientName}}"}</code> or <code>{"{{date}}"}</code> and create editable fields for them.</p>
        </section>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h5 className="font-bold mb-2">Pro Tip: Multi-format support</h5>
          <p className="text-sm text-slate-500 italic">You can export your final document as a high-fidelity PDF or an editable Word file, regardless of the original source format.</p>
        </div>
      </div>
    )
  },
  {
    id: 'k2',
    title: 'Understanding RBAC permissions',
    category: 'Governance',
    summary: 'Understand the difference between ADMIN, MEMBER, and PENDING roles and what actions each can perform.',
    starred: false,
    content: (
      <div className="space-y-6">
        <p>Security is paramount in DocuFlow. We use Role-Based Access Control (RBAC) to ensure only authorized users can modify templates or access brand assets.</p>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-left py-3 font-bold text-slate-900">Role</th>
              <th className="text-left py-3 font-bold text-slate-900">Capabilities</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-4 font-bold text-blue-600">ADMIN</td>
              <td className="py-4 text-slate-600">Full control. Can manage team settings, invite members, and update brand assets.</td>
            </tr>
            <tr>
              <td className="py-4 font-bold text-slate-900">MEMBER</td>
              <td className="py-4 text-slate-600">Can generate documents and upload templates, but cannot change workspace settings.</td>
            </tr>
            <tr>
              <td className="py-4 font-bold text-slate-400">PENDING</td>
              <td className="py-4 text-slate-600 italic text-sm">Awaiting approval. Access is restricted until an Admin confirms the invite.</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  },
  {
    id: 'k3',
    title: 'Connecting a custom brand identity',
    category: 'Branding',
    summary: 'Add your logo, color palette, and letterhead to ensure every generated document matches your corporate standards.',
    starred: true,
    content: (
      <div className="space-y-6">
        <p>Consistent branding builds trust. DocuFlow allows you to centralize your visual identity so it is applied automatically to every document generated in your workspace.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 border border-slate-200 rounded-2xl shadow-sm">
            <h5 className="font-bold flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-pink-500" /> Primary Color
            </h5>
            <p className="text-xs text-slate-500 leading-relaxed">This color is used for UI highlights and primary elements in generated Word and PDF files.</p>
          </div>
          <div className="p-5 border border-slate-200 rounded-2xl shadow-sm">
            <h5 className="font-bold flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-blue-500" /> Letterhead
            </h5>
            <p className="text-xs text-slate-500 leading-relaxed">Set horizontal or vertical alignment for your logo and contact information on the physical page.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'k4',
    title: 'Inviting collaborators to your workspace',
    category: 'Team Management',
    summary: 'Generate invite links, track pending approvals, and manage your team\'s membership status from one place.',
    starred: false,
    content: (
      <div className="space-y-6">
        <p>DocuFlow is built for teams. You can invite colleagues to your specific workspace to share templates and brand assets.</p>
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg">
          <h5 className="font-bold text-lg mb-2">How to Invite</h5>
          <ol className="list-decimal pl-5 space-y-2 text-blue-50 text-sm">
            <li>Go to <strong>Team Settings</strong> from the sidebar.</li>
            <li>In the <strong>Members</strong> tab, click "Invite Member".</li>
            <li>Enter their email and assign a role.</li>
            <li>They will receive a secure registration link.</li>
          </ol>
        </div>
      </div>
    )
  }
];

const kbCategories = ['All', 'Getting Started', 'AI Features', 'Branding', 'Governance', 'Team Management'];

const KnowledgeBase: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [articles, setArticles] = useState(SAMPLE_ARTICLES);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const selectedArticle = articles.find(a => a.id === selectedArticleId);

  const filtered = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
                        a.summary.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || a.category === activeCategory;
    return matchSearch && matchCat;
  });

  const toggleStar = (id: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, starred: !a.starred } : a));
  };

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto animate-in slide-in-from-right-8 duration-500 pb-20">
        <button 
          onClick={() => setSelectedArticleId(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
        >
          <Plus className="w-4 h-4 rotate-45" /> Back to Knowledge Base
        </button>

        <div className="space-y-8">
          <header>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-2 block">{selectedArticle.category}</span>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">{selectedArticle.title}</h1>
            <div className="flex items-center gap-4 mt-6">
              <img src="https://picsum.photos/seed/docu/40/40" className="w-10 h-10 rounded-full grayscale" alt="Author" />
              <div>
                <p className="text-sm font-bold text-slate-900">DocuFlow Editorial Team</p>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Guide • 4 min read</p>
              </div>
            </div>
          </header>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 shadow-2xl shadow-slate-100 prose prose-slate max-w-none prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900">
            {selectedArticle.content}
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-bold">Was this helpful?</h3>
              <p className="text-slate-400 text-sm">We're constantly updating our docs based on user feedback.</p>
            </div>
            <div className="flex gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-bold transition-all transform active:scale-95">Yes, definitely</button>
              <button className="bg-slate-800 hover:bg-slate-700 px-8 py-3 rounded-xl font-bold transition-all border border-slate-700">Not really</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4 items-start shadow-sm">
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search guides, permissions, API..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {kbCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105'
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
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-24 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="font-black text-2xl text-slate-900 mb-2">No matching materials</h3>
          <p className="text-slate-400 text-lg max-w-sm mx-auto">Try refining your search or explore a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(article => (
            <div 
              key={article.id} 
              className="bg-white border border-slate-200 rounded-[2rem] p-8 hover:shadow-2xl hover:border-blue-200 transition-all group flex flex-col gap-4 relative overflow-hidden"
              onClick={() => setSelectedArticleId(article.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full translate-x-12 -translate-y-12 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform" />
              
              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-3 block">
                    {article.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                    {article.title}
                  </h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(article.id);
                  }}
                  className="p-2 rounded-xl hover:bg-slate-50 transition-colors flex-shrink-0"
                >
                  <Star
                    className={`w-5 h-5 transition-colors ${article.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                  />
                </button>
              </div>
              <p className="text-slate-500 leading-relaxed font-medium line-clamp-2 relative z-10">{article.summary}</p>
              
              <div className="pt-4 mt-auto border-t border-slate-50 relative z-10">
                <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 group-hover:gap-4 transition-all">
                  Read article <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
