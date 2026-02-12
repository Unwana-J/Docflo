
import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Palette, 
  FolderTree, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ChevronRight,
  Shield,
  Building2,
  Mail,
  Upload,
  Image as ImageIcon,
  MoreVertical,
  UserPlus,
  Ban,
  CheckCircle2,
  Send,
  Loader2,
  AlertCircle,
  UserCog,
  AlertTriangle,
  Sparkles,
  Zap,
  CheckCircle,
  PlusCircle,
  RefreshCcw,
  PlusSquare,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Eye,
  FilePlus,
  Settings2,
  Fingerprint,
  Save,
  Info,
  ToggleLeft as ToggleIcon,
  Crown,
  Layout,
  FileSearch,
  History,
  Activity
} from 'lucide-react';
import { Team, Category, UserRole, TeamMember, MemberStatus } from '../types';
import { suggestSubCategories } from '../services/geminiService';

interface SettingsProps {
  activeTeam: Team;
  onUpdateTeam: (updatedTeam: Team) => void;
}

interface ConfirmAction {
  type: 'remove' | 'disable' | 'enable';
  member: TeamMember;
}

const Settings: React.FC<SettingsProps> = ({ activeTeam, onUpdateTeam }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'brand' | 'categories' | 'roles'>('members');
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<UserRole>(UserRole.ADMIN);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<{catId: string, index: number, value: string} | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  
  // AI Suggestions state
  const [suggestionsMap, setSuggestionsMap] = useState<Record<string, string[]>>({});
  const [isSuggestingMap, setIsSuggestingMap] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.MEMBER);
  const [isInviting, setIsInviting] = useState(false);

  // Categories Logic
  const handleAddCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;
    setIsAddingCategory(true);
    const categoryId = `cat-${Date.now()}`;
    const newCat: Category = { id: categoryId, name: trimmedName, subCategories: [] };
    
    onUpdateTeam({ ...activeTeam, categories: [newCat, ...activeTeam.categories] });
    setNewCategoryName('');
    setIsAddingCategory(false);
    
    // Automatically trigger AI suggestions for the new category
    triggerAISuggestions(categoryId, trimmedName);
  };

  const triggerAISuggestions = async (catId: string, name: string) => {
    setIsSuggestingMap(prev => ({ ...prev, [catId]: true }));
    try {
      const suggestions = await suggestSubCategories(name);
      setSuggestionsMap(prev => ({ ...prev, [catId]: suggestions }));
    } catch (err) { 
      console.error("AI suggestion failed:", err); 
    } finally { 
      setIsSuggestingMap(prev => ({ ...prev, [catId]: false })); 
    }
  };

  const handleAcceptSuggestion = (catId: string, suggestion: string) => {
    const category = activeTeam.categories.find(c => c.id === catId);
    if (!category) return;

    // Check if sub-category already exists
    if (category.subCategories.includes(suggestion)) {
      handleDismissSuggestion(catId, suggestion);
      return;
    }

    onUpdateTeam({
      ...activeTeam,
      categories: activeTeam.categories.map(c => 
        c.id === catId 
          ? { ...c, subCategories: [...c.subCategories, suggestion] }
          : c
      )
    });

    handleDismissSuggestion(catId, suggestion);
  };

  const handleDismissSuggestion = (catId: string, suggestion: string) => {
    setSuggestionsMap(prev => ({
      ...prev,
      [catId]: (prev[catId] || []).filter(s => s !== suggestion)
    }));
  };

  const handleRemoveCategory = (id: string) => {
    onUpdateTeam({ ...activeTeam, categories: activeTeam.categories.filter(c => c.id !== id) });
  };

  const handleRoleChange = (memberId: string, newRole: UserRole) => {
    onUpdateTeam({
      ...activeTeam,
      members: activeTeam.members.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      )
    });
    setOpenMenuId(null);
  };

  const handleTogglePermission = (role: UserRole, permissionId: string) => {
    const currentPerms = activeTeam.rolePermissions[role] || [];
    const nextPerms = currentPerms.includes(permissionId)
      ? currentPerms.filter(p => p !== permissionId)
      : [...currentPerms, permissionId];

    onUpdateTeam({
      ...activeTeam,
      rolePermissions: {
        ...activeTeam.rolePermissions,
        [role]: nextPerms
      }
    });
  };

  // Permission definitions
  const permissionGroups = [
    {
      name: 'Workspace Governance',
      description: 'High-level controls for team structure and brand standard.',
      permissions: [
        { id: 'manage_team', label: 'Team Management', icon: Users, description: 'Invite, remove, and promote members.' },
        { id: 'edit_brand', label: 'Visual Identity', icon: Palette, description: 'Modify workspace logos, colors, and headers.' },
        { id: 'manage_settings', label: 'System Settings', icon: Settings2, description: 'Configure overall workspace behavior.' },
      ]
    },
    {
      name: 'Content Strategy',
      description: 'Management of the document repository and template structures.',
      permissions: [
        { id: 'manage_cats', label: 'Library Organization', icon: FolderTree, description: 'Create and modify template categories.' },
        { id: 'upload_tmpl', label: 'Template Engineering', icon: FilePlus, description: 'Analyze layouts and define variable fields.' },
        { id: 'archive_assets', label: 'Archive Authority', icon: Ban, description: 'Mark documents as deprecated or archived.' },
      ]
    },
    {
      name: 'Operational Production',
      description: 'Day-to-day document generation and viewing capabilities.',
      permissions: [
        { id: 'generate_doc', label: 'Artifact Production', icon: Edit3, description: 'Generate and export final documents.' },
        { id: 'view_repo', label: 'Repository Access', icon: Eye, description: 'Browse and preview existing templates.' },
        { id: 'view_history', label: 'Audit Logs', icon: History, description: 'View version history and document activity.' },
      ]
    }
  ];

  const getRoleTheme = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: Crown };
      case UserRole.EDITOR: return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: Edit3 };
      case UserRole.MEMBER: return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: Zap };
      default: return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', icon: Eye };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Workspace Control</h1>
          <p className="text-slate-500 font-medium mt-1">Global configuration for {activeTeam.name}</p>
        </div>
      </header>

      <nav className="flex border-b border-slate-200 gap-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'members', label: 'Team', icon: Users },
          { id: 'roles', label: 'Roles & Authority', icon: ShieldCheck },
          { id: 'brand', label: 'Identity', icon: Palette },
          { id: 'categories', label: 'Organization', icon: FolderTree }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-4 text-sm font-black uppercase tracking-widest relative transition-all shrink-0 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Members</h3>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                <UserPlus className="w-4 h-4" /> Invite Member
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {activeTeam.members.map(member => {
                const theme = getRoleTheme(member.role);
                return (
                  <div key={member.id} className="py-6 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <img src={member.avatarUrl || `https://picsum.photos/seed/${member.id}/64/64`} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                      <div>
                        <p className="font-black text-slate-900">{member.name}</p>
                        <p className="text-sm text-slate-500 font-medium">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className={`px-4 py-1.5 rounded-full border ${theme.bg} ${theme.border} ${theme.text} flex items-center gap-2 text-[10px] font-black uppercase tracking-widest`}>
                        <theme.icon className="w-3 h-3" />
                        {member.role}
                      </div>
                      <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-4 space-y-2">
                {Object.values(UserRole).map(role => {
                  const theme = getRoleTheme(role);
                  const isActive = selectedRoleForEdit === role;
                  return (
                    <button
                      key={role}
                      onClick={() => setSelectedRoleForEdit(role)}
                      className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${isActive ? 'bg-white border-blue-600 shadow-xl' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${theme.bg} ${theme.text}`}>
                          <theme.icon className="w-5 h-5" />
                        </div>
                        <span className="font-black text-slate-900 uppercase tracking-widest text-sm">{role}</span>
                      </div>
                      {isActive && <ChevronRight className="w-5 h-5 text-blue-600" />}
                    </button>
                  );
                })}
             </div>
             
             <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                <div className="mb-10">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <Shield className="w-7 h-7 text-blue-600" />
                      {selectedRoleForEdit} Permissions
                   </h3>
                   <p className="text-slate-400 font-medium mt-1">Configure what users with this role can see and do.</p>
                </div>
                
                <div className="space-y-12">
                   {permissionGroups.map(group => (
                     <div key={group.name}>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-1">{group.name}</h4>
                        <div className="space-y-4">
                           {group.permissions.map(perm => {
                             const hasPerm = activeTeam.rolePermissions[selectedRoleForEdit]?.includes(perm.id);
                             return (
                               <div key={perm.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group">
                                  <div className="flex items-center gap-5">
                                     <div className={`p-3 rounded-2xl ${hasPerm ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'} shadow-sm transition-colors`}>
                                        <perm.icon className="w-5 h-5" />
                                     </div>
                                     <div>
                                        <p className="font-black text-slate-900 text-sm tracking-tight">{perm.label}</p>
                                        <p className="text-xs text-slate-400 font-medium mt-0.5">{perm.description}</p>
                                     </div>
                                  </div>
                                  <button
                                    onClick={() => handleTogglePermission(selectedRoleForEdit, perm.id)}
                                    className={`relative w-14 h-8 rounded-full transition-colors ${hasPerm ? 'bg-blue-600' : 'bg-slate-200'}`}
                                  >
                                     <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${hasPerm ? 'translate-x-6' : ''}`} />
                                  </button>
                               </div>
                             );
                           })}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* Brand Tab */}
        {activeTab === 'brand' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Team Workspace Logo</label>
                    <div className="flex items-center gap-6">
                       <div className="w-24 h-24 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                          <ImageIcon className="w-8 h-8" />
                       </div>
                       <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                          Upload New Logo
                       </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Primary Action Color</label>
                    <div className="flex items-center gap-4">
                       <input 
                        type="color" 
                        value={activeTeam.assets.primaryColor}
                        onChange={(e) => onUpdateTeam({ ...activeTeam, assets: { ...activeTeam.assets, primaryColor: e.target.value } })}
                        className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-xl" 
                       />
                       <input 
                        type="text" 
                        value={activeTeam.assets.primaryColor}
                        onChange={(e) => onUpdateTeam({ ...activeTeam, assets: { ...activeTeam.assets, primaryColor: e.target.value } })}
                        className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 font-black text-slate-900 font-mono uppercase focus:ring-4 focus:ring-blue-500/10 focus:outline-none" 
                       />
                    </div>
                  </div>
               </div>
               
               <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Global Document Footer</label>
                    <textarea 
                      value={activeTeam.assets.footerText}
                      onChange={(e) => onUpdateTeam({ ...activeTeam, assets: { ...activeTeam.assets, footerText: e.target.value } })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 h-32 font-medium text-slate-700 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>
               </div>
            </div>
            
            <div className="pt-8 border-t border-slate-100 flex justify-end">
               <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-3">
                  <Save className="w-5 h-5" /> Sync Brand Assets
               </button>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-8">
             <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                   <input 
                    type="text" 
                    placeholder="New department or category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:outline-none transition-all"
                   />
                   <button 
                    onClick={handleAddCategory}
                    disabled={isAddingCategory || !newCategoryName.trim()}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 disabled:opacity-50"
                   >
                     {isAddingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                     Create Category
                   </button>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {activeTeam.categories.map(cat => (
                  <div key={cat.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm flex flex-col h-full group">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                              <FolderTree className="w-6 h-6" />
                           </div>
                           <div>
                              <h4 className="text-xl font-black text-slate-900 tracking-tight">{cat.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{cat.subCategories.length} Sub-categories</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveCategory(cat.id)}
                          className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all"
                        >
                           <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                     
                     <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap gap-2">
                           {cat.subCategories.map((sub, idx) => (
                             <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 flex items-center gap-3 group/sub">
                                <span className="text-sm font-bold text-slate-700">{sub}</span>
                             </div>
                           ))}
                        </div>
                        
                        {suggestionsMap[cat.id] && suggestionsMap[cat.id].length > 0 && (
                          <div className="mt-6 p-6 bg-blue-600 rounded-3xl text-white relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles className="w-16 h-16" />
                             </div>
                             <h5 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">AI Suggested Structures</h5>
                             <div className="flex flex-wrap gap-2 relative z-10">
                                {suggestionsMap[cat.id].map(suggestion => (
                                  <button 
                                    key={suggestion}
                                    onClick={() => handleAcceptSuggestion(cat.id, suggestion)}
                                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-black uppercase transition-all backdrop-blur-sm"
                                  >
                                    + {suggestion}
                                  </button>
                                ))}
                             </div>
                          </div>
                        )}
                     </div>
                     
                     <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                        <button 
                          onClick={() => triggerAISuggestions(cat.id, cat.name)}
                          disabled={isSuggestingMap[cat.id]}
                          className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                        >
                           {isSuggestingMap[cat.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                           Get AI Suggestions
                        </button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Settings;
