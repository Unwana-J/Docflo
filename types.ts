
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

// ─── White-Out + Stamp Manual Template System ─────────────────────────────────

/**
 * A single editable zone in a PDF, captured in TRUE PDF-SPACE coordinates.
 * PDF origin is BOTTOM-LEFT. Y-axis is already flipped from screen space.
 */
export interface PdfField {
  id: string;
  label: string;            // Human-readable label shown in the form
  pageIndex: number;        // 0-based page index
  x: number;                // PDF-space x (points from left)
  y: number;                // PDF-space y (points from bottom — already flipped)
  width: number;            // PDF-space width in points
  height: number;           // PDF-space height in points
  fontSize: number;         // Detected or default 11
  fontColor: { r: number; g: number; b: number }; // 0-255 per channel
  originalValue: string;    // Original text found in this zone
}

/**
 * A manual PDF template — stores the full original PDF as base64 plus field zones.
 * This is the source of truth for the White-Out + Stamp generation pipeline.
 */
export interface PdfTemplate {
  id: string;
  name: string;
  originalPdfBase64: string; // NON-NEGOTIABLE: full original PDF bytes as base64
  fields: PdfField[];
  thumbnailUrl?: string;     // PNG data-URL of page 1 for display
  createdAt: number;         // Unix ms
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string; // The raw text with placeholders
  fields: TemplateField[];
  originalData?: string;        // base64 data of the PDF/DOCX (AI path)
  originalPdfBase64?: string;   // base64 of original PDF bytes (Manual path — White-Out + Stamp)
  pdfFields?: PdfField[];       // True PDF-space fields (Manual path)
  thumbnailUrl?: string;        // Rendered image for preview
  mimeType?: string;            // application/pdf, etc.
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
