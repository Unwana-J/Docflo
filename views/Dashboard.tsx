
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  Star,
  Search,
  ChevronRight,
  Archive,
  Plus,
  Zap,
  ShieldCheck,
  Users,
  ArrowUpRight,
  MoreVertical,
  Wand2,
  UploadCloud,
  Palette,
  Edit3,
  X,
  Sparkles
} from 'lucide-react';
import { Team, DocumentTemplate } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  activeTeam: Team;
  onTemplateClick: (template: DocumentTemplate) => void;
  onCreateNewClick: () => void;
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeTeam, onTemplateClick, onCreateNewClick, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSearchTemplates = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return activeTeam.templates.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.category.toLowerCase().includes(q) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [activeTeam.templates, searchQuery]);

  const chartData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 19 },
    { name: 'Wed', count: 15 },
    { name: 'Thu', count: 22 },
    { name: 'Fri', count: 30 },
    { name: 'Sat', count: 8 },
    { name: 'Sun', count: 5 },
  ];

  const firstTemplate = activeTeam.templates[0];
  const secondTemplate = activeTeam.templates[1];

  const teamActivity = [
    ...(firstTemplate
      ? [
          {
            id: 1,
            user: "Sarah Miller",
            action: "updated",
            target: firstTemplate.name,
            time: "12m ago",
            icon: EditIcon,
            template: firstTemplate
          }
        ]
      : []),
    ...(secondTemplate
      ? [
          {
            id: 2,
            user: "Alex Johnson",
            action: "generated",
            target: secondTemplate.name,
            time: "1h ago",
            icon: FileIcon,
            template: secondTemplate
          }
        ]
      : []),
    {
      id: 3,
      user: "System",
      action: "synced",
      target: "Brand Colors",
      time: "3h ago",
      icon: ZapIcon,
      view: "brand"
    },
    {
      id: 4,
      user: "Sarah Miller",
      action: "archived",
      target: "Old Invoice Template",
      time: "5h ago",
      icon: ArchiveIcon
    }
  ];

  const handleActivityClick = (act: any) => {
    if (act.template) onTemplateClick(act.template);
    else if (act.view) onNavigate(act.view);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Dynamic Command Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Workspace Pulse</h1>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">Live</span>
          </div>
          <p className="text-slate-500 font-medium text-lg">Manage and monitor {activeTeam.name} operations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group" ref={searchRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Jump to template..." 
              value={searchQuery}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              className="bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 w-full md:w-80 shadow-sm transition-all"
            />
            {showSearchDropdown && searchQuery && (
              <div className="absolute top-full mt-3 left-0 w-full bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search Results</span>
                   <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-slate-200 rounded-lg"><X className="w-3 h-3" /></button>
                </div>
                {filteredSearchTemplates.length > 0 ? (
                  <div className="p-2">
                    {filteredSearchTemplates.map(t => (
                      <button 
                        key={t.id}
                        onClick={() => {
                          onTemplateClick(t);
                          setSearchQuery('');
                          setShowSearchDropdown(false);
                        }}
                        className="w-full flex items-center justify-between p-4 hover:bg-blue-50 rounded-2xl transition-all group"
                      >
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600">
                             <FileText className="w-5 h-5" />
                           </div>
                           <div className="text-left">
                              <p className="text-sm font-black text-slate-900 truncate max-w-[150px]">{t.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{t.category}</p>
                           </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-sm text-slate-400 font-medium italic">No templates match "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <button 
            onClick={onCreateNewClick}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-2xl hover:bg-blue-600 transition-all flex items-center gap-3 whitespace-nowrap group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center gap-3">
              <Plus className="w-5 h-5" />
              Start New Project
            </span>
          </button>
        </div>
      </header>

      {/* Quick Start Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={onCreateNewClick}
          className="flex items-center justify-between p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-blue-400 transition-all text-left group"
        >
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
              <Wand2 className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 tracking-tight">Smart Fill</h4>
            <p className="text-xs text-slate-500 font-medium">Auto-populate via prompt</p>
          </div>
          <ArrowUpRight className="w-6 h-6 text-slate-300 group-hover:text-blue-600" />
        </button>

        <button 
          onClick={() => onNavigate('upload')}
          className="flex items-center justify-between p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all text-left group"
        >
          <div className="space-y-2">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-2 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 tracking-tight">Bulk Upload</h4>
            <p className="text-xs text-slate-500 font-medium">Import docx / pdf templates</p>
          </div>
          <ArrowUpRight className="w-6 h-6 text-slate-300 group-hover:text-emerald-600" />
        </button>

        <button 
          onClick={() => onNavigate('brand')}
          className="flex items-center justify-between p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-purple-400 transition-all text-left group"
        >
          <div className="space-y-2">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-2 group-hover:scale-110 transition-transform">
              <Palette className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 tracking-tight">Brand Sync</h4>
            <p className="text-xs text-slate-500 font-medium">Update global assets</p>
          </div>
          <ArrowUpRight className="w-6 h-6 text-slate-300 group-hover:text-purple-600" />
        </button>
      </section>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Deployed Templates', value: activeTeam.templates.length, trend: '+2 this week', icon: FileText, color: 'from-blue-600 to-blue-400' },
          { label: 'Artifacts Generated', value: 1422, trend: '+12.5%', icon: TrendingUp, color: 'from-emerald-600 to-emerald-400' },
          { label: 'Team Efficiency', value: '94%', trend: 'Top 5% org-wide', icon: ShieldCheck, color: 'from-amber-600 to-amber-400' },
          { label: 'Active Members', value: activeTeam.members.length, trend: 'All online', icon: Users, color: 'from-purple-600 to-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-[0.03] -translate-y-8 translate-x-8 rounded-full group-hover:scale-150 transition-transform duration-700`} />
            <div className="relative flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-2xl text-white shadow-xl`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <MoreVertical className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
              <p className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                {stat.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Activity Chart Bento */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-200 shadow-sm p-10 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Production Flow</h3>
              <p className="text-slate-400 text-sm font-medium">Daily artifact generation metrics</p>
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button className="px-4 py-2 bg-white rounded-xl shadow-sm text-xs font-black uppercase tracking-wider text-blue-600">Weekly</button>
              <button className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-400">Monthly</button>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc', radius: 12}}
                  contentStyle={{
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                    padding: '20px'
                  }}
                  itemStyle={{ fontWeight: 900, fontSize: '14px' }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[12, 12, 12, 12]} 
                  barSize={32}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 4 ? '#1e293b' : 'url(#barGradient)'} 
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Activity Feed Bento */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl flex-1 flex flex-col overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Zap className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-white tracking-tight">Team Pulse</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              </div>
              
              <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
                {teamActivity.map((act) => (
                  <div 
                    key={act.id} 
                    onClick={() => handleActivityClick(act)}
                    className="flex gap-4 group cursor-pointer"
                  >
                    <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/40 group-hover:text-white/80 transition-colors">
                      <act.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white/90 truncate">
                        {act.user} <span className="text-white/40 font-medium">{act.action}</span>
                      </p>
                      <p className="text-xs font-black text-blue-400 tracking-tight truncate mt-0.5 group-hover:underline">{act.target}</p>
                      <p className="text-[10px] text-white/20 font-bold uppercase mt-1 tracking-widest">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => onNavigate('team')}
                className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-[0.2em] transition-all border border-white/5"
              >
                Manage Team Access
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                   <Star className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="font-black text-slate-900 tracking-tight">Top Asset</h4>
                   <p className="text-xs text-slate-400 font-bold uppercase">Trending this week</p>
                </div>
             </div>
             {activeTeam.templates.length > 0 ? (
               <div 
                onClick={() => onTemplateClick(activeTeam.templates[0])}
                className="p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:border-blue-300 transition-all cursor-pointer group"
               >
                 <div className="flex items-center justify-between">
                    <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{activeTeam.templates[0].name}</p>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                 </div>
                 <div className="flex items-center gap-2 mt-2">
                    <span className="text-[8px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded uppercase">{activeTeam.templates[0].category}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">42 Generations</span>
                 </div>
               </div>
             ) : (
               <button 
                onClick={() => onNavigate('upload')}
                className="w-full p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-blue-50/50 transition-all group"
               >
                  <Plus className="w-6 h-6 text-slate-200 group-hover:text-blue-600" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add First Template</span>
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Internal Micro Icons
function EditIcon(props: any) { return <Edit3 {...props} /> }
function FileIcon(props: any) { return <FileText {...props} /> }
function ZapIcon(props: any) { return <Zap {...props} /> }
function ArchiveIcon(props: any) { return <Archive {...props} /> }
