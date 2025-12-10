import React from 'react';

interface InputGroupProps {
    label: string;
    value: number | string;
    onChange: (val: string) => void;
    type?: 'text' | 'number';
    placeholder?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    min?: number;
    step?: number;
    className?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({ 
    label, 
    value, 
    onChange, 
    type = 'text', 
    placeholder, 
    prefix, 
    suffix,
    min = 0,
    step,
    className
}) => {
    return (
        <div className={`flex flex-col space-y-1.5 ${className}`}>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {label}
            </label>
            <div className="relative flex items-center rounded-md shadow-sm ring-1 ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-500 bg-white">
                {prefix && (
                    <div className="pl-3 text-gray-400">
                        {prefix}
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="block w-full border-0 bg-transparent py-2 pl-3 pr-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder={placeholder}
                    min={min}
                    step={step}
                />
                {suffix && (
                    <div className="pr-3 text-gray-400">
                        {suffix}
                    </div>
                )}
            </div>
        </div>
    );
};