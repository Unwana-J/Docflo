
import React from 'react';
import {
  FileText,
  Users,
  Settings,
  PlusCircle,
  LayoutDashboard,
  Archive,
  Palette,
  BookOpen,
  ChevronRight,
  Database,
  Layers
} from 'lucide-react';
import { Team, TeamMember, UserRole } from '../types';
import { hasPermission } from '../hooks/usePermission';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  teams: Team[];
  activeTeam: Team;
  setActiveTeamId: (id: string) => void;
  currentUser: TeamMember;
  currentUserRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  teams,
  activeTeam,
  setActiveTeamId,
  currentUser,
  currentUserRole
}) => {
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'view_repo' },
    { id: 'knowledge', label: 'Repository', icon: BookOpen, perm: 'view_repo' },

    { id: 'bulk', label: 'Bulk Production', icon: Layers, perm: 'generate_doc' },
    { id: 'brand', label: 'Brand Assets', icon: Palette, perm: 'edit_brand' },
    { id: 'team', label: 'Team Settings', icon: Users, perm: 'manage_team' },
  ];

  const navItems = allNavItems.filter(item => hasPermission(activeTeam, currentUserRole, item.perm));

  return (
    <div className="w-64 bg-slate-900 text-slate-300 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          D
        </div>
        <span className="text-xl font-bold text-white tracking-tight">DocuFlow</span>
      </div>

      <div className="px-4 py-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block px-2">
          Current Workspace
        </label>
        <div className="relative group">
          <select
            value={activeTeam.id}
            onChange={(e) => setActiveTeamId(e.target.value)}
            className="w-full bg-slate-800 border-none text-white rounded-lg py-2 px-3 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          >
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name} {team.type === 'PERSONAL' ? '(Personal)' : ''}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 group-hover:text-white">
            <ChevronRight className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${activeView === item.id
              ? 'bg-blue-600 text-white shadow-lg'
              : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {hasPermission(activeTeam, currentUserRole, 'upload_tmpl') && (
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setActiveView('upload')}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Template
          </button>
        </div>
      )}

      <div className="p-4 mt-auto">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs">
            {currentUser.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-500 truncate">{currentUserRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
