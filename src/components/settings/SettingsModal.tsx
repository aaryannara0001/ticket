import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SettingsModalProps {
    children: React.ReactNode;
}

export function SettingsModal({ children }: SettingsModalProps) {
    const { theme, setTheme } = useTheme();
    const [tempTheme, setTempTheme] = useState(theme);
    const [tempNotifications, setTempNotifications] = useState(true);
    const [tempEmailUpdates, setTempEmailUpdates] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    // Load current settings when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempTheme(theme);
            // Load notification settings from localStorage or API
            const savedNotifications =
                localStorage.getItem('pushNotifications');
            const savedEmailUpdates = localStorage.getItem('emailUpdates');
            setTempNotifications(savedNotifications !== 'false');
            setTempEmailUpdates(savedEmailUpdates !== 'false');
        }
    }, [isOpen, theme]);

    const handleSaveSettings = () => {
        // Apply theme change
        setTheme(tempTheme || 'system');

        // Save notification settings to localStorage
        localStorage.setItem('pushNotifications', tempNotifications.toString());
        localStorage.setItem('emailUpdates', tempEmailUpdates.toString());

        // Show success message
        toast.success('Settings saved successfully!');

        // Close modal
        setIsOpen(false);
    };

    const handleCancel = () => {
        // Reset temporary settings to current values
        setTempTheme(theme);
        const savedNotifications = localStorage.getItem('pushNotifications');
        const savedEmailUpdates = localStorage.getItem('emailUpdates');
        setTempNotifications(savedNotifications !== 'false');
        setTempEmailUpdates(savedEmailUpdates !== 'false');
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    {/* Theme Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Appearance</h3>
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Theme</Label>
                            <Select
                                value={tempTheme || 'system'}
                                onValueChange={setTempTheme}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">
                                        <div className="flex items-center gap-2">
                                            <Sun className="w-4 h-4" />
                                            Light
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="dark">
                                        <div className="flex items-center gap-2">
                                            <Moon className="w-4 h-4" />
                                            Dark
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="system">
                                        <div className="flex items-center gap-2">
                                            <Monitor className="w-4 h-4" />
                                            System
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Notifications</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">
                                        Push Notifications
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive notifications for ticket updates
                                    </p>
                                </div>
                                <Switch
                                    checked={tempNotifications}
                                    onCheckedChange={setTempNotifications}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">
                                        Email Updates
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get email notifications for important
                                        updates
                                    </p>
                                </div>
                                <Switch
                                    checked={tempEmailUpdates}
                                    onCheckedChange={setTempEmailUpdates}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveSettings}>
                            Save Settings
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
