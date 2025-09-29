import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import * as React from 'react';

export interface Option {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
    maxCount?: number;
    modalPopover?: boolean;
    disabled?: boolean;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = 'Select items',
    className,
    maxCount = 3,
    modalPopover = false,
    disabled = false,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');

    const handleUnselect = React.useCallback(
        (item: string) => {
            onChange(selected.filter((i) => i !== item));
        },
        [onChange, selected],
    );

    const toggleOption = React.useCallback(
        (option: Option) => {
            const newSelected = selected.includes(option.value)
                ? selected.filter((item) => item !== option.value)
                : [...selected, option.value];
            onChange(newSelected);
        },
        [onChange, selected],
    );

    const handleClear = React.useCallback(() => {
        onChange([]);
    }, [onChange]);

    const toggleAll = React.useCallback(() => {
        if (selected.length === options.length) {
            handleClear();
        } else {
            onChange(options.map((option) => option.value));
        }
    }, [selected.length, options.length, handleClear, onChange, options]);

    const filteredOptions = React.useMemo(() => {
        if (!searchValue) return options;
        return options.filter((option) =>
            option.label.toLowerCase().includes(searchValue.toLowerCase()),
        );
    }, [options, searchValue]);

    return (
        <Popover
            open={open}
            onOpenChange={(newOpen) => {
                setOpen(newOpen);
                if (!newOpen) {
                    setSearchValue('');
                }
            }}
            modal={modalPopover}
        >
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        setOpen(!open);
                    }}
                    className={cn(
                        'flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
                        className,
                    )}
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                >
                    {selected.length > 0 ? (
                        <div className="flex justify-between items-center w-full">
                            <div className="flex flex-wrap items-center gap-1">
                                {selected.length <= maxCount ? (
                                    selected.map((item) => {
                                        const option = options.find(
                                            (o) => o.value === item,
                                        );
                                        const IconComponent = option?.icon;
                                        return (
                                            <Badge
                                                variant="secondary"
                                                key={item}
                                                className="flex items-center gap-1 pr-0.5 hover:bg-secondary/80"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                            >
                                                {IconComponent && (
                                                    <IconComponent className="h-3 w-3" />
                                                )}
                                                <span className="text-xs">
                                                    {option?.label}
                                                </span>
                                                <button
                                                    className="ml-1 ring-offset-background rounded-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleUnselect(
                                                                item,
                                                            );
                                                        }
                                                    }}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleUnselect(item);
                                                    }}
                                                >
                                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                                </button>
                                            </Badge>
                                        );
                                    })
                                ) : (
                                    <Badge
                                        variant="secondary"
                                        className="hover:bg-secondary/80"
                                    >
                                        {selected.length} selected
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    className="ml-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleClear();
                                    }}
                                >
                                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-sm">
                            {placeholder}
                        </span>
                    )}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-0"
                side="bottom"
                align="start"
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search..."
                        className="h-9"
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {filteredOptions.length > 1 && (
                                <CommandItem
                                    key="all"
                                    onSelect={() => {
                                        toggleAll();
                                    }}
                                    className="cursor-pointer"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <div
                                        className={cn(
                                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                            selected.length === options.length
                                                ? 'bg-primary text-primary-foreground'
                                                : 'opacity-50 [&_svg]:invisible',
                                        )}
                                    >
                                        <Check className="h-4 w-4" />
                                    </div>
                                    <span>(Select All)</span>
                                </CommandItem>
                            )}
                            {filteredOptions.map((option) => {
                                const isSelected = selected.includes(
                                    option.value,
                                );
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={(value) => {
                                            if (value === option.value) {
                                                toggleOption(option);
                                            }
                                        }}
                                        value={option.value}
                                        className="cursor-pointer"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                                isSelected
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'opacity-50 [&_svg]:invisible',
                                            )}
                                        >
                                            <Check className="h-4 w-4" />
                                        </div>
                                        {option.icon && (
                                            <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span>{option.label}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
