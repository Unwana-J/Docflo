
import { Team, UserRole, FieldType } from './types';

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Legal Department',
    type: 'WORKSPACE',
    members: [
      { id: 'u1', name: 'Alex Johnson', email: 'alex@company.com', role: UserRole.ADMIN },
      { id: 'u2', name: 'Sarah Miller', email: 'sarah@company.com', role: UserRole.EDITOR }
    ],
    assets: {
      primaryColor: '#1e40af',
      letterhead: 'Global Corp Legal Services',
      footerText: 'Confidential & Proprietary',
      companyAddress: '123 Justice Way, Law City, LC 90210'
    },
    templates: [
      {
        id: 'tmpl-1',
        name: 'Standard NDA',
        description: 'Mutual non-disclosure agreement for external partners.',
        category: 'Legal',
        content: `NON-DISCLOSURE AGREEMENT
        
        This Agreement is entered into as of {{AgreementDate}} between {{PartyA}} and {{PartyB}}.
        
        The parties agree as follows:
        1. Purpose: The parties wish to explore a business relationship related to {{ProjectName}}.
        2. Confidential Information: All data shared shall be kept secret for a period of {{DurationYears}} years.
        
        Signed,
        {{SignerName}}`,
        fields: [
          { id: 'f1', name: 'AgreementDate', type: FieldType.DATE, required: true },
          { id: 'f2', name: 'PartyA', type: FieldType.TEXT, required: true },
          { id: 'f3', name: 'PartyB', type: FieldType.TEXT, required: true },
          { id: 'f4', name: 'ProjectName', type: FieldType.TEXT, required: true },
          { id: 'f5', name: 'DurationYears', type: FieldType.NUMBER, required: true, defaultValue: '3' },
          { id: 'f6', name: 'SignerName', type: FieldType.TEXT, required: true }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      }
    ]
  },
  {
    id: 'team-2',
    name: 'Personal Space',
    type: 'PERSONAL',
    members: [
      { id: 'u1', name: 'Alex Johnson', email: 'alex@company.com', role: UserRole.ADMIN }
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
