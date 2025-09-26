import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { LogOut, Search, Settings, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    return (
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-lg">
            {/* Search */}
            <div className="flex items-center space-x-4 flex-1 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search tickets, users, or projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
                {/* Notifications */}
                <NotificationCenter />

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center space-x-2 text-foreground hover:bg-accent px-3 py-2 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <User
                                        size={16}
                                        className="text-primary-foreground"
                                    />
                                )}
                            </div>
                            <span className="font-semibold text-foreground">
                                {user?.name}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="bg-popover border-border shadow-xl"
                    >
                        <DropdownMenuItem
                            onClick={() => navigate('/profile')}
                            className="text-popover-foreground hover:bg-accent focus:bg-accent cursor-pointer"
                        >
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </DropdownMenuItem>
                        <SettingsModal>
                            <DropdownMenuItem
                                className="text-popover-foreground hover:bg-accent focus:bg-accent cursor-pointer"
                                onSelect={(e) => e.preventDefault()}
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </DropdownMenuItem>
                        </SettingsModal>
                        <DropdownMenuItem
                            onClick={logout}
                            className="text-popover-foreground hover:bg-accent focus:bg-accent cursor-pointer"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
