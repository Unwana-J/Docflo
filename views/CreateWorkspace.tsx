import React, { useState } from 'react';
import { ArrowRight, Building2, Plus, X, ChevronDown } from 'lucide-react';

interface CreateWorkspaceProps {
  onComplete: (workspaceName: string, workspaceType: string, categories: string[]) => void;
}

const WORKSPACE_TYPE_SUGGESTIONS: Record<string, string[]> = {
  'Project Management': ['SOPs', 'PIDs', 'Project Plans', 'Risk Registers', 'Status Reports'],
  'Legal': ['Contracts', 'NDAs', 'Compliance', 'Litigation', 'Policies'],
  'Human Resources': ['Offer Letters', 'Onboarding', 'Performance Reviews', 'Policies', 'Contracts'],
  'Finance': ['Invoices', 'Budgets', 'Reports', 'Forecasts', 'Audits'],
  'Sales & Marketing': ['Proposals', 'Case Studies', 'Briefs', 'Presentations', 'Contracts'],
  'Operations': ['Runbooks', 'Processes', 'Checklists', 'Reports', 'Guides'],
  'Engineering': ['RFCs', 'ADRs', 'Specs', 'Release Notes', 'Postmortems'],
  'General': ['Documents', 'Reports', 'Templates', 'Notes'],
};

const WORKSPACE_TYPES = Object.keys(WORKSPACE_TYPE_SUGGESTIONS);

const CreateWorkspace: React.FC<CreateWorkspaceProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'name' | 'type' | 'categories'>('name');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceType, setWorkspaceType] = useState('');
  const [customType, setCustomType] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  const resolvedType = workspaceType === '__custom__' ? customType : workspaceType;

  const handleSelectType = (type: string) => {
    setWorkspaceType(type);
    if (type !== '__custom__') {
      setCategories(WORKSPACE_TYPE_SUGGESTIONS[type] || []);
    } else {
      setCategories([]);
    }
  };

  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setNewCategory('');
    }
  };

  const removeCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  const handleFinish = () => {
    onComplete(workspaceName, resolvedType || 'General', categories.length ? categories : ['General']);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in slide-in-from-right-8 duration-500">
      {/* Step indicator */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg mb-8">
        <div className="flex items-center justify-center gap-2">
          {(['name', 'type', 'categories'] as const).map((s, i) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === s ? 'bg-blue-600 text-white' :
                (['name', 'type', 'categories'].indexOf(step) > i) ? 'bg-emerald-500 text-white' :
                'bg-slate-200 text-slate-400'
              }`}>{i + 1}</div>
              {i < 2 && <div className={`flex-1 h-0.5 max-w-[60px] rounded ${(['name','type','categories'].indexOf(step) > i) ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-around mt-2 text-[11px] text-slate-400 font-semibold px-2">
          <span>Name</span><span>Type</span><span>Categories</span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow border border-emerald-200">
            <Building2 className="w-7 h-7 text-emerald-600" />
          </div>
          {step === 'name' && <><h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Name your workspace</h2><p className="mt-1 text-sm text-slate-500">Usually your team or company name.</p></>}
          {step === 'type' && <><h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">What does your team do?</h2><p className="mt-1 text-sm text-slate-500">This helps us suggest relevant template categories.</p></>}
          {step === 'categories' && <><h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customize your categories</h2><p className="mt-1 text-sm text-slate-500">These label your templates in the repository. You can change them later.</p></>}
        </div>

        <div className="bg-white py-8 px-6 shadow-2xl shadow-slate-200/50 rounded-[2rem] border border-slate-100">

          {/* Step 1 – Workspace name */}
          {step === 'name' && (
            <div className="space-y-6">
              <input
                type="text"
                required
                autoFocus
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && workspaceName.trim() && setStep('type')}
                className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-xl font-bold placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Acme Corp, Legal Team…"
              />
              <button
                disabled={!workspaceName.trim()}
                onClick={() => setStep('type')}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2 – Workspace type */}
          {step === 'type' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {WORKSPACE_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => handleSelectType(type)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-bold text-left transition-all ${
                      workspaceType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
                <button
                  onClick={() => handleSelectType('__custom__')}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-bold text-left transition-all col-span-2 ${
                    workspaceType === '__custom__'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-dashed border-slate-200 text-slate-400 hover:border-slate-400'
                  }`}
                >
                  + Something else…
                </button>
              </div>

              {workspaceType === '__custom__' && (
                <input
                  type="text"
                  autoFocus
                  value={customType}
                  onChange={e => setCustomType(e.target.value)}
                  placeholder="Describe your workspace type…"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}

              <button
                disabled={!workspaceType || (workspaceType === '__custom__' && !customType.trim())}
                onClick={() => setStep('categories')}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-40 transition-colors mt-2"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 3 – Categories */}
          {step === 'categories' && (
            <div className="space-y-5">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Your categories (edit freely)</p>
              <div className="flex flex-wrap gap-2 min-h-[60px]">
                {categories.map(cat => (
                  <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-bold">
                    {cat}
                    <button onClick={() => removeCategory(cat)} className="hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {categories.length === 0 && <p className="text-slate-300 text-sm italic">No categories yet — add some below.</p>}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCategory()}
                  placeholder="Add a category…"
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addCategory}
                  disabled={!newCategory.trim()}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors mt-2"
              >
                Set up branding <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspace;
