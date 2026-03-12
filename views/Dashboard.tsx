
import React from 'react';
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  Star,
  Search,
  ChevronRight,
  Archive
} from 'lucide-react';
import { Team, DocumentTemplate } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  activeTeam: Team;
  onTemplateClick: (template: DocumentTemplate) => void;
  user?: { firstName: string; lastName: string; email: string } | null;
}

const Dashboard: React.FC<DashboardProps> = ({ activeTeam, onTemplateClick, user }) => {
  const chartData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 19 },
    { name: 'Wed', count: 15 },
    { name: 'Thu', count: 22 },
    { name: 'Fri', count: 30 },
    { name: 'Sat', count: 8 },
    { name: 'Sun', count: 5 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {user ? user.firstName : 'Alex'}
          </h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your {activeTeam.name} workspace.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className="bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 shadow-sm transition-all"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Templates', value: activeTeam.templates.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Generated Docs', value: 142, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Recent Activity', value: 24, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Popular Templates', value: 3, icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
              <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6">Generation Activity</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Templates</h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">View all</button>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[400px]">
            {activeTeam.templates.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                {/* Fixed: Added Archive to imports */}
                <Archive className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No templates yet</p>
              </div>
            ) : (
              activeTeam.templates.map((tmpl) => (
                <button 
                  key={tmpl.id}
                  onClick={() => onTemplateClick(tmpl)}
                  className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 group"
                >
                  <div className="w-10 h-12 bg-slate-100 rounded border border-slate-200 flex flex-col items-center justify-center text-[8px] font-bold text-slate-400 leading-none px-1 uppercase overflow-hidden">
                    <span className="text-blue-500 mb-1">DOC</span>
                    <div className="w-full h-[1px] bg-slate-200 mb-0.5" />
                    <div className="w-full h-[1px] bg-slate-200 mb-0.5" />
                    <div className="w-full h-[1px] bg-slate-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">{tmpl.name}</p>
                    <p className="text-xs text-slate-500">{tmpl.category} • v{tmpl.version}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
