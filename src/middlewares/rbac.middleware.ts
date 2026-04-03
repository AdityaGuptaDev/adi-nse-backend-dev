import { Request, Response, NextFunction } from 'express';
/*import Database from '../config/database';

export const checkPermission = (route: string, permission: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const adminId = req.params?.id;

        if (!adminId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const db = Database.getInstance();

        const query = `
            SELECT 1
            FROM admin_users au
            JOIN role_menu_permissions rmp ON rmp.role_id = au.role_id
            JOIN menus m ON m.id = rmp.menu_id
            JOIN permissions p ON p.id = rmp.permission_id
            WHERE au.id = $1
              AND m.route = $2
              AND p.code = $3
        `;

        const result = await db.query(query, [adminId, route, permission]);

        if (result.rowCount === 0) {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }

        next();
    };
};*/
