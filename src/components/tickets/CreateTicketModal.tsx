import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { useTicketStore } from '@/store/ticketStore';
import { Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface CreateTicketModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const mockUsers = [
    { id: '1', name: 'John Admin', department: 'IT' },
    { id: '2', name: 'Sarah Manager', department: 'Engineering' },
    { id: '3', name: 'Mike Developer', department: 'Engineering' },
    { id: '4', name: 'Lisa Client', department: 'External' },
];

export function CreateTicketModal({
    open,
    onOpenChange,
}: CreateTicketModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '',
        priority: '',
        assigneeId: '',
        department: '',
        dueDate: '',
    });
    const [attachments, setAttachments] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const { createTicket } = useTicketStore();
    const { user } = useAuthStore();

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            setAttachments((prev) => [...prev, ...acceptedFiles]);
        },
        multiple: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !formData.title ||
            !formData.description ||
            !formData.type ||
            !formData.priority
        ) {
            toast({
                title: 'Error',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            await createTicket({
                title: formData.title,
                description: formData.description,
                type: formData.type as any,
                priority: formData.priority as any,
                status: 'open',
                reporterId: user?.id || '1',
                assigneeId: formData.assigneeId || undefined,
                department:
                    formData.department || user?.department || 'General',
                dueDate: formData.dueDate
                    ? new Date(formData.dueDate)
                    : undefined,
                attachments: [],
                comments: [],
            });

            toast({
                title: 'Success',
                description: 'Ticket created successfully',
            });

            // Reset form
            setFormData({
                title: '',
                description: '',
                type: '',
                priority: '',
                assigneeId: '',
                department: '',
                dueDate: '',
            });
            setAttachments([]);
            onOpenChange(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create ticket',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-popover border-border max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-popover-foreground text-xl font-semibold">
                        Create New Ticket
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                placeholder="Enter ticket title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="type"
                                className="text-popover-foreground font-medium"
                            >
                                Type *
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        type: value,
                                    }))
                                }
                            >
                                <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary [&>span]:text-foreground">
                                    <SelectValue
                                        placeholder="Select type"
                                        className="text-foreground"
                                    />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
                                    <SelectItem
                                        value="bug"
                                        className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                    >
                                        Bug
                                    </SelectItem>
                                    <SelectItem
                                        value="feature"
                                        className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                    >
                                        Feature
                                    </SelectItem>
                                    <SelectItem
                                        value="task"
                                        className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                    >
                                        Task
                                    </SelectItem>
                                    <SelectItem
                                        value="story"
                                        className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                    >
                                        Story
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="priority"
                                className="text-popover-foreground font-medium"
                            >
                                Priority *
                            </Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        priority: value,
                                    }))
                                }
                            >
                                <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary [&>span]:text-foreground">
                                    <SelectValue
                                        placeholder="Select priority"
                                        className="text-foreground"
                                    />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
                                    <SelectItem
                                        value="low"
                                        className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                    >
                                        Low
                                    </SelectItem>
                                    <SelectItem
                                        value="medium"
                                        className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                    >
                                        Medium
                                    </SelectItem>
                                    <SelectItem
                                        value="high"
                                        className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                    >
                                        High
                                    </SelectItem>
                                    <SelectItem
                                        value="critical"
                                        className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                    >
                                        Critical
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="assignee"
                                className="text-popover-foreground font-medium"
                            >
                                Assignee
                            </Label>
                            <Select
                                value={formData.assigneeId}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        assigneeId: value,
                                    }))
                                }
                            >
                                <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary [&>span]:text-foreground">
                                    <SelectValue
                                        placeholder="Select assignee"
                                        className="text-foreground"
                                    />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
                                    {mockUsers.map((user) => (
                                        <SelectItem
                                            key={user.id}
                                            value={user.id}
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            {user.name} ({user.department})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="department"
                                className="text-popover-foreground font-medium"
                            >
                                Department
                            </Label>
                            <Input
                                id="department"
                                value={formData.department}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        department: e.target.value,
                                    }))
                                }
                                className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary placeholder-muted-foreground"
                                placeholder="Enter department"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="dueDate"
                                className="text-popover-foreground font-medium"
                            >
                                Due Date
                            </Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        dueDate: e.target.value,
                                    }))
                                }
                                className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
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
                            placeholder="Describe the ticket in detail..."
                            required
                        />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label className="text-popover-foreground font-medium">
                            Attachments
                        </Label>
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                isDragActive
                                    ? 'border-primary bg-primary/20'
                                    : 'border-border hover:border-primary/60'
                            }`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground font-medium">
                                {isDragActive
                                    ? 'Drop files here...'
                                    : 'Drag & drop files here, or click to select'}
                            </p>
                        </div>

                        {attachments.length > 0 && (
                            <div className="space-y-2">
                                {attachments.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-background p-3 rounded-lg border border-border"
                                    >
                                        <span className="text-foreground text-sm font-medium">
                                            {file.name}
                                        </span>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                removeAttachment(index)
                                            }
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
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
                            {loading ? 'Creating...' : 'Create Ticket'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
