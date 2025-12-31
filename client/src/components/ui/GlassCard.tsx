import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    premium?: boolean;
    animated?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className,
    hoverEffect = false,
    premium = false,
    animated = false,
    ...props
}) => {
    return (
        <div
            className={cn(
                "glass rounded-3xl p-8 transition-all duration-500 relative overflow-hidden",
                premium && "premium-border",
                animated && "premium-border-glow",
                hoverEffect && "hover:border-white/25 hover:shadow-2xl hover:shadow-cyan-500/10",
                className
            )}
            {...props}
        >
            <div className="relative z-10 h-full flex flex-col">
                {children}
            </div>
        </div>
    );
};
