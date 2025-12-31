import React from 'react';
import { cn } from './GlassCard';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    className,
    variant = 'primary',
    isLoading,
    icon,
    disabled,
    ...props
}) => {
    const variants = {
        primary: "bg-white/90 text-gray-900 font-black shadow-lg border-white/50 hover:bg-white hover:scale-[1.02] hover:shadow-xl transition-all",
        secondary: "bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20 backdrop-blur-md",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20 hover:border-red-500/30",
        ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border-transparent"
    };

    return (
        <button
            className={cn(
                "relative flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold transition-all duration-300 border uppercase tracking-widest text-xs",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                variants[variant],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {!isLoading && icon && <span className="w-4 h-4">{icon}</span>}
            {children}
        </button>
    );
};
