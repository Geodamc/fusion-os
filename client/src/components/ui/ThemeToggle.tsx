import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
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
            className="fixed top-6 right-6 z-[100] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur-xl shadow-2xl transition-all hover:bg-white/10 group pointer-events-auto"
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
            <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 origin-right whitespace-nowrap rounded bg-black/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/10 shadow-xl">
                {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
        </motion.button>
    );
};

export default ThemeToggle;
