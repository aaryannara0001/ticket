import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface CreateSubTaskModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateSubTask: (subTask: {
        title: string;
        description?: string;
    }) => Promise<void>;
    storyTitle: string;
}

export function CreateSubTaskModal({
    open,
    onOpenChange,
    onCreateSubTask,
    storyTitle,
}: CreateSubTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            await onCreateSubTask({
                title: title.trim(),
                description: description.trim() || undefined,
            });

            // Reset form
            setTitle('');
            setDescription('');
            onOpenChange(false);
        } catch (error) {
            console.error('Error creating sub-task:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-popover border-border max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-popover-foreground">
                        Add Sub-task to "{storyTitle}"
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label
                            htmlFor="subtask-title"
                            className="text-popover-foreground"
                        >
                            Title
                        </Label>
                        <Input
                            id="subtask-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-background border-border text-foreground"
                            placeholder="Enter sub-task title..."
                            required
                        />
                    </div>

                    <div>
                        <Label
                            htmlFor="subtask-description"
                            className="text-popover-foreground"
                        >
                            Description (Optional)
                        </Label>
                        <Textarea
                            id="subtask-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-background border-border text-foreground"
                            placeholder="Describe the sub-task in detail..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                            className="border-border text-foreground hover:bg-accent"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !title.trim()}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            {loading ? 'Adding...' : 'Add Sub-task'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
