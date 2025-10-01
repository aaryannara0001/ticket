import { Router } from 'express';
import { db } from '../database';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Get dashboard stats
router.get(
    '/dashboard',
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
        try {
            // Get ticket counts by status
            const statusCounts = await db.all(`
            SELECT status, COUNT(*) as count
            FROM tickets
            GROUP BY status
        `);

            const openTickets =
                statusCounts.find((s) => s.status === 'open')?.count || 0;
            const inProgressTickets =
                statusCounts.find((s) => s.status === 'in_progress')?.count ||
                0;
            const closedTickets =
                statusCounts.find((s) => s.status === 'closed')?.count || 0;
            const resolvedTickets =
                statusCounts.find((s) => s.status === 'resolved')?.count || 0;

            // Get critical tickets
            const criticalCount = await db.get(
                'SELECT COUNT(*) as count FROM tickets WHERE priority = ?',
                ['critical'],
            );
            const criticalTickets = criticalCount.count;

            // Get tickets by department
            const departmentStats = await db.all(`
            SELECT department, COUNT(*) as count
            FROM tickets
            WHERE department IS NOT NULL AND department != ''
            GROUP BY department
            ORDER BY count DESC
        `);

            // Get tickets by priority
            const priorityStats = await db.all(`
            SELECT priority, COUNT(*) as count
            FROM tickets
            GROUP BY priority
            ORDER BY count DESC
        `);

            // Get recent activity (last 10 ticket updates)
            const recentActivity = await db.all(`
            SELECT
                h.id,
                h.action,
                h.created_at,
                t.title as ticket_title,
                t.key as ticket_key,
                u.name as user_name
            FROM ticket_history h
            LEFT JOIN tickets t ON h.ticket_id = t.id
            LEFT JOIN users u ON h.user_id = u.id
            ORDER BY h.created_at DESC
            LIMIT 10
        `);

            const formattedActivity = recentActivity.map((activity: any) => ({
                id: activity.id,
                message: `${activity.user_name} ${activity.action} ticket ${activity.ticket_key}: ${activity.ticket_title}`,
                createdAt: activity.created_at,
            }));

            res.json({
                openTickets,
                inProgressTickets: inProgressTickets + resolvedTickets, // Combine in_progress and resolved
                closedTickets,
                criticalTickets,
                ticketsByDepartment: departmentStats.map((d: any) => ({
                    department: d.department,
                    count: d.count,
                })),
                ticketsByPriority: priorityStats.map((p: any) => ({
                    priority: p.priority,
                    count: p.count,
                })),
                recentActivity: formattedActivity,
            });
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
);

export default router;
