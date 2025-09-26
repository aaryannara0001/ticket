import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { Target } from 'lucide-react';

interface Epic {
    id: string;
    title: string;
    description: string;
    status: 'planning' | 'in_progress' | 'completed';
    progress: number;
    stories: any[];
    createdAt: Date;
}

interface EpicDetailModalProps {
    epic: Epic;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const statusColors = {
    planning: '#6B7280',
    in_progress: '#FACC15',
    completed: '#4ADE80',
};

export function EpicDetailModal({
    epic,
    open,
    onOpenChange,
}: EpicDetailModalProps) {
    if (!epic) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-popover border-border max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-popover-foreground flex items-center space-x-3">
                        <Target className="w-5 h-5 text-primary" />
                        <span>{epic.title}</span>
                        <Badge
                            style={{
                                backgroundColor:
                                    statusColors[epic.status] + '30',
                                color: statusColors[epic.status],
                                border: `1px solid ${
                                    statusColors[epic.status]
                                }60`,
                            }}
                            className="font-medium"
                        >
                            {epic.status.replace('_', ' ')}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Description */}
                    <div>
                        <h3 className="text-popover-foreground font-semibold mb-2">
                            Description
                        </h3>
                        <p className="text-muted-foreground">
                            {epic.description}
                        </p>
                    </div>

                    {/* Progress */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-popover-foreground font-semibold">
                                Progress
                            </h3>
                            <span className="text-muted-foreground">
                                {epic.progress}%
                            </span>
                        </div>
                        <Progress value={epic.progress} className="w-full" />
                    </div>

                    {/* Stories */}
                    <div>
                        <h3 className="text-popover-foreground font-semibold mb-2">
                            Stories ({epic.stories?.length || 0})
                        </h3>
                        {epic.stories && epic.stories.length > 0 ? (
                            <div className="space-y-2">
                                {epic.stories.map((story: any) => (
                                    <div
                                        key={story.id}
                                        className="p-3 bg-muted rounded-lg"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-foreground font-medium">
                                                {story.title}
                                            </span>
                                            <Badge variant="outline">
                                                {story.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">
                                No stories added yet.
                            </p>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="pt-4 border-t border-border">
                        <div className="text-sm text-muted-foreground">
                            Created{' '}
                            {formatDistanceToNow(epic.createdAt, {
                                addSuffix: true,
                            })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
