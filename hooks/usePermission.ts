import { Team, UserRole } from '../types';

export const hasPermission = (team: Team, role: UserRole, permissionId: string): boolean => {
    // Admin has total access
    if (role === UserRole.ADMIN) return true;

    const permissions: Record<UserRole, string[]> = {
        [UserRole.ADMIN]: ['*'],
        [UserRole.EDITOR]: [
            'view_repo',
            'generate_doc',
            'edit_brand',
            'upload_tmpl',
            'manage_customers'
        ],
        [UserRole.MEMBER]: [
            'view_repo',
            'generate_doc'
        ],
        [UserRole.VIEWER]: [
            'view_repo',
            'generate_doc'
        ]
    };

    const userPerms = permissions[role] || [];
    return userPerms.includes(permissionId);
};

export const usePermission = (team: Team, role: UserRole) => {
    return {
        can: (permissionId: string) => hasPermission(team, role, permissionId)
    };
};
