import React, { useState } from 'react';
import {
  Users, Copy, Check, Mail, ShieldCheck, ShieldAlert,
  Crown, UserCheck, UserX, Search, Plus, X, Tag
} from 'lucide-react';
import { Team, UserRole } from '../types';

interface TeamSettingsProps {
  activeTeam: Team;
  onUpdateCategories: (categories: string[]) => void;
}

const roleColors: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-purple-100 text-purple-700',
  [UserRole.EDITOR]: 'bg-blue-100 text-blue-700',
  [UserRole.MEMBER]: 'bg-slate-100 text-slate-600'
};

const roleIcons: Record<UserRole, React.ReactNode> = {
  [UserRole.ADMIN]: <Crown className="w-3.5 h-3.5" />,
  [UserRole.EDITOR]: <ShieldCheck className="w-3.5 h-3.5" />,
  [UserRole.MEMBER]: <UserCheck className="w-3.5 h-3.5" />
};

const TeamSettings: React.FC<TeamSettingsProps> = ({ activeTeam, onUpdateCategories }) => {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const mockInviteLink = `https://docuflow.app/invite/inv_${activeTeam.id.slice(-6)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mockInviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !activeTeam.categories.includes(trimmed)) {
      onUpdateCategories([...activeTeam.categories, trimmed]);
      setNewCategory('');
    }
  };

  const removeCategory = (cat: string) => {
    onUpdateCategories(activeTeam.categories.filter(c => c !== cat));
  };

  const filteredMembers = activeTeam.members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Team Settings</h1>
        <p className="text-slate-500 mt-1">
          Manage members and access for <span className="font-bold text-slate-700">{activeTeam.name}</span>
          <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">{activeTeam.workspaceType}</span>
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Members', value: activeTeam.members.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Admins', value: activeTeam.members.filter(m => m.role === UserRole.ADMIN).length, icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Templates', value: activeTeam.templates.length, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`${s.bg} ${s.color} p-3 rounded-xl`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category Manager */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-500" /> Template Categories
          </h2>
          <p className="text-xs text-slate-400 mt-1">These categories appear in your Template Repository filter. Add or remove to match your workflow.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2 min-h-[44px]">
            {activeTeam.categories.map(cat => (
              <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-bold">
                {cat}
                <button onClick={() => removeCategory(cat)} className="hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {activeTeam.categories.length === 0 && <p className="text-slate-300 text-sm italic">No categories yet.</p>}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              placeholder="Add new category…"
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addCategory}
              disabled={!newCategory.trim()}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Members + Invite */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members list */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> Members</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search members…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredMembers.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <UserX className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No members match your search</p>
              </div>
            ) : filteredMembers.map(member => (
              <div key={member.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <img
                  src={`https://picsum.photos/seed/${member.id}/40/40`}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  alt={member.name}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{member.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3" /> {member.email}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${roleColors[member.role]}`}>
                  {roleIcons[member.role]} {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Invite panel */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" /> Invite Members
            </h2>
            <p className="text-sm text-slate-500">Share this link to invite collaborators. New joiners will require admin approval before they get full access.</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-xs text-slate-600 break-all">
              {mockInviteLink}
            </div>
            <button
              onClick={handleCopy}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Invite Link</>}
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800 text-sm">Pending Approval</p>
                <p className="text-xs text-amber-700 mt-1">Collaborators who join via invite have <strong>read-only</strong> access until an Admin approves them.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSettings;
