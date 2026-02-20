
export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  DISABLED = 'DISABLED'
}

export enum FieldType {
  TEXT = 'STRING',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  DROPDOWN = 'DROPDOWN'
}

export enum FieldCategory {
  DYNAMIC = 'DYNAMIC',
  BRANDING = 'BRANDING'
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface FieldStyle {
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface TemplateField {
  id: string;
  name: string;
  type: FieldType;
  category: FieldCategory;
  required: boolean;
  defaultValue?: string;
  options?: string[];
  rect?: BoundingBox;
  style?: FieldStyle; // Captured branding styles for the overlay text
  pageIndex?: number;
}

export interface VersionHistory {
  id: string;
  version: string;
  date: string;
  author: string;
  changes: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  tags: string[];
  content: string;
  fidelityImage?: string;
  fidelityMaster?: string;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
  version: number;
  history: VersionHistory[];
  usageCount?: number;
  lastUsed?: string;
  isFavorite?: boolean;
}

export interface DetectionResult {
  fields: TemplateField[];
  suggestedTitle: string;
  processedContent: string;
}

export interface BrandAssets {
  logoUrl?: string;
  primaryColor: string;
  letterhead: string;
  footerText: string;
  companyAddress: string;
}

export interface Category {
  id: string;
  name: string;
  subCategories: string[];
}

export interface TeamMember {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  status: MemberStatus;
  invitedAt?: string;
  avatarUrl?: string;
}

export type RolePermissionMap = Record<UserRole, string[]>;


export interface BulkGenJob {
  id: string;
  templateId: string;
  templateName: string;
  totalRecords: number;
  processedRecords: number;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string;
  error?: string;
}

export interface Team {
  id: string;
  name: string;
  type: 'PERSONAL' | 'WORKSPACE';
  members: TeamMember[];
  assets: BrandAssets;
  templates: DocumentTemplate[];
  categories: Category[];

  rolePermissions: RolePermissionMap;
}
