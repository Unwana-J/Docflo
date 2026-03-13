
export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  MEMBER = 'MEMBER'
}

export enum FieldType {
  TEXT = 'STRING',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  DROPDOWN = 'DROPDOWN'
}

export interface TemplateField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  defaultValue?: string;
  options?: string[]; // For dropdowns
  x?: number;         // Normalized X coordinate (0-1000)
  y?: number;         // Normalized Y coordinate (0-1000)
  width?: number;     // Normalized width
  height?: number;    // Normalized height
  page?: number;      // Page number for multi-page docs
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string; // The raw text with placeholders
  fields: TemplateField[];
  originalData?: string; // base64 data of the PDF/DOCX
  thumbnailUrl?: string; // Rendered image for preview
  mimeType?: string;     // application/pdf, etc.
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface BrandAssets {
  logoUrl?: string;
  primaryColor: string;
  letterhead: string;
  footerText: string;
  companyAddress: string;
}

export interface Team {
  id: string;
  name: string;
  type: 'PERSONAL' | 'WORKSPACE';
  workspaceType: string;   // e.g. "Project Management", "Legal", "HR"
  categories: string[];    // user-defined template categories
  members: Array<{
    id: string;
    email: string;
    role: UserRole;
    name: string;
  }>;
  assets: BrandAssets;
  templates: DocumentTemplate[];
}

export interface AppState {
  currentUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  teams: Team[];
  activeTeamId: string;
}
