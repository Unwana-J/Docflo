import React, { useState } from 'react';
import { ArrowRight, Building2 } from 'lucide-react';

interface CreateWorkspaceProps {
  onComplete: (workspaceName: string) => void;
}

const CreateWorkspace: React.FC<CreateWorkspaceProps> = ({ onComplete }) => {
  const [workspaceName, setWorkspaceName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (workspaceName.trim()) {
      onComplete(workspaceName);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in slide-in-from-right-8 duration-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl border border-emerald-200">
           <Building2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Name your workspace</h2>
        <p className="mt-2 text-sm text-slate-500">
          This is typically your company or department name.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl shadow-slate-200/50 sm:rounded-[2rem] sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700">Workspace Name</label>
              <div className="mt-2">
                <input
                  type="text"
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="appearance-none block w-full px-4 py-4 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-lg font-bold"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!workspaceName.trim()}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Set up branding <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspace;
