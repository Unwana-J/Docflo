import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { ChevronDown, Check, Building2, User } from 'lucide-react';

const WorkspaceSwitcher: React.FC = () => {
  const { workspaces, activeWorkspace, setActiveWorkspaceId } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!activeWorkspace) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl p-3 transition-colors text-left"
      >
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
          style={{ backgroundColor: activeWorkspace.assets.primaryColor }}
        >
          {activeWorkspace.assets.logoUrl ? (
             <img src={activeWorkspace.assets.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-white font-bold text-sm">
              {activeWorkspace.name.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{activeWorkspace.name}</p>
          <p className="text-slate-400 text-xs truncate capitalize">{activeWorkspace.type.toLowerCase()}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1">
            <p className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Switch Workspace</p>
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => {
                  setActiveWorkspaceId(workspace.id);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-700 transition-colors text-left group"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: workspace.assets.primaryColor }}
                >
                  {workspace.type === 'PERSONAL' ? <User className="w-4 h-4 text-white" /> : <Building2 className="w-4 h-4 text-white" />}
                </div>
                <span className="flex-1 text-sm font-medium text-white truncate">{workspace.name}</span>
                {activeWorkspace.id === workspace.id && (
                  <Check className="w-4 h-4 text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
