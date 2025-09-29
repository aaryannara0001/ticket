import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen bg-background flex relative">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - responsive positioning */}
            <div
                className={`
                fixed inset-y-0 left-0 z-30 lg:relative lg:z-auto
                transform transition-transform duration-300 ease-in-out
                ${
                    sidebarOpen
                        ? 'translate-x-0'
                        : '-translate-x-full lg:translate-x-0'
                }
            `}
            >
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
