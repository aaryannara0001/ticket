import { Router } from 'express';
import { db } from '../database';
import {
    AuthenticatedRequest,
    authenticateToken,
    AuthUtils,
    requireRole,
} from '../middleware/auth';

const router = Router();

// Get all users
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const users = await db.all(`
            SELECT id, name, email, role, department, is_active, phone, location, bio, avatar, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
        `);

        const formattedUsers = users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            active: user.is_active,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create user (admin only)
router.post(
    '/',
    authenticateToken,
    requireRole(['admin']),
    async (req: AuthenticatedRequest, res) => {
        try {
            const { name, email, password, role, department } = req.body;

            if (!name || !email || !password || !role) {
                return res
                    .status(400)
                    .json({
                        error: 'Name, email, password, and role are required',
                    });
            }

            // Check if user exists
            const existingUser = await db.get(
                'SELECT id FROM users WHERE email = ?',
                [email],
            );
            if (existingUser) {
                return res.status(409).json({ error: 'User already exists' });
            }

            // Hash password
            const passwordHash = await AuthUtils.hashPassword(password);

            // Create user
            const userId = `user-${Date.now()}-${Math.random()}`;
            await db.run(
                `INSERT INTO users (id, name, email, password_hash, role, department, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    name,
                    email,
                    passwordHash,
                    role,
                    department || 'Unassigned',
                    1,
                    new Date().toISOString(),
                    new Date().toISOString(),
                ],
            );

            res.status(201).json({
                id: userId,
                name,
                email,
                role,
                active: true,
                createdAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
);

// Update user
router.put(
    '/:userId',
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
        try {
            const { userId } = req.params;
            const {
                name,
                email,
                role,
                department,
                isActive,
                phone,
                location,
                bio,
                avatar,
            } = req.body;

            // Check permissions - users can update themselves, admins can update anyone
            if (req.user!.userId !== userId && req.user!.role !== 'admin') {
                return res
                    .status(403)
                    .json({ error: 'Insufficient permissions' });
            }

            // Prevent non-admins from changing roles or deactivating users
            if (req.user!.role !== 'admin' && (role || isActive === false)) {
                return res
                    .status(403)
                    .json({
                        error: 'Insufficient permissions to change role or status',
                    });
            }

            // Check if user exists
            const existingUser = await db.get(
                'SELECT * FROM users WHERE id = ?',
                [userId],
            );
            if (!existingUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Update user
            await db.run(
                `UPDATE users SET
                name = COALESCE(?, name),
                email = COALESCE(?, email),
                role = COALESCE(?, role),
                department = COALESCE(?, department),
                is_active = COALESCE(?, is_active),
                phone = COALESCE(?, phone),
                location = COALESCE(?, location),
                bio = COALESCE(?, bio),
                avatar = COALESCE(?, avatar),
                updated_at = ?
             WHERE id = ?`,
                [
                    name,
                    email,
                    role,
                    department,
                    isActive,
                    phone,
                    location,
                    bio,
                    avatar,
                    new Date().toISOString(),
                    userId,
                ],
            );

            // Get updated user
            const updatedUser = await db.get(
                'SELECT * FROM users WHERE id = ?',
                [userId],
            );

            res.json({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                active: updatedUser.is_active,
                createdAt: updatedUser.created_at,
                updatedAt: updatedUser.updated_at,
            });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
);

// Delete user (admin only)
router.delete(
    '/:userId',
    authenticateToken,
    requireRole(['admin']),
    async (req: AuthenticatedRequest, res) => {
        try {
            const { userId } = req.params;

            // Check if user exists
            const user = await db.get('SELECT * FROM users WHERE id = ?', [
                userId,
            ]);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Prevent deleting self
            if (req.user!.userId === userId) {
                return res
                    .status(400)
                    .json({ error: 'Cannot delete your own account' });
            }

            // Delete user (cascade will handle related records)
            await db.run('DELETE FROM users WHERE id = ?', [userId]);

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
);

export default router;
