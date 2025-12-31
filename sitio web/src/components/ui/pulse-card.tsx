import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export const CardHoverEffect = ({
    icon,
    title,
    description,
    className,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    className?: string;
    variant?: string;
    glowEffect?: boolean;
    size?: string;
}) => {
    let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div
            className={cn(
                "relative group  block p-2 h-full w-full",
                className
            )}
            onMouseEnter={() => setHoveredIndex(1)}
            onMouseLeave={() => setHoveredIndex(null)}
        >
            <AnimatePresence>
                {hoveredIndex === 1 && (
                    <motion.span
                        className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block  rounded-3xl"
                        layoutId="hoverBackground"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 1,
                            transition: { duration: 0.15 },
                        }}
                        exit={{
                            opacity: 0,
                            transition: { duration: 0.15, delay: 0.2 },
                        }}
                    />
                )}
            </AnimatePresence>
            <div className="rounded-2xl h-full w-full p-4 overflow-hidden bg-black border border-transparent dark:border-white/[0.2] group-hover:border-slate-700 relative z-20">
                <div className="relative z-50">
                    <div className="p-4">
                        <div className="mb-2 text-white">{icon}</div>
                        <h4 className="text-zinc-100 font-bold tracking-wide mt-4">
                            {title}
                        </h4>
                        <p className="mt-8 text-zinc-400 tracking-wide leading-relaxed text-sm">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
