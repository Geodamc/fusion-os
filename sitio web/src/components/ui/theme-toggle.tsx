'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check initial theme
        if (document.documentElement.classList.contains('dark')) {
            setIsDark(true);
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }
    };

    return (
        <motion.button
            onClick={toggleTheme}
            className="fixed top-6 right-6 z-[100] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl transition-all hover:bg-white/20 group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="relative h-6 w-6">
                <motion.div
                    initial={false}
                    animate={{
                        rotate: isDark ? 0 : 90,
                        opacity: isDark ? 1 : 0,
                        scale: isDark ? 1 : 0.5
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center text-yellow-300"
                >
                    <Moon className="h-6 w-6 fill-yellow-300" />
                </motion.div>
                <motion.div
                    initial={false}
                    animate={{
                        rotate: isDark ? -90 : 0,
                        opacity: isDark ? 0 : 1,
                        scale: isDark ? 0.5 : 1
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center text-white"
                >
                    <Sun className="h-6 w-6 fill-white" />
                </motion.div>
            </div>

            {/* Tooltip-like label on hover */}
            <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 origin-right whitespace-nowrap rounded bg-white/10 px-2 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/20">
                {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
        </motion.button>
    );
}
