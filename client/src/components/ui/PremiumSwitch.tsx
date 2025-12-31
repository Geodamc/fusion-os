import React from 'react';
import { cn } from './GlassCard';

interface PremiumSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    id?: string;
    className?: string;
}

export const PremiumSwitch: React.FC<PremiumSwitchProps> = ({
    checked,
    onChange,
    id = "premium-switch",
    className
}) => {
    return (
        <label
            htmlFor={id}
            className={cn("relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none ring-offset-black focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
                checked ? "bg-cyan-500" : "bg-white/10",
                className)}
        >
            <input
                type="checkbox"
                id={id}
                className="sr-only"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span
                className={cn(
                    "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm",
                    checked ? "translate-x-5" : "translate-x-0.5"
                )}
            />
        </label>
    );
};
