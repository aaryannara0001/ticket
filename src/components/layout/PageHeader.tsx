import { motion } from 'framer-motion';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6"
        >
            <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-muted-foreground text-sm sm:text-base mt-1">
                        {subtitle}
                    </p>
                )}
            </div>

            {actions && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    {actions}
                </div>
            )}
        </motion.div>
    );
}
