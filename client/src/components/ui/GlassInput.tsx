import React from 'react';
import { cn } from './GlassCard';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({ className, label, error, ...props }) => {
    return (
        <div className="w-full">
            {label && <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>}
            <input
                className={cn(
                    "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 transition-all",
                    "focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:bg-black/60",
                    error && "border-red-500/50 focus:border-red-500 focus:ring-red-500",
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
};
