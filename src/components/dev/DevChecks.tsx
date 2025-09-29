import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useTicketStore } from '@/store/ticketStore';
import { useState } from 'react';

export function DevChecks() {
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState<
        Array<{ name: string; ok: boolean; message?: string }>
    >([]);

    const run = async () => {
        setRunning(true);
        setResults([]);
        const push = (name: string, ok: boolean, message?: string) => {
            setResults((r) => [...r, { name, ok, message }]);
        };

        try {
            const ticketStore = useTicketStore.getState();
            const authStore = useAuthStore.getState();

            // Ensure user exists
            if (!authStore.user) {
                push(
                    'Auth user present',
                    false,
                    'No user logged in (use demo credentials)',
                );
                setRunning(false);
                return;
            }
            push('Auth user present', true, `user=${authStore.user.email}`);

            // fetchDashboardStats
            try {
                await ticketStore.fetchDashboardStats();
                const stats = ticketStore.dashboardStats;
                push(
                    'fetchDashboardStats',
                    !!stats,
                    stats ? 'OK' : 'dashboardStats null',
                );
            } catch (err: any) {
                push('fetchDashboardStats', false, String(err));
            }

            // fetchTickets all
            try {
                await ticketStore.fetchTickets('all');
                push(
                    'fetchTickets(all)',
                    ticketStore.tickets.length >= 0,
                    `count=${ticketStore.tickets.length}`,
                );
            } catch (err: any) {
                push('fetchTickets(all)', false, String(err));
            }

            // fetchTickets assigned
            try {
                await ticketStore.fetchTickets('assigned');
                push(
                    'fetchTickets(assigned)',
                    true,
                    `count=${ticketStore.tickets.length}`,
                );
            } catch (err: any) {
                push('fetchTickets(assigned)', false, String(err));
            }

            // fetchTickets reported
            try {
                await ticketStore.fetchTickets('reported');
                push(
                    'fetchTickets(reported)',
                    true,
                    `count=${ticketStore.tickets.length}`,
                );
            } catch (err: any) {
                push('fetchTickets(reported)', false, String(err));
            }

            // createTicket
            let createdId: string | null = null;
            try {
                const newTicketData: any = {
                    title: `Dev Check ${Date.now()}`,
                    description: 'Created by DevChecks',
                    type: 'task',
                    priority: 'low',
                    status: 'open',
                    department: 'IT',
                };
                await ticketStore.createTicket(newTicketData);
                const created = ticketStore.tickets.find(
                    (t) => t.title === newTicketData.title,
                );
                if (created) {
                    createdId = created.id;
                    push('createTicket', true, `id=${createdId}`);
                } else {
                    push('createTicket', false, 'created ticket not found');
                }
            } catch (err: any) {
                push('createTicket', false, String(err));
            }

            // updateTicket
            if (createdId) {
                try {
                    await ticketStore.updateTicket(createdId, {
                        title: 'Dev Check (updated)',
                    });
                    const updated = ticketStore.tickets.find(
                        (t) => t.id === createdId,
                    );
                    push(
                        'updateTicket',
                        updated?.title === 'Dev Check (updated)',
                        updated ? `title=${updated.title}` : 'not found',
                    );
                } catch (err: any) {
                    push('updateTicket', false, String(err));
                }
            }

            // addComment
            if (createdId) {
                try {
                    const before =
                        ticketStore.tickets.find((t) => t.id === createdId)
                            ?.comments.length ?? 0;
                    await ticketStore.addComment(
                        createdId,
                        'DevChecks comment',
                    );
                    const after =
                        ticketStore.tickets.find((t) => t.id === createdId)
                            ?.comments.length ?? 0;
                    push(
                        'addComment',
                        after === before + 1,
                        `before=${before} after=${after}`,
                    );
                } catch (err: any) {
                    push('addComment', false, String(err));
                }
            }

            // addAttachment
            if (createdId) {
                try {
                    const before =
                        ticketStore.tickets.find((t) => t.id === createdId)
                            ?.attachments.length ?? 0;
                    // Provide required fields according to Attachment type
                    await ticketStore.addAttachment(createdId, {
                        name: 'dev.txt',
                        url: 'https://example.com/dev.txt',
                        size: 123,
                        type: 'file',
                        uploadedBy: authStore.user?.id || '1',
                    });
                    const after =
                        ticketStore.tickets.find((t) => t.id === createdId)
                            ?.attachments.length ?? 0;
                    push(
                        'addAttachment',
                        after === before + 1,
                        `before=${before} after=${after}`,
                    );
                } catch (err: any) {
                    push('addAttachment', false, String(err));
                }
            }

            // deleteTicket
            if (createdId) {
                try {
                    await ticketStore.deleteTicket(createdId);
                    const exists = ticketStore.tickets.find(
                        (t) => t.id === createdId,
                    );
                    push(
                        'deleteTicket',
                        !exists,
                        exists ? 'still exists' : 'deleted',
                    );
                } catch (err: any) {
                    push('deleteTicket', false, String(err));
                }
            }
        } catch (err: any) {
            push('runChecks', false, String(err));
        }

        setRunning(false);
    };

    return (
        <Card className="bg-card border-border shadow">
            <CardHeader>
                <CardTitle>Dev System Checks</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-3">
                    <Button onClick={run} disabled={running}>
                        {running ? 'Running...' : 'Run Checks'}
                    </Button>
                </div>

                <div className="space-y-2">
                    {results.map((r, i) => (
                        <div
                            key={i}
                            className={`p-2 rounded border ${
                                r.ok
                                    ? 'border-green-400 bg-green-50'
                                    : 'border-red-400 bg-red-50'
                            }`}
                        >
                            <div className="font-medium">{r.name}</div>
                            <div className="text-sm text-muted-foreground">
                                {r.message}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
