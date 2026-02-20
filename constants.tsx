
import { Team, UserRole, FieldType, MemberStatus, FieldCategory } from './types';

const DEFAULT_ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: ['manage_team', 'edit_brand', 'manage_cats', 'upload_tmpl', 'generate_doc', 'view_repo'],
  [UserRole.EDITOR]: ['manage_cats', 'upload_tmpl', 'generate_doc', 'view_repo'],
  [UserRole.MEMBER]: ['generate_doc', 'view_repo'],
  [UserRole.VIEWER]: ['view_repo'],
};

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Product Department',
    type: 'WORKSPACE',
    rolePermissions: { ...DEFAULT_ROLE_PERMISSIONS },

    members: [
      {
        id: 'u1',
        name: 'Alex Johnson',
        email: 'alex@company.com',
        role: UserRole.ADMIN,
        status: MemberStatus.ACTIVE,
        avatarUrl: 'https://picsum.photos/seed/alex/64/64'
      },
      {
        id: 'u2',
        name: 'Sarah Miller',
        email: 'sarah@company.com',
        role: UserRole.EDITOR,
        status: MemberStatus.ACTIVE,
        avatarUrl: 'https://picsum.photos/seed/sarah/64/64'
      }
    ],
    categories: [
      { id: 'cat-1', name: 'Product', subCategories: ['PRDs', 'Specs', 'Roadmaps'] },
      { id: 'cat-2', name: 'Design', subCategories: ['Design Systems', 'User Research', 'Prototypes'] },
    ],
    assets: {
      primaryColor: '#0f172a',
      letterhead: 'Product Strategy & Innovation',
      footerText: 'Internal Use Only - Product Confidential',
      companyAddress: '456 Innovation Blvd, Tech City, TC 10101'
    },
    templates: [
      {
        id: 'tmpl-1',
        name: 'Standard PRD',
        description: 'Comprehensive Product Requirements Document for new features.',
        category: 'Product',
        subCategory: 'PRDs',
        tags: ['Core', 'Strategy', 'Requirements'],
        content: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1 style="color: #0f172a; border-bottom: 2px solid #0f172a;">Product Requirements Document: {{ProjectName}}</h1>
          <p>Client: {{ClientName}}</p>
          <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; background-color: #f8fafc;">Status</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">{{Status}}</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; background-color: #f8fafc;">Owner</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">{{Owner}}</td>
            </tr>
          </table>
          <h3 style="margin-top: 30px; color: #1e293b;">1. Executive Summary</h3>
          <p>{{Summary}}</p>
        </div>`,
        fields: [
          // Added missing category property to satisfy TemplateField interface
          { id: 'f1', name: 'ProjectName', type: FieldType.TEXT, category: FieldCategory.DYNAMIC, required: true },
          { id: 'f1b', name: 'ClientName', type: FieldType.TEXT, category: FieldCategory.DYNAMIC, required: true },
          { id: 'f2', name: 'Status', type: FieldType.DROPDOWN, category: FieldCategory.DYNAMIC, required: true, options: ['Draft', 'Review', 'Approved', 'Shipped'] },
          { id: 'f3', name: 'Owner', type: FieldType.TEXT, category: FieldCategory.DYNAMIC, required: true },
          { id: 'f6', name: 'Summary', type: FieldType.TEXT, category: FieldCategory.DYNAMIC, required: true }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        history: [
          {
            id: 'v1',
            version: '1.0.0',
            date: new Date().toISOString(),
            author: 'Alex Johnson',
            changes: 'Initial PRD template structural setup.'
          }
        ]
      }
    ]
  },
  {
    id: 'team-2',
    name: 'Personal Space',
    type: 'PERSONAL',
    rolePermissions: { ...DEFAULT_ROLE_PERMISSIONS },

    members: [
      {
        id: 'u1',
        name: 'Alex Johnson',
        email: 'alex@company.com',
        role: UserRole.ADMIN,
        status: MemberStatus.ACTIVE,
        avatarUrl: 'https://picsum.photos/seed/alex/64/64'
      }
    ],
    categories: [
      { id: 'cat-p1', name: 'Private', subCategories: ['Notes', 'Drafts'] }
    ],
    assets: {
      primaryColor: '#6366f1',
      letterhead: 'Alex Johnson Private',
      footerText: 'Private Document',
      companyAddress: 'Home Office, Virtual St.'
    },
    templates: []
  }
];
