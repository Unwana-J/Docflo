-- Core Identity
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tenant Data & Branding
CREATE TABLE Workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    branding_color VARCHAR(50) DEFAULT '#000000',
    logo_url VARCHAR(1024),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Member status enums
CREATE TYPE member_role AS ENUM ('ADMIN', 'MEMBER');
CREATE TYPE member_status AS ENUM ('ACTIVE', 'PENDING');

-- Workspace Membership Matrix
CREATE TABLE Workspace_Members (
    workspace_id UUID REFERENCES Workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    role member_role DEFAULT 'MEMBER',
    status member_status DEFAULT 'PENDING',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workspace_id, user_id)
);

-- Invite logic mapping
CREATE TABLE Invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES Workspaces(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    invited_email VARCHAR(255),
    assigned_role member_role DEFAULT 'MEMBER',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES Users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PDF Injection Metadata
CREATE TABLE Template_Field_Coordinates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL, -- Reference to templates table (once implemented)
    field_id VARCHAR(255) NOT NULL,
    page_number INTEGER NOT NULL,
    x_pos REAL NOT NULL,
    y_pos REAL NOT NULL,
    width REAL NOT NULL,
    height REAL NOT NULL,
    font_family VARCHAR(255),
    font_size REAL,
    font_weight VARCHAR(50),
    hex_color VARCHAR(7)
);

-- Create indexes for frequent queries
CREATE INDEX idx_workspace_members_user_id ON Workspace_Members(user_id);
CREATE INDEX idx_invites_token ON Invites(token);
