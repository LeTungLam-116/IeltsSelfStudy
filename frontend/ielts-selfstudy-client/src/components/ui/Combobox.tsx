import React, { useState, useEffect, useRef } from 'react';
import { IconSearch, IconX, IconChevronDown } from '../icons';

export interface ComboboxOption {
    value: string | number;
    label: string;
    subLabel?: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value?: string | number;
    onChange: (value: string | number) => void;
    onSearch?: (query: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    isLoading?: boolean;
    error?: boolean;
    disabled?: boolean;
    className?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
    options,
    value,
    onChange,
    onSearch,
    placeholder = 'Chọn một lựa chọn...',
    searchPlaceholder = 'Tìm kiếm...',
    isLoading = false,
    error = false,
    disabled = false,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && onSearch) {
            onSearch(searchQuery);
        }
    }, [isOpen, searchQuery, onSearch]);

    const handleToggle = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
        if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleSelect = (option: ComboboxOption) => {
        onChange(option.value);
        setIsOpen(false);
        setSearchQuery('');
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setSearchQuery('');
    };

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            <div
                onClick={handleToggle}
                className={`
          flex items-center justify-between w-full px-3 py-2 text-sm bg-white border rounded-lg cursor-pointer transition-all
          ${error ? 'border-red-500 shadow-sm shadow-red-500/10' : 'border-slate-300'}
          ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-400' : 'hover:border-slate-400'}
          ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-500' : ''}
        `}
            >
                <span className={`block truncate flex-1 ${!selectedOption ? 'text-slate-400' : 'text-slate-900 font-bold'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <div className="flex items-center space-x-2 ml-2 border-l border-slate-100 pl-2">
                    {value && value !== 0 && !disabled && (
                        <button
                            onClick={clearSelection}
                            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                            title="Xóa lựa chọn"
                        >
                            <IconX className="w-4 h-4" />
                        </button>
                    )}
                    <IconChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative">
                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto pt-1 pb-1">
                        {isLoading ? (
                            <div className="px-4 py-6 text-sm text-slate-500 flex flex-col items-center justify-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
                                <span>Đang tìm kiếm bài tập...</span>
                            </div>
                        ) : options.length > 0 ? (
                            options.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option)}
                                    className={`
                    px-4 py-3 text-sm cursor-pointer transition-all border-b border-slate-50 last:border-0
                    ${option.value === value ? 'bg-blue-50 text-blue-700 border-l-4 border-l-blue-500' : 'text-slate-700 hover:bg-slate-50 hover:pl-5'}
                  `}
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className={`font-bold block leading-tight truncate ${option.value === value ? 'text-blue-700' : 'text-slate-900'}`}>
                                            {option.label}
                                        </span>
                                        {option.subLabel && (
                                            <span className={`text-[12px] block leading-none ${option.value === value ? 'text-blue-500' : 'text-slate-500'}`}>
                                                {option.subLabel}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-sm text-slate-500 text-center flex flex-col items-center gap-2">
                                <IconSearch className="w-8 h-8 text-slate-200" />
                                <span className="italic font-medium">Không tìm thấy bài tập nào khớp với từ khóa</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
