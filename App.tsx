
import React, { useState } from 'react';
import { INITIAL_TEAMS } from './constants';
import { Team, DocumentTemplate, BrandAssets } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import TemplateUpload from './views/TemplateUpload';
import DocumentGenerator from './views/DocumentGenerator';
import SignUp from './views/SignUp';
import CreateWorkspace from './views/CreateWorkspace';
import BrandSetup from './views/BrandSetup';
import PendingDashboard from './views/PendingDashboard';

type AppStage = 'signup' | 'create_workspace' | 'brand_setup' | 'pending_dashboard' | 'app';

const App: React.FC = () => {
  // ─── Onboarding state ───────────────────────────────────────────────────────
  const [stage, setStage] = useState<AppStage>('signup');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  // ─── App state ───────────────────────────────────────────────────────────────
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [activeTeamId, setActiveTeamId] = useState<string>(INITIAL_TEAMS[0].id);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  const activeTeam = teams.find(t => t.id === activeTeamId) || teams[0];

  // ─── Onboarding handlers ─────────────────────────────────────────────────────
  const handleSignUp = (isPending: boolean) => {
    if (isPending) {
      setStage('pending_dashboard');
    } else {
      setStage('create_workspace');
    }
  };

  const handleCreateWorkspace = (name: string) => {
    setNewWorkspaceName(name);
    setStage('brand_setup');
  };

  const handleBrandSetupComplete = (assets: BrandAssets) => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: newWorkspaceName,
      type: 'WORKSPACE',
      members: [],
      assets,
      templates: []
    };
    setTeams(prev => [...prev, newTeam]);
    setActiveTeamId(newTeam.id);
    setStage('app');
  };

  // ─── App content handlers ────────────────────────────────────────────────────
  const handleTemplateUploadComplete = (newTemplate: DocumentTemplate) => {
    setTeams(prev => prev.map(team =>
      team.id === activeTeamId
        ? { ...team, templates: [newTemplate, ...team.templates] }
        : team
    ));
    setActiveView('dashboard');
  };

  const handleTemplateClick = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setActiveView('generate');
  };

  // ─── Onboarding stages ───────────────────────────────────────────────────────
  if (stage === 'signup') {
    return <SignUp onComplete={handleSignUp} />;
  }
  if (stage === 'create_workspace') {
    return <CreateWorkspace onComplete={handleCreateWorkspace} />;
  }
  if (stage === 'brand_setup') {
    return <BrandSetup workspaceName={newWorkspaceName} onComplete={handleBrandSetupComplete} />;
  }
  if (stage === 'pending_dashboard') {
    return <PendingDashboard onLogout={() => setStage('signup')} />;
  }

  // ─── Main Application ────────────────────────────────────────────────────────
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
          />
        );
      case 'upload':
        return (
          <TemplateUpload
            onComplete={handleTemplateUploadComplete}
            onCancel={() => setActiveView('dashboard')}
          />
        );
      case 'templates':
        return (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Templates Repository</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTeam.templates.map(tmpl => (
                <div
                  key={tmpl.id}
                  className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleTemplateClick(tmpl)}
                >
                  <div className="h-40 bg-slate-50 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-slate-200">
                      <svg width="48" height="60" viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 4C0 1.79086 1.79086 0 4 0H32L48 16V56C48 58.2091 46.2091 60 44 60H4C1.79086 60 0 58.2091 0 56V4Z" fill="currentColor"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">{tmpl.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{tmpl.category} • v{tmpl.version}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'brand':
        return (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Brand Asset Management</h2>
            <p className="text-slate-500 mb-8">Configure your workspace visual identity to be applied across all documents.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Primary Color</label>
                  <div className="flex gap-4">
                    <input type="color" value={activeTeam.assets.primaryColor} className="w-12 h-12 rounded border-none cursor-pointer" readOnly />
                    <input type="text" value={activeTeam.assets.primaryColor} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3" readOnly />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Letterhead Text</label>
                  <input type="text" value={activeTeam.assets.letterhead} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Company Address</label>
                  <textarea className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 h-24" value={activeTeam.assets.companyAddress} readOnly />
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 flex items-center justify-center text-slate-300 font-bold">LOGO</div>
                <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">Update Logo</button>
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
    </div>
  );
};

export default App;
