import * as sqlite3 from 'sqlite3';

export class Database {
    private db: sqlite3.Database;

    constructor(filename: string = './ticketing_system.db') {
        this.db = new sqlite3.Database(filename);
        this.db.run('PRAGMA foreign_keys = ON');
    }

    async init(): Promise<void> {
        await this.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'team_member', 'client')),
                department TEXT,
                is_active BOOLEAN DEFAULT 1,
                phone TEXT,
                location TEXT,
                bio TEXT,
                avatar TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await this.run(`
            CREATE TABLE IF NOT EXISTS departments (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                manager_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (manager_id) REFERENCES users(id)
            )
        `);

        await this.run(`
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed')),
                manager_id TEXT,
                progress REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (manager_id) REFERENCES users(id)
            )
        `);

        await this.run(`
            CREATE TABLE IF NOT EXISTS epics (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed')),
                progress REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await this.run(`
            CREATE TABLE IF NOT EXISTS tickets (
                id TEXT PRIMARY KEY,
                key TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                type TEXT DEFAULT 'task' CHECK (type IN ('bug', 'feature', 'task', 'story')),
                priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
                status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
                reporter_id TEXT NOT NULL,
                department TEXT,
                epic_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                due_date DATETIME,
                FOREIGN KEY (reporter_id) REFERENCES users(id),
                FOREIGN KEY (epic_id) REFERENCES epics(id)
            )
        `);

        await this.run(`
            CREATE TABLE IF NOT EXISTS ticket_assignees (
                ticket_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                PRIMARY KEY (ticket_id, user_id),
                FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await this.run(`
            CREATE TABLE IF NOT EXISTS comments (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                author_id TEXT NOT NULL,
                ticket_id TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES users(id),
                FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
            )
        `);

        await this.run(`
            CREATE TABLE IF NOT EXISTS attachments (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                size INTEGER NOT NULL,
                type TEXT NOT NULL,
                uploaded_by TEXT NOT NULL,
                ticket_id TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (uploaded_by) REFERENCES users(id),
                FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
            )
        `);

        await this.run(`
            CREATE TABLE IF NOT EXISTS stories (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                acceptance_criteria TEXT, -- JSON string
                epic_id TEXT NOT NULL,
                completed BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (epic_id) REFERENCES epics(id) ON DELETE CASCADE
            )
        `);

        await this.run(`
            CREATE TABLE IF NOT EXISTS subtasks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                completed BOOLEAN DEFAULT 0,
                ticket_id TEXT,
                story_id TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id),
                FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE
            )
        `);

        await this.run(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                token TEXT UNIQUE NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await this.run(`
            CREATE TABLE IF NOT EXISTS ticket_history (
                id TEXT PRIMARY KEY,
                ticket_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                action TEXT NOT NULL,
                old_value TEXT,
                new_value TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Create indexes for better performance
        await this.run(
            `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
        );
        await this.run(
            `CREATE INDEX IF NOT EXISTS idx_tickets_key ON tickets(key)`,
        );
        await this.run(
            `CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)`,
        );
        await this.run(
            `CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority)`,
        );
        await this.run(
            `CREATE INDEX IF NOT EXISTS idx_tickets_reporter ON tickets(reporter_id)`,
        );
        await this.run(
            `CREATE INDEX IF NOT EXISTS idx_comments_ticket ON comments(ticket_id)`,
        );
        await this.run(
            `CREATE INDEX IF NOT EXISTS idx_attachments_ticket ON attachments(ticket_id)`,
        );

        // Seed default data
        await this.seedDefaultData();
    }

    private async seedDefaultData(): Promise<void> {
        // Check if admin user exists
        const adminExists = await this.get(
            'SELECT id FROM users WHERE email = ?',
            ['admin@company.com'],
        );
        if (!adminExists) {
            const bcrypt = await import('bcryptjs');
            const hashedPassword = await bcrypt.hash('password', 10);
            const adminId = 'admin-' + Date.now();

            await this.run(
                `INSERT INTO users (id, name, email, password_hash, role, department, is_active, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    adminId,
                    'John Admin',
                    'admin@company.com',
                    hashedPassword,
                    'admin',
                    'IT',
                    1,
                    new Date().toISOString(),
                ],
            );

            // Seed default departments
            const departments = [
                {
                    id: 'dept-it',
                    name: 'IT',
                    description: 'Information Technology',
                },
                {
                    id: 'dept-support',
                    name: 'Support',
                    description: 'Customer Support',
                },
                { id: 'dept-sales', name: 'Sales', description: 'Sales Team' },
                {
                    id: 'dept-engineering',
                    name: 'Engineering',
                    description: 'Software Engineering',
                },
            ];

            for (const dept of departments) {
                await this.run(
                    `INSERT OR IGNORE INTO departments (id, name, description, manager_id)
                     VALUES (?, ?, ?, ?)`,
                    [dept.id, dept.name, dept.description, adminId],
                );
            }
        }
    }

    async run(sql: string, params: any[] = []): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async get<T = any>(
        sql: string,
        params: any[] = [],
    ): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row as T);
            });
        });
    }

    async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows as T[]);
            });
        });
    }

    close(): Promise<void> {
        return new Promise((resolve) => {
            this.db.close(() => resolve());
        });
    }
}

export const db = new Database();
