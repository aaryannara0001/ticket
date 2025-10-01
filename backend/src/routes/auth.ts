import { Router } from 'express';
import { db } from '../database';
import {
    AuthenticatedRequest,
    authenticateToken,
    AuthUtils,
} from '../middleware/auth';

const router = Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await db.get(
            'SELECT * FROM users WHERE email = ? AND is_active = 1',
            [email],
        );
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await AuthUtils.verifyPassword(
            password,
            user.password_hash,
        );
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate tokens
        const accessToken = AuthUtils.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = AuthUtils.generateRefreshToken({
            userId: user.id,
        });

        // Store refresh token
        const tokenId = `token-${Date.now()}-${Math.random()}`;
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await db.run(
            'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
            [tokenId, user.id, refreshToken, expiresAt.toISOString()],
        );

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                active: user.is_active,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role = 'team_member' } = req.body;

        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ error: 'Name, email, and password are required' });
        }

        // Check if user exists
        const existingUser = await db.get(
            'SELECT id FROM users WHERE email = ?',
            [email],
        );
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Prevent non-admin from registering as admin
        if (role === 'admin') {
            return res.status(403).json({ error: 'Cannot register as admin' });
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
                'Unassigned',
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
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const user = await db.get('SELECT * FROM users WHERE id = ?', [
            req.user!.userId,
        ]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            active: user.is_active,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout
router.post(
    '/logout',
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];

            if (token) {
                // Remove refresh token
                await db.run('DELETE FROM refresh_tokens WHERE token = ?', [
                    token,
                ]);
            }

            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
);

// Refresh token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        // Verify refresh token
        const decoded = AuthUtils.verifyRefreshToken(refreshToken);

        // Check if token exists in database
        const tokenRecord = await db.get(
            'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > ?',
            [refreshToken, new Date().toISOString()],
        );

        if (!tokenRecord) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        // Get user
        const user = await db.get(
            'SELECT * FROM users WHERE id = ? AND is_active = 1',
            [decoded.userId],
        );
        if (!user) {
            return res
                .status(401)
                .json({ error: 'User not found or inactive' });
        }

        // Generate new tokens
        const newAccessToken = AuthUtils.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const newRefreshToken = AuthUtils.generateRefreshToken({
            userId: user.id,
        });

        // Update refresh token in database
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await db.run(
            'UPDATE refresh_tokens SET token = ?, expires_at = ? WHERE id = ?',
            [newRefreshToken, expiresAt.toISOString(), tokenRecord.id],
        );

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});

export default router;
