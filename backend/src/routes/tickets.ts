import { Router } from 'express';
import { db } from '../database';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Helper function to generate ticket key
function generateTicketKey(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TICK-${timestamp}-${random}`.toUpperCase();
}

// Get all tickets
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const { status, priority, assigneeId } = req.query;

        let query = `
            SELECT
                t.*,
                u.name as reporter_name,
                u.email as reporter_email,
                GROUP_CONCAT(ta.user_id) as assignee_ids,
                GROUP_CONCAT(au.name) as assignee_names
            FROM tickets t
            LEFT JOIN users u ON t.reporter_id = u.id
            LEFT JOIN ticket_assignees ta ON t.id = ta.ticket_id
            LEFT JOIN users au ON ta.user_id = au.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }

        if (priority) {
            query += ' AND t.priority = ?';
            params.push(priority);
        }

        if (assigneeId) {
            query += ' AND ta.user_id = ?';
            params.push(assigneeId);
        }

        query += ' GROUP BY t.id ORDER BY t.created_at DESC';

        const tickets = await db.all(query, params);

        const formattedTickets = tickets.map((ticket) => ({
            id: ticket.id,
            key: ticket.key,
            title: ticket.title,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            department: ticket.department,
            reporterId: ticket.reporter_id,
            assigneeIds: ticket.assignee_ids
                ? ticket.assignee_ids.split(',')
                : [],
            createdAt: ticket.created_at,
            updatedAt: ticket.updated_at,
        }));

        res.json(formattedTickets);
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get my tickets
router.get('/my', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const query = `
            SELECT
                t.*,
                u.name as reporter_name,
                u.email as reporter_email,
                GROUP_CONCAT(ta.user_id) as assignee_ids,
                GROUP_CONCAT(au.name) as assignee_names
            FROM tickets t
            LEFT JOIN users u ON t.reporter_id = u.id
            LEFT JOIN ticket_assignees ta ON t.id = ta.ticket_id
            LEFT JOIN users au ON ta.user_id = au.id
            WHERE ta.user_id = ? OR t.reporter_id = ?
            GROUP BY t.id
            ORDER BY t.created_at DESC
        `;

        const tickets = await db.all(query, [
            req.user!.userId,
            req.user!.userId,
        ]);

        const formattedTickets = tickets.map((ticket) => ({
            id: ticket.id,
            key: ticket.key,
            title: ticket.title,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            department: ticket.department,
            reporterId: ticket.reporter_id,
            assigneeIds: ticket.assignee_ids
                ? ticket.assignee_ids.split(',')
                : [],
            createdAt: ticket.created_at,
            updatedAt: ticket.updated_at,
        }));

        res.json(formattedTickets);
    } catch (error) {
        console.error('Get my tickets error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single ticket
router.get(
    '/:ticketId',
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
        try {
            const { ticketId } = req.params;

            const ticket = await db.get(
                `
            SELECT
                t.*,
                u.name as reporter_name,
                u.email as reporter_email,
                GROUP_CONCAT(ta.user_id) as assignee_ids,
                GROUP_CONCAT(au.name) as assignee_names
            FROM tickets t
            LEFT JOIN users u ON t.reporter_id = u.id
            LEFT JOIN ticket_assignees ta ON t.id = ta.ticket_id
            LEFT JOIN users au ON ta.user_id = au.id
            WHERE t.id = ?
            GROUP BY t.id
        `,
                [ticketId],
            );

            if (!ticket) {
                return res.status(404).json({ error: 'Ticket not found' });
            }

            // Get comments
            const comments = await db.all(
                `
            SELECT c.*, u.name as author_name, u.email as author_email
            FROM comments c
            LEFT JOIN users u ON c.author_id = u.id
            WHERE c.ticket_id = ?
            ORDER BY c.created_at ASC
        `,
                [ticketId],
            );

            // Get attachments
            const attachments = await db.all(
                `
            SELECT a.*, u.name as uploader_name
            FROM attachments a
            LEFT JOIN users u ON a.uploaded_by = u.id
            WHERE a.ticket_id = ?
            ORDER BY a.created_at ASC
        `,
                [ticketId],
            );

            const formattedTicket = {
                id: ticket.id,
                key: ticket.key,
                title: ticket.title,
                description: ticket.description,
                status: ticket.status,
                priority: ticket.priority,
                department: ticket.department,
                reporterId: ticket.reporter_id,
                assigneeIds: ticket.assignee_ids
                    ? ticket.assignee_ids.split(',')
                    : [],
                createdAt: ticket.created_at,
                updatedAt: ticket.updated_at,
                comments: comments.map((c: any) => ({
                    id: c.id,
                    content: c.content,
                    authorId: c.author_id,
                    createdAt: c.created_at,
                })),
                attachments: attachments.map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    url: a.url,
                    size: a.size,
                    type: a.type,
                    uploadedBy: a.uploaded_by,
                    createdAt: a.created_at,
                })),
            };

            res.json(formattedTicket);
        } catch (error) {
            console.error('Get ticket error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
);

// Create ticket
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const {
            title,
            description,
            priority = 'medium',
            department,
            assigneeIds = [],
        } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const ticketId = `ticket-${Date.now()}-${Math.random()}`;
        const ticketKey = generateTicketKey();

        // Create ticket
        await db.run(
            `INSERT INTO tickets (id, key, title, description, priority, status, reporter_id, department, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                ticketId,
                ticketKey,
                title,
                description,
                priority,
                'open',
                req.user!.userId,
                department,
                new Date().toISOString(),
                new Date().toISOString(),
            ],
        );

        // Add assignees
        for (const assigneeId of assigneeIds) {
            await db.run(
                'INSERT INTO ticket_assignees (ticket_id, user_id) VALUES (?, ?)',
                [ticketId, assigneeId],
            );
        }

        // Add to history
        await db.run(
            'INSERT INTO ticket_history (id, ticket_id, user_id, action, new_value) VALUES (?, ?, ?, ?, ?)',
            [
                `hist-${Date.now()}`,
                ticketId,
                req.user!.userId,
                'created',
                JSON.stringify({ title, description, priority, department }),
            ],
        );

        res.status(201).json({
            id: ticketId,
            key: ticketKey,
            title,
            description,
            status: 'open',
            priority,
            department,
            reporterId: req.user!.userId,
            assigneeIds,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update ticket
router.put(
    '/:ticketId',
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
        try {
            const { ticketId } = req.params;
            const {
                title,
                description,
                status,
                priority,
                department,
                assigneeIds,
            } = req.body;

            // Check if ticket exists
            const existingTicket = await db.get(
                'SELECT * FROM tickets WHERE id = ?',
                [ticketId],
            );
            if (!existingTicket) {
                return res.status(404).json({ error: 'Ticket not found' });
            }

            // Check permissions - assignee or reporter can update, admin can update any
            const isAssignee = await db.get(
                'SELECT 1 FROM ticket_assignees WHERE ticket_id = ? AND user_id = ?',
                [ticketId, req.user!.userId],
            );
            const isReporter = existingTicket.reporter_id === req.user!.userId;
            const isAdmin = req.user!.role === 'admin';

            if (!isAssignee && !isReporter && !isAdmin) {
                return res
                    .status(403)
                    .json({ error: 'Insufficient permissions' });
            }

            // Update ticket
            await db.run(
                `UPDATE tickets SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                status = COALESCE(?, status),
                priority = COALESCE(?, priority),
                department = COALESCE(?, department),
                updated_at = ?
             WHERE id = ?`,
                [
                    title,
                    description,
                    status,
                    priority,
                    department,
                    new Date().toISOString(),
                    ticketId,
                ],
            );

            // Update assignees if provided
            if (assigneeIds !== undefined) {
                // Remove existing assignees
                await db.run(
                    'DELETE FROM ticket_assignees WHERE ticket_id = ?',
                    [ticketId],
                );

                // Add new assignees
                for (const assigneeId of assigneeIds) {
                    await db.run(
                        'INSERT INTO ticket_assignees (ticket_id, user_id) VALUES (?, ?)',
                        [ticketId, assigneeId],
                    );
                }
            }

            // Add to history
            const changes: any = {};
            if (title !== undefined) changes.title = title;
            if (description !== undefined) changes.description = description;
            if (status !== undefined) changes.status = status;
            if (priority !== undefined) changes.priority = priority;
            if (department !== undefined) changes.department = department;
            if (assigneeIds !== undefined) changes.assigneeIds = assigneeIds;

            await db.run(
                'INSERT INTO ticket_history (id, ticket_id, user_id, action, new_value) VALUES (?, ?, ?, ?, ?)',
                [
                    `hist-${Date.now()}`,
                    ticketId,
                    req.user!.userId,
                    'updated',
                    JSON.stringify(changes),
                ],
            );

            // Get updated ticket
            const updatedTicket = await db.get(
                'SELECT * FROM tickets WHERE id = ?',
                [ticketId],
            );

            res.json({
                id: updatedTicket.id,
                key: updatedTicket.key,
                title: updatedTicket.title,
                description: updatedTicket.description,
                status: updatedTicket.status,
                priority: updatedTicket.priority,
                department: updatedTicket.department,
                reporterId: updatedTicket.reporter_id,
                assigneeIds: assigneeIds || [],
                createdAt: updatedTicket.created_at,
                updatedAt: updatedTicket.updated_at,
            });
        } catch (error) {
            console.error('Update ticket error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
);

// Get ticket history
router.get(
    '/:ticketId/history',
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
        try {
            const { ticketId } = req.params;

            const history = await db.all(
                `
            SELECT h.*, u.name as user_name
            FROM ticket_history h
            LEFT JOIN users u ON h.user_id = u.id
            WHERE h.ticket_id = ?
            ORDER BY h.created_at DESC
        `,
                [ticketId],
            );

            const formattedHistory = history.map((h: any) => ({
                id: h.id,
                ticketId: h.ticket_id,
                userId: h.user_id,
                action: h.action,
                oldValue: h.old_value ? JSON.parse(h.old_value) : null,
                newValue: h.new_value ? JSON.parse(h.new_value) : null,
                createdAt: h.created_at,
            }));

            res.json(formattedHistory);
        } catch (error) {
            console.error('Get ticket history error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
);

export default router;
