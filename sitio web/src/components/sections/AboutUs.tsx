'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Spotlight } from '@/components/ui/spotlight';
import {
    Globe,
    Users,
    Lightbulb,
    Rocket,
    Target,
} from 'lucide-react';

const aboutData = {
    title: 'About Us',
    subtitle:
        'We build this because we have no social life. You benefit.',
    mission:
        'Our mission is to make virtualization so simple that complex environments feel like a game—minus the lag, plus the fun.',
    vision:
        'We envision a future where high-performance environments are accessible to everyone, without the headaches of traditional setup.',
    values: [
        {
            title: 'Chaos',
            description: 'If it breaks, it was a feature.',
            icon: <Lightbulb className="h-6 w-6" />,
        },
        {
            title: 'Pure Grit',
            description: 'Driven by passion and an unhealthy amount of sheer willpower.',
            icon: <Users className="h-6 w-6" />,
        },
        {
            title: 'Speed',
            description: 'Faster than your patience after a 4-hour compile.',
            icon: <Rocket className="h-6 w-6" />,
        },
        {
            title: 'Freedom',
            description: 'Open source, because proprietary software is for losers. (not really)',
            icon: <Globe className="h-6 w-6" />,
        },
    ],
    className: 'relative overflow-hidden py-20',
};

export default function AboutUs() {
    const missionRef = useRef(null);
    const valuesRef = useRef(null);
    const missionInView = useInView(missionRef, { once: true, amount: 0.3 });
    const valuesInView = useInView(valuesRef, { once: true, amount: 0.3 });

    return (
        <section className="relative w-full overflow-hidden pt-20 bg-transparent text-white">
            <Spotlight />


            <div className="relative z-10 container mx-auto px-4 md:px-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="mx-auto mb-16 max-w-2xl text-center"
                >
                    <h1 className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent text-5xl font-black tracking-tighter sm:text-7xl md:text-8xl drop-shadow-md">
                        {aboutData.title}
                    </h1>
                    <p className="text-white/90 mt-6 text-xl font-medium">
                        {aboutData.subtitle}
                    </p>
                </motion.div>

                {/* Mission & Vision Section */}
                <div ref={missionRef} className="relative mx-auto mb-24 max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={
                            missionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
                        }
                        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                        className="relative z-10 grid gap-12 md:grid-cols-2"
                    >
                        <motion.div
                            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                            className="group border-white/20 relative block overflow-hidden rounded-2xl border bg-white/10 p-10 backdrop-blur-md shadow-xl"
                        >

                            <div className="mb-6 inline-flex aspect-square h-16 w-16 flex-1 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                                <Rocket className="text-white h-8 w-8" />
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl font-black drop-shadow-md bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent uppercase tracking-tighter">
                                    Our Mission
                                </h2>

                                <p className="text-white/90 text-lg leading-relaxed font-medium">
                                    {aboutData.mission}
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                            className="group border-white/20 relative block overflow-hidden rounded-2xl border bg-white/10 p-10 backdrop-blur-md shadow-xl"
                        >
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                                <Target className="h-8 w-8 text-white" />
                            </div>

                            <h2 className="mb-4 text-3xl font-black drop-shadow-md bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent uppercase tracking-tighter">
                                Our Vision
                            </h2>

                            <p className="text-white/90 text-lg leading-relaxed font-medium">
                                {aboutData.vision}
                            </p>
                        </motion.div>
                    </motion.div>
                </div>

                <div ref={valuesRef} className="mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={
                            valuesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                        }
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="mb-12 text-center"
                    >
                        <h2 className="text-4xl font-black tracking-tighter sm:text-6xl drop-shadow-md bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent uppercase">
                            Our Core "Values"
                        </h2>
                        <p className="text-white/80 mx-auto mt-4 max-w-2xl text-lg font-medium">
                            The raw logic that powers our obsession.
                        </p>
                    </motion.div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {aboutData.values.map((value, index) => {
                            return (
                                <motion.div
                                    key={value.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={
                                        valuesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                                    }
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1 + 0.2,
                                        ease: 'easeOut',
                                    }}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                >
                                    <div className="h-full rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md shadow-lg hover:bg-white/20 transition-all">
                                        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white">
                                            {value.icon}
                                        </div>
                                        <h3 className="mb-2 text-xl font-black text-white tracking-tighter uppercase">{value.title}</h3>
                                        <p className="text-white/90 font-medium">{value.description}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className="mt-32 mb-32">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="mx-auto max-w-4xl rounded-3xl border border-white/20 bg-white/5 p-12 text-center backdrop-blur-xl shadow-2xl"
                        >
                            <h2 className="mb-8 text-4xl font-black tracking-tighter sm:text-6xl drop-shadow-md bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent uppercase">Our "Promises"</h2>
                            <div className="grid gap-8 md:grid-cols-3">
                                <div className="space-y-2">
                                    <div className="text-4xl font-black text-white/20">01</div>
                                    <p className="text-lg font-bold">We promise to blame your hardware first.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-4xl font-black text-white/20">02</div>
                                    <p className="text-lg font-bold">We promise your RAM will feel used and loved.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-4xl font-black text-white/20">03</div>
                                    <p className="text-lg font-bold">We promise to never explain what VFIO actually stands for.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
