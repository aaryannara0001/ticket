import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users } from 'lucide-react';
import { useState } from 'react';

interface ProjectFormData {
    title: string;
    description: string;
    assignedMembers: string[];
}

interface ProjectFormProps {
    availableUsers: string[];
    onSubmit: (data: ProjectFormData) => void;
    onCancel: () => void;
}

export function ProjectForm({
    availableUsers,
    onSubmit,
    onCancel,
}: ProjectFormProps) {
    const [formData, setFormData] = useState<ProjectFormData>({
        title: '',
        description: '',
        assignedMembers: [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.description.trim()) {
            return;
        }

        // Log the full project object to console
        console.log('Project Form Submission:', {
            title: formData.title,
            description: formData.description,
            assignedMembers: formData.assignedMembers,
        });

        onSubmit(formData);
    };

    const toggleMember = (name: string) => {
        setFormData((prev) => ({
            ...prev,
            assignedMembers: prev.assignedMembers.includes(name)
                ? prev.assignedMembers.filter((n) => n !== name)
                : [...prev.assignedMembers, name],
        }));
    };

    return (
        <Card className="bg-card border-border shadow-lg">
            <CardHeader>
                <CardTitle className="text-foreground text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Create New Project
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Project Title */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="title"
                            className="text-foreground font-medium"
                        >
                            Project Title *
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
                            className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="Enter project title..."
                            required
                        />
                    </div>

                    {/* Project Description */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="description"
                            className="text-foreground font-medium"
                        >
                            Project Description *
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
                            className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary sm:min-h-[100px]"
                            placeholder="Describe the project scope, objectives, and requirements..."
                            required
                        />
                    </div>

                    {/* Assign Team Members Section */}
                    <div className="space-y-4">
                        <Label className="text-foreground font-medium text-lg">
                            Assign Team Members
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {availableUsers.map((name) => (
                                <Button
                                    key={name}
                                    type="button"
                                    variant="outline"
                                    onClick={() => toggleMember(name)}
                                    className={`justify-start ${
                                        formData.assignedMembers.includes(name)
                                            ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                                            : 'bg-background border-border text-foreground hover:bg-accent'
                                    }`}
                                >
                                    {name}
                                </Button>
                            ))}
                        </div>
                        {formData.assignedMembers.length > 0 && (
                            <div>
                                <Label className="text-foreground font-medium">
                                    Selected Members (
                                    {formData.assignedMembers.length})
                                </Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.assignedMembers.map((name) => (
                                        <span
                                            key={name}
                                            className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                                        >
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-border">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="border-border text-foreground hover:bg-accent"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                !formData.title.trim() ||
                                !formData.description.trim()
                            }
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Create Project
                            </div>
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
