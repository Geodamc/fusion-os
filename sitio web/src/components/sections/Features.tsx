'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Code, Paintbrush, Gamepad2 } from 'lucide-react';

import personalizeImg from '@/assets/features/personalize.png';
import configureImg from '@/assets/features/configure.png';
import playImg from '@/assets/features/play.png';

const features = [
    {
        step: 'Step 1',
        title: 'Personalize',
        content:
            "Make it yours. Or make it weird. We won't tell anyone about your taste in wallpapers.",
        icon: <Paintbrush className="text-white h-6 w-6" />,
        image: personalizeImg,
    },
    {
        step: 'Step 2',
        title: 'Configure',
        content:
            "Configure in seconds. It's so easy that you'll spend more time choosing a username than setting up your whole system.",
        icon: <Code className="text-white h-6 w-6" />,
        image: configureImg,
    },
    {
        step: 'Step 3',
        title: 'Play like a Pro',
        content:
            'Launch and dominate. Native performance means you can\'t blame the VM for your lagginess.',
        icon: <Gamepad2 className="text-white h-6 w-6" />,
        image: playImg,
    },
];

export default function Features() {
    const [currentFeature, setCurrentFeature] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            if (progress < 100) {
                setProgress((prev) => prev + 100 / (4000 / 100));
            } else {
                setCurrentFeature((prev) => (prev + 1) % features.length);
                setProgress(0);
            }
        }, 100);

        return () => clearInterval(timer);
    }, [progress]);

    return (
        <div className={'p-8 md:p-12 text-white bg-transparent'}>
            <div className="mx-auto w-full max-w-7xl">
                <div className="relative mx-auto mb-12 max-w-2xl sm:text-center">
                    <div className="relative z-10">
                        <h2 className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent text-4xl font-black tracking-tighter md:text-5xl lg:text-7xl drop-shadow-md uppercase">
                            Three Steps to Glory
                        </h2>
                        <p className="mt-4 text-white/90 font-medium text-lg drop-shadow-sm">
                            Fusion OS helps you create custom environments faster than you can say "Arch Linux btw".
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-10 items-center">
                    <div className="space-y-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="flex items-center gap-6 md:gap-8 cursor-pointer group"
                                onClick={() => { setCurrentFeature(index); setProgress(0); }}
                                initial={{ opacity: 0.3, x: -20 }}
                                animate={{
                                    opacity: index === currentFeature ? 1 : 0.4,
                                    x: 0,
                                    scale: index === currentFeature ? 1.05 : 1,
                                }}
                                transition={{ duration: 0.5 }}
                            >
                                <motion.div
                                    className={cn(
                                        'flex h-12 w-12 items-center justify-center rounded-full border-2 md:h-14 md:w-14 transition-all duration-300 shadow-lg',
                                        index === currentFeature
                                            ? 'border-white bg-white/20 text-white scale-110 [box-shadow:0_0_20px_rgba(255,255,255,0.4)]'
                                            : 'border-white/20 bg-white/5 text-white/60 group-hover:border-white/40',
                                    )}
                                >
                                    {feature.icon}
                                </motion.div>

                                <div className="flex-1">
                                    <h3 className="text-xl font-black md:text-2xl text-white drop-shadow-sm tracking-tighter uppercase">
                                        {feature.title}
                                    </h3>
                                    <p className="text-white/80 text-sm md:text-base font-medium">
                                        {feature.content}
                                    </p>
                                    {index === currentFeature && (
                                        <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-white"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.1, ease: 'linear' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div
                        className={cn(
                            'relative h-[250px] md:h-[400px] w-full overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md shadow-2xl',
                        )}
                    >
                        <AnimatePresence mode="wait">
                            {features.map(
                                (feature, index) =>
                                    index === currentFeature && (
                                        <motion.div
                                            key={index}
                                            className="absolute inset-0"
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                        >
                                            <img
                                                src={feature.image}
                                                alt={feature.title}
                                                className="h-full w-full transform object-cover opacity-80"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                            <div className="absolute bottom-6 left-6 p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
                                                <span className="text-white text-sm font-black uppercase tracking-widest">
                                                    {feature.step}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ),
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
