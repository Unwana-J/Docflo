
import React, { useState, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { INITIAL_TEAMS } from './constants';
import { Team, DocumentTemplate, Category } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import TemplateUpload from './views/TemplateUpload';
import DocumentGenerator from './views/DocumentGenerator';
import Repository from './views/KnowledgeBase';
import Settings from './views/Settings';
import CustomerDatabase from './views/CustomerDatabase';
import BulkGenerator from './views/BulkGenerator';
import CreateDocumentModal from './components/CreateDocumentModal';

const STORAGE_KEY = 'docflo_state_v1';

interface PersistedState {
  teams: Team[];
  activeTeamId: string;
  activeView: string;
}

const loadInitialState = (): PersistedState => {
  if (typeof window === 'undefined') {
    return {
      teams: INITIAL_TEAMS,
      activeTeamId: INITIAL_TEAMS[0].id,
      activeView: 'dashboard',
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        teams: INITIAL_TEAMS,
        activeTeamId: INITIAL_TEAMS[0].id,
        activeView: 'dashboard',
      };
    }
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      teams: parsed.teams || INITIAL_TEAMS,
      activeTeamId: parsed.activeTeamId || INITIAL_TEAMS[0].id,
      activeView: parsed.activeView || 'dashboard',
    };
  } catch {
    return {
      teams: INITIAL_TEAMS,
      activeTeamId: INITIAL_TEAMS[0].id,
      activeView: 'dashboard',
    };
  }
};

const App: React.FC = () => {
  const initial = loadInitialState();

  const [teams, setTeams] = useState<Team[]>(initial.teams);
  const [activeTeamId, setActiveTeamId] = useState<string>(initial.activeTeamId);
  const [activeView, setActiveView] = useState<string>(initial.activeView);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const activeTeam = teams.find(t => t.id === activeTeamId) || teams[0];

  const handleUpdateTeam = (updatedTeam: Team) => {
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
  };

  // Persist lightweight app state in the browser
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload: PersistedState = {
      teams,
      activeTeamId,
      activeView,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [teams, activeTeamId, activeView]);

  const handleTemplateUploadComplete = (newTemplate: DocumentTemplate) => {
    setTeams(prev => prev.map(team => {
      if (team.id !== activeTeamId) return team;

      let updatedCategories = [...team.categories];
      const categoryIndex = updatedCategories.findIndex(c => c.name === newTemplate.category);

      if (categoryIndex === -1) {
        const newCat: Category = {
          id: `cat-${Date.now()}`,
          name: newTemplate.category,
          subCategories: newTemplate.subCategory ? [newTemplate.subCategory] : []
        };
        updatedCategories.push(newCat);
      } else if (newTemplate.subCategory) {
        const cat = updatedCategories[categoryIndex];
        if (!cat.subCategories.includes(newTemplate.subCategory)) {
          updatedCategories[categoryIndex] = {
            ...cat,
            subCategories: [...cat.subCategories, newTemplate.subCategory]
          };
        }
      }

      return { 
        ...team, 
        templates: [newTemplate, ...team.templates],
        categories: updatedCategories
      };
    }));
    
    setActiveView('dashboard');
  };

  const handleTemplateClick = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setActiveView('generate');
  };

  const renderContent = () => {
    if (activeView === 'generate' && selectedTemplate) {
      return (
        <DocumentGenerator 
          template={selectedTemplate} 
          team={activeTeam}
          onBack={() => setActiveView('dashboard')} 
        />
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            activeTeam={activeTeam} 
            onTemplateClick={handleTemplateClick}
            onCreateNewClick={() => setIsCreateModalOpen(true)}
            onNavigate={(view) => setActiveView(view)}
          />
        );
      case 'upload':
        return (
          <TemplateUpload 
            onComplete={handleTemplateUploadComplete} 
            onCancel={() => setActiveView('dashboard')}
            activeTeam={activeTeam}
          />
        );
      case 'knowledge':
        return (
          <Repository 
            activeTeam={activeTeam} 
            onTemplateClick={handleTemplateClick} 
            onAddNewTemplate={() => setActiveView('upload')}
          />
        );
      case 'customers':
        return (
          <CustomerDatabase 
            activeTeam={activeTeam}
            onUpdateTeam={handleUpdateTeam}
          />
        );
      case 'bulk':
        return (
          <BulkGenerator 
            activeTeam={activeTeam}
          />
        );
      case 'team':
        return (
          <Settings 
            activeTeam={activeTeam}
            onUpdateTeam={handleUpdateTeam}
          />
        );
      case 'brand':
        return (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 shadow-sm animate-in fade-in duration-500">
             <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black mb-2 tracking-tight">Visual Identity</h2>
                  <p className="text-slate-500 font-medium">Standardize the look of your team's artifacts.</p>
                </div>
                <button 
                  onClick={() => setActiveView('team')}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Open Settings
                </button>
             </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Primary Brand Color</label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[1.5rem] shadow-2xl border-4 border-white" style={{backgroundColor: activeTeam.assets.primaryColor}} />
                    <div className="flex-1">
                      <p className="text-xl font-black text-slate-900 font-mono tracking-tight">{activeTeam.assets.primaryColor}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1 uppercase">HEX Code</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-12 text-center text-slate-400">
            <h2 className="text-2xl font-bold mb-2">Module under development</h2>
            <p>We're currently building the {activeView} module. Check back soon!</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        teams={teams}
        activeTeam={activeTeam}
        setActiveTeamId={setActiveTeamId}
      />
      
      <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto h-full">
          {renderContent()}
        </div>
      </main>

      <CreateDocumentModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        team={activeTeam}
      />
    </div>
  );
};

export default App;
