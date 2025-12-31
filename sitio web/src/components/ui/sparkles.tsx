"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const SparklesCore = (props: {
    className?: string;
    minSize?: number;
    maxSize?: number;
    particleDensity?: number;
    particleColor?: string;
}) => {
    const {
        className,
        minSize,
        maxSize,
        particleDensity,
        particleColor,
    } = props;
    const [init, setInit] = useState(false);

    useEffect(() => {
        setInit(true);
    }, []);

    return (
        <div className={cn("relative w-full h-full", className)}>
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                {init && Array.from({ length: particleDensity || 50 }).map((_, i) => (
                    <motion.span
                        key={i}
                        className="absolute rounded-full"
                        initial={{
                            top: Math.random() * 100 + "%",
                            left: Math.random() * 100 + "%",
                            opacity: Math.random(),
                            scale: Math.random(),
                        }}
                        animate={{
                            y: [0, Math.random() * 100 - 50],
                            x: [0, Math.random() * 100 - 50],
                            opacity: [Math.random(), Math.random(), Math.random()],
                            scale: [Math.random(), Math.random(), Math.random()],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                        style={{
                            width: Math.random() * (maxSize || 3) + (minSize || 1) + "px",
                            height: Math.random() * (maxSize || 3) + (minSize || 1) + "px",
                            backgroundColor: particleColor || "#FFF",
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
