import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { db } from './database';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import reportRoutes from './routes/reports';
import ticketRoutes from './routes/tickets';
import userRoutes from './routes/users';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    }),
);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/reports', reportRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user-specific room for real-time updates
    socket.on('join', (userId: string) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined room user-${userId}`);
    });

    // Handle ticket updates
    socket.on('ticket-update', (data) => {
        // Broadcast to all connected clients
        io.emit('ticket-updated', data);
    });

    // Handle new comments
    socket.on('comment-added', (data) => {
        // Broadcast to ticket room
        io.to(`ticket-${data.ticketId}`).emit('comment-added', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Global error handler
app.use(
    (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    },
);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
    try {
        // Initialize database
        await db.init();
        console.log('Database initialized successfully');

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(
                `Environment: ${process.env.NODE_ENV || 'development'}`,
            );
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await db.close();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await db.close();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

startServer();

export { io };
