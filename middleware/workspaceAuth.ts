import { Request, Response, NextFunction } from 'express';

// Mock DB interactions for the purpose of the architecture
interface DB {
  query: (sql: string, params: any[]) => Promise<any>;
}
const db: DB = {
  query: async () => ({ rows: [] })
};

export const requireWorkspaceAccess = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.headers['x-workspace-id'];
      
      // Assume user_id is set by prior authentication middleware
      const userId = (req as any).user?.id; 

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }

      if (!workspaceId) {
        return res.status(400).json({ error: 'Bad Request: Missing X-Workspace-ID header' });
      }

      // Query database to ensure user is a member of the workspace
      const result = await db.query(
        `SELECT role, status FROM Workspace_Members 
         WHERE workspace_id = $1 AND user_id = $2`,
        [workspaceId, userId]
      );

      const member = result.rows[0];

      if (!member) {
        return res.status(403).json({ error: 'Forbidden: You do not have access to this workspace' });
      }

      // RBAC Logic: Restrict CREATE and EXPORT actions if PENDING
      if (member.status === 'PENDING') {
        const restrictedMethods = ['POST', 'PUT', 'DELETE', 'PATCH']; // Assume writing/creating/exporting
        // Allow READ-ONLY (GET) access to public templates or preview paths
        if (restrictedMethods.includes(req.method)) {
          return res.status(403).json({ 
            error: 'Forbidden: Your workspace membership is pending. You currently have read-only access.' 
          });
        }
      }

      // Inject validated workspace info to the request for downstream routing
      (req as any).workspaceAccess = {
        role: member.role,
        status: member.status,
        workspaceId
      };

      next();
    } catch (err) {
      console.error('Workspace Auth Middleware Error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};
