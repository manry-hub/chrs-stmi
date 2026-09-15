import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface ComboboxProps {
    options: { value: string; label: string }[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    className?: string;
    allowCustom?: boolean;
}

export function Combobox({ options, value, onChange, placeholder, error, className, allowCustom = true }: ComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const initialLabel = options.find(o => o.value === value)?.label || value || "";
    const [inputValue, setInputValue] = useState(initialLabel);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Update internal input when external value changes
    useEffect(() => {
        const matchingOption = options.find(opt => opt.value === value);
        setInputValue(matchingOption ? matchingOption.label : value || "");
    }, [value, options]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                if (!allowCustom) {
                    const matchingOption = options.find(opt => opt.value === value);
                    if (matchingOption) {
                        setInputValue(matchingOption.label);
                    } else {
                        setInputValue("");
                        if (value !== "") onChange("");
                    }
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [allowCustom, value, options, onChange]);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        if (allowCustom) {
            onChange(newValue);
        } else {
            const exactMatch = options.find(opt => opt.label.toLowerCase() === newValue.toLowerCase());
            if (exactMatch) {
                onChange(exactMatch.value);
            } else if (newValue === "") {
                onChange("");
            }
        }
        setIsOpen(true);
    };

    const handleOptionClick = (optionValue: string, optionLabel: string) => {
        setInputValue(optionLabel);
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative group">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className={cn(
                        "flex h-11 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-text",
                        error ? "border-red-500" : "border-slate-200 group-hover:border-slate-300",
                        className
                    )}
                />
                <div 
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-slate-400 group-hover:text-slate-500"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ChevronDown className="h-4 w-4" />
                </div>
            </div>
            
            {isOpen && (
                <ul role="listbox" className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto py-1">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                            <li
                                key={opt.value}
                                role="option"
                                aria-selected={inputValue === opt.label}
                                onClick={() => handleOptionClick(opt.value, opt.label)}
                                className="px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                                {opt.label}
                            </li>
                        ))
                    ) : allowCustom ? (
                        <li role="option" aria-selected={false} className="px-3.5 py-2 text-sm text-slate-500 italic">
                            Tekan enter atau biarkan untuk menggunakan "{inputValue}"
                        </li>
                    ) : (
                        <li role="option" aria-selected={false} className="px-3.5 py-2 text-sm text-slate-500 italic">
                            Pilihan tidak ditemukan
                        </li>
                    )}
                </ul>
            )}
            {error && <p className="text-[11px] text-red-500 mt-1.5 ml-1 font-medium animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    );
}
