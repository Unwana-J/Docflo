import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, UserRole } from '../types';

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING'
}

export interface WorkspaceMember {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  status: MemberStatus;
}

export interface Workspace extends Omit<Team, 'members'> {
  members: WorkspaceMember[];
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  activeWorkspace: Workspace | null;
  currentUserStatus: MemberStatus | null;
  currentUserRole: UserRole | null;
  setActiveWorkspaceId: (id: string) => void;
  getAuthHeaders: () => Record<string, string>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode, initialWorkspaces?: Workspace[] }> = ({ children, initialWorkspaces = [] }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string>('');

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('docuflow_active_workspace');
    if (saved && workspaces.some(w => w.id === saved)) {
      setActiveWorkspaceIdState(saved);
    } else if (workspaces.length > 0) {
      setActiveWorkspaceIdState(workspaces[0].id);
    }
  }, [workspaces]);

  const setActiveWorkspaceId = (id: string) => {
    setActiveWorkspaceIdState(id);
    localStorage.setItem('docuflow_active_workspace', id);
  };

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || null;
  
  // Mock current user for now
  const currentUserId = 'user-1'; 
  const currentMember = activeWorkspace?.members.find(m => m.id === currentUserId);
  
  const currentUserStatus = currentMember?.status || null;
  const currentUserRole = currentMember?.role || null;

  // Function to get headers for API calls
  const getAuthHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'X-Workspace-ID': activeWorkspaceId
    };
  }, [activeWorkspaceId]);

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      activeWorkspaceId,
      activeWorkspace,
      currentUserStatus,
      currentUserRole,
      setActiveWorkspaceId,
      getAuthHeaders
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
