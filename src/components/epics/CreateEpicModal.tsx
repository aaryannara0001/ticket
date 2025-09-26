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
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

interface CreateEpicModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateEpic: (epic: {
        title: string;
        description: string;
        status: 'planning' | 'in_progress' | 'completed';
    }) => void;
}

export function CreateEpicModal({
    open,
    onOpenChange,
    onCreateEpic,
}: CreateEpicModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'planning' as 'planning' | 'in_progress' | 'completed',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description) {
            toast({
                title: 'Error',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            onCreateEpic(formData);
            toast({
                title: 'Success',
                description: 'Epic created successfully',
            });

            // Reset form
            setFormData({
                title: '',
                description: '',
                status: 'planning',
            });
            onOpenChange(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create epic',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-popover border-border max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-popover-foreground text-xl font-semibold">
                        Create New Epic
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label
                            htmlFor="title"
                            className="text-popover-foreground font-medium"
                        >
                            Title *
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                }))
                            }
                            className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary placeholder-muted-foreground"
                            placeholder="Enter epic title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="description"
                            className="text-popover-foreground font-medium"
                        >
                            Description *
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary min-h-[120px] placeholder-muted-foreground"
                            placeholder="Describe the epic in detail..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="status"
                            className="text-popover-foreground font-medium"
                        >
                            Initial Status
                        </Label>
                        <select
                            id="status"
                            value={formData.status}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    status: e.target.value as
                                        | 'planning'
                                        | 'in_progress'
                                        | 'completed',
                                }))
                            }
                            className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            <option value="planning">Planning</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-border text-foreground hover:bg-accent"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                        >
                            {loading ? 'Creating...' : 'Create Epic'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
