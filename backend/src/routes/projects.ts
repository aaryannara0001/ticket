import { Router } from 'express';
import { db } from '../database';
import {
    AuthenticatedRequest,
    authenticateToken,
    requireRole,
} from '../middleware/auth';

const router = Router();

// Get all projects
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const projects = await db.all(`
            SELECT p.*, u.name as manager_name
            FROM projects p
            LEFT JOIN users u ON p.manager_id = u.id
            ORDER BY p.created_at DESC
        `);

        const formattedProjects = projects.map((project) => ({
            id: project.id,
            title: project.title,
            description: project.description,
            status: project.status,
            managerId: project.manager_id,
            progress: project.progress,
            createdAt: project.created_at,
            updatedAt: project.updated_at,
        }));

        res.json(formattedProjects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create project (admin/manager only)
router.post(
    '/',
    authenticateToken,
    requireRole(['admin', 'manager']),
    async (req: AuthenticatedRequest, res) => {
        try {
            const { name, description, key } = req.body;

            if (!name || !key) {
                return res
                    .status(400)
                    .json({ error: 'Name and key are required' });
            }

            // Check if key is unique
            const existingProject = await db.get(
                'SELECT id FROM projects WHERE title = ?',
                [name],
            );
            if (existingProject) {
                return res
                    .status(409)
                    .json({ error: 'Project with this name already exists' });
            }

            const projectId = `project-${Date.now()}-${Math.random()}`;

            await db.run(
                `INSERT INTO projects (id, title, description, status, manager_id, progress, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    projectId,
                    name,
                    description,
                    'planning',
                    req.user!.userId,
                    0,
                    new Date().toISOString(),
                    new Date().toISOString(),
                ],
            );

            res.status(201).json({
                id: projectId,
                title: name,
                description,
                status: 'planning',
                managerId: req.user!.userId,
                progress: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Create project error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
);

// Update project
router.put(
    '/:projectId',
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
        try {
            const { projectId } = req.params;
            const { name, description, status, progress } = req.body;

            // Check if project exists
            const existingProject = await db.get(
                'SELECT * FROM projects WHERE id = ?',
                [projectId],
            );
            if (!existingProject) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Check permissions - project manager or admin can update
            if (
                existingProject.manager_id !== req.user!.userId &&
                req.user!.role !== 'admin'
            ) {
                return res
                    .status(403)
                    .json({ error: 'Insufficient permissions' });
            }

            await db.run(
                `UPDATE projects SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                status = COALESCE(?, status),
                progress = COALESCE(?, progress),
                updated_at = ?
             WHERE id = ?`,
                [
                    name,
                    description,
                    status,
                    progress,
                    new Date().toISOString(),
                    projectId,
                ],
            );

            // Get updated project
            const updatedProject = await db.get(
                'SELECT * FROM projects WHERE id = ?',
                [projectId],
            );

            res.json({
                id: updatedProject.id,
                title: updatedProject.title,
                description: updatedProject.description,
                status: updatedProject.status,
                managerId: updatedProject.manager_id,
                progress: updatedProject.progress,
                createdAt: updatedProject.created_at,
                updatedAt: updatedProject.updated_at,
            });
        } catch (error) {
            console.error('Update project error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
);

// Delete project (admin only)
router.delete(
    '/:projectId',
    authenticateToken,
    requireRole(['admin']),
    async (req: AuthenticatedRequest, res) => {
        try {
            const { projectId } = req.params;

            // Check if project exists
            const project = await db.get(
                'SELECT * FROM projects WHERE id = ?',
                [projectId],
            );
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            await db.run('DELETE FROM projects WHERE id = ?', [projectId]);

            res.json({ message: 'Project deleted successfully' });
        } catch (error) {
            console.error('Delete project error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
);

export default router;
