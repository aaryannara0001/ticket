import * as bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

export class AuthUtils {
    private static readonly JWT_SECRET =
        process.env.JWT_SECRET || 'your-secret-key';
    private static readonly JWT_REFRESH_SECRET =
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
    private static readonly JWT_REFRESH_EXPIRES_IN =
        process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    }

    static async verifyPassword(
        password: string,
        hash: string,
    ): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    static generateAccessToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN,
        } as any);
    }

    static generateRefreshToken(payload: { userId: string }): string {
        return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
            expiresIn: this.JWT_REFRESH_EXPIRES_IN,
        } as any);
    }

    static verifyAccessToken(token: string): JwtPayload {
        return jwt.verify(token, this.JWT_SECRET) as JwtPayload;
    }

    static verifyRefreshToken(token: string): { userId: string } {
        return jwt.verify(token, this.JWT_REFRESH_SECRET) as { userId: string };
    }
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export const authenticateToken = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }

    try {
        const decoded = AuthUtils.verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};

export const requireRole = (allowedRoles: string[]) => {
    return (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (
            !allowedRoles.includes(req.user.role) &&
            req.user.role !== 'admin'
        ) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        next();
    };
};
