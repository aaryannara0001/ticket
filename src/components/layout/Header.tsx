import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { LogOut, Menu, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    return (
        <header className="h-14 sm:h-16 bg-card border-b border-border flex items-center justify-between px-3 sm:px-4 md:px-6 shadow-lg">
            {/* Mobile menu button and logo */}
            <div className="flex items-center space-x-3 lg:hidden">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMenuClick}
                    className="p-2 hover:bg-accent text-foreground"
                >
                    <Menu className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-bold text-foreground tracking-tight">
                    TicketFlow
                </h1>
            </div>

            {/* Desktop spacing */}
            <div className="hidden lg:block" />

            {/* Actions - responsive spacing */}
            {/* Actions - responsive spacing and sizing */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                {/* Notifications */}
                <NotificationCenter />

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center space-x-1 sm:space-x-2 text-foreground hover:bg-accent px-2 sm:px-3 py-2 rounded-lg transition-colors"
                        >
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center shadow-sm">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <User
                                        size={14}
                                        className="sm:w-4 sm:h-4 text-primary-foreground"
                                    />
                                )}
                            </div>
                            <span className="hidden sm:block font-semibold text-foreground text-sm sm:text-base">
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
