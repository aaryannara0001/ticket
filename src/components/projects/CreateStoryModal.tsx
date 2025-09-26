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

interface CreateStoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateStory: (story: {
        title: string;
        description: string;
        acceptanceCriteria: string[];
    }) => Promise<void>;
}

export function CreateStoryModal({
    open,
    onOpenChange,
    onCreateStory,
}: CreateStoryModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;

        setLoading(true);
        try {
            await onCreateStory({
                title: title.trim(),
                description: description.trim(),
                acceptanceCriteria: acceptanceCriteria
                    .split('\n')
                    .map((criteria) => criteria.trim())
                    .filter((criteria) => criteria.length > 0),
            });

            // Reset form
            setTitle('');
            setDescription('');
            setAcceptanceCriteria('');
            onOpenChange(false);
        } catch (error) {
            console.error('Error creating story:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setAcceptanceCriteria('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-popover border-border max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-popover-foreground">
                        Create New Story
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label
                            htmlFor="story-title"
                            className="text-popover-foreground"
                        >
                            Title
                        </Label>
                        <Input
                            id="story-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-background border-border text-foreground"
                            placeholder="Enter story title..."
                            required
                        />
                    </div>

                    <div>
                        <Label
                            htmlFor="story-description"
                            className="text-popover-foreground"
                        >
                            Description
                        </Label>
                        <Textarea
                            id="story-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-background border-border text-foreground"
                            placeholder="Describe what this story accomplishes..."
                            rows={3}
                            required
                        />
                    </div>

                    <div>
                        <Label
                            htmlFor="acceptance-criteria"
                            className="text-popover-foreground"
                        >
                            Acceptance Criteria
                        </Label>
                        <Textarea
                            id="acceptance-criteria"
                            value={acceptanceCriteria}
                            onChange={(e) =>
                                setAcceptanceCriteria(e.target.value)
                            }
                            className="bg-background border-border text-foreground"
                            placeholder="Enter each criteria on a new line..."
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Enter each acceptance criteria on a separate line
                        </p>
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
                            disabled={
                                loading || !title.trim() || !description.trim()
                            }
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            {loading ? 'Creating...' : 'Create Story'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
