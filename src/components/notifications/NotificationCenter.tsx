import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    Bell,
    Check,
    CheckCircle,
    FileText,
    MessageSquare,
    UserPlus,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export interface Notification {
    id: string;
    type:
        | 'mention'
        | 'assignment'
        | 'sla_breach'
        | 'report_ready'
        | 'comment'
        | 'status_change';
    message: string;
    relatedTicket?: string;
    relatedComment?: string;
    read: boolean;
    severity: 'info' | 'warning' | 'critical';
    createdAt: Date;
    updatedAt: Date;
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuthStore();

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification,
            ),
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((notification) => ({ ...notification, read: true })),
        );
    };

    const deleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const getNotificationIcon = (type: string, severity: string) => {
        const iconClass =
            severity === 'critical'
                ? 'text-red-400'
                : severity === 'warning'
                ? 'text-yellow-400'
                : 'text-blue-400';

        switch (type) {
            case 'mention':
                return <MessageSquare className={`w-4 h-4 ${iconClass}`} />;
            case 'assignment':
                return <UserPlus className={`w-4 h-4 ${iconClass}`} />;
            case 'sla_breach':
                return <AlertTriangle className={`w-4 h-4 ${iconClass}`} />;
            case 'report_ready':
                return <FileText className={`w-4 h-4 ${iconClass}`} />;
            case 'status_change':
                return <CheckCircle className={`w-4 h-4 ${iconClass}`} />;
            case 'comment':
                return <MessageSquare className={`w-4 h-4 ${iconClass}`} />;
            default:
                return <Bell className={`w-4 h-4 ${iconClass}`} />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-500/30 text-red-300 border-red-400/50 border';
            case 'warning':
                return 'bg-yellow-500/30 text-yellow-300 border-yellow-400/50 border';
            default:
                return 'bg-blue-500/30 text-blue-300 border-blue-400/50 border';
        }
    };

    // Simulate real-time notifications
    useEffect(() => {
        const interval = setInterval(() => {
            // In a real app, this would be replaced with WebSocket or Server-Sent Events
            if (Math.random() > 0.9) {
                const newNotification: Notification = {
                    id: Date.now().toString(),
                    type: ['mention', 'assignment', 'comment'][
                        Math.floor(Math.random() * 3)
                    ] as any,
                    message: `New notification for ${user?.name}`,
                    read: false,
                    severity: 'info',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                setNotifications((prev) => [
                    newNotification,
                    ...prev.slice(0, 9),
                ]);
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [user?.name]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="relative text-foreground hover:bg-accent"
                    aria-label="Notifications"
                >
                    <Bell className="w-5 h-5" />
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                            ></motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-0 bg-popover border-border"
                align="end"
                sideOffset={8}
            >
                <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        <h3 className="text-popover-foreground font-medium">
                            Notifications
                        </h3>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="text-primary hover:bg-primary/20"
                                >
                                    Mark all read
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="text-muted-foreground hover:bg-accent p-2"
                                title="Close notifications"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {unreadCount} unread notification
                            {unreadCount !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                <ScrollArea className="max-h-[60vh] sm:max-h-[56vh] md:max-h-[48vh]">
                    <div className="p-2">
                        <AnimatePresence>
                            {notifications.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-8 text-center"
                                >
                                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                        No notifications
                                    </p>
                                </motion.div>
                            ) : (
                                notifications.map((notification, index) => (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card
                                            className={`mb-2 border-border transition-all hover:border-border cursor-pointer ${
                                                !notification.read
                                                    ? 'bg-accent border-l-4 border-l-primary shadow-lg'
                                                    : 'bg-card border-l-4 border-l-transparent'
                                            }`}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-3 flex-1">
                                                        <div className="mt-1">
                                                            {getNotificationIcon(
                                                                notification.type,
                                                                notification.severity,
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p
                                                                className={`text-sm leading-relaxed ${
                                                                    !notification.read
                                                                        ? 'text-foreground font-medium'
                                                                        : 'text-muted-foreground'
                                                                }`}
                                                            >
                                                                {
                                                                    notification.message
                                                                }
                                                            </p>
                                                            <div className="flex items-center space-x-2 mt-3">
                                                                <Badge
                                                                    className={`${getSeverityColor(
                                                                        notification.severity,
                                                                    )} font-medium text-xs`}
                                                                >
                                                                    {
                                                                        notification.severity
                                                                    }
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground font-medium">
                                                                    {formatDistanceToNow(
                                                                        notification.createdAt,
                                                                        {
                                                                            addSuffix:
                                                                                true,
                                                                        },
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-1 ml-2">
                                                        {!notification.read && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    markAsRead(
                                                                        notification.id,
                                                                    )
                                                                }
                                                                className="text-primary hover:bg-primary/30 p-2 rounded-md transition-colors"
                                                                title="Mark as read"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                deleteNotification(
                                                                    notification.id,
                                                                )
                                                            }
                                                            className="text-destructive hover:bg-destructive/30 p-2 rounded-md transition-colors"
                                                            title="Delete notification"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        {index < notifications.length - 1 && (
                                            <Separator className="bg-gray-700" />
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </ScrollArea>

                {notifications.length > 0 && (
                    <div className="p-4 border-t border-border">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-border text-foreground hover:bg-accent"
                            onClick={() => {
                                // Navigate to full notifications page
                                setIsOpen(false);
                            }}
                        >
                            View all notifications
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
