import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface DatePickerWithRangeProps {
    date: DateRange | undefined;
    onDateChange: (date: DateRange | undefined) => void;
    className?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function DatePickerWithRange({
    date,
    onDateChange,
    className,
    open,
    onOpenChange,
}: DatePickerWithRangeProps) {
    const handleDateChange = (newDate: DateRange | undefined) => {
        onDateChange(newDate);
        // Close the popover when a date is selected
        if (onOpenChange) {
            onOpenChange(false);
        }
    };

    return (
        <div className={cn('grid gap-2', className)}>
            <Popover open={open} onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={'outline'}
                        className={cn(
                            'w-[300px] justify-start text-left font-normal',
                            !date && 'text-muted-foreground',
                            className,
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, 'LLL dd, y')} -{' '}
                                    {format(date.to, 'LLL dd, y')}
                                </>
                            ) : (
                                format(date.from, 'LLL dd, y')
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0 bg-popover border-border text-popover-foreground"
                    align="start"
                >
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={handleDateChange}
                        numberOfMonths={2}
                        className="text-white"
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
