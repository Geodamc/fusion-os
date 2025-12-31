'use client';

import { motion } from 'framer-motion';
import { Download } from 'lucide-react';


export default function Hero() {
    return (
        <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-transparent">
            {/* Overlay for better text contrast */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />

            <section className="relative z-10 mx-auto max-w-full flex-1 flex flex-col items-center justify-center">


                <div className="z-10 mx-auto max-w-screen-xl gap-12 px-4 py-28 text-white md:px-8 flex flex-col items-center">
                    <div className="mx-auto max-w-5xl space-y-8 text-center leading-0 lg:leading-5">

                        <h1 className="mx-auto bg-clip-text text-8xl tracking-tighter text-transparent md:text-[12rem] font-black bg-gradient-to-b from-white to-white/40 pb-4 drop-shadow-2xl">
                            FusionOS
                        </h1>

                        <p className="mx-auto max-w-2xl text-white text-lg font-medium drop-shadow-md">
                            The only OS that makes your computer cooler than you. <br />
                            <span className="text-sm opacity-80">(No, seriously. Download it or we cry.)</span>
                        </p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="pt-8 flex flex-col items-center justify-center"
                        >
                            <a
                                href="https://github.com/YOUR_USERNAME/fusion-os-unified/releases/latest"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255, 255, 255, 0.3)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-white px-10 py-5 text-xl font-black uppercase tracking-tighter text-blue-600 shadow-2xl transition-all duration-300 hover:bg-blue-50 mx-auto"
                                >
                                    <Download className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                                    <span className="relative z-10">Download Now</span>
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                                </motion.button>
                            </a>
                            <p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                INITIAL BUILD: v0.0.1 "beta"
                            </p>
                        </motion.div>

                    </div>
                </div>
            </section>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 mt-8 mb-20 text-center">
                <p className="text-sm font-bold text-white uppercase tracking-widest mb-8 drop-shadow-sm">
                    Trusted by "Experts". Used by these Legends:
                </p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-90">
                    <span className="text-xl md:text-3xl font-black text-white hover:text-yellow-300 transition-colors cursor-default drop-shadow-md hover:scale-110 transform duration-300">OttoCorp</span>
                    <span className="text-xl md:text-3xl font-black text-white hover:text-green-300 transition-colors cursor-default drop-shadow-md hover:scale-110 transform duration-300">SuperLukas</span>
                    <span className="text-xl md:text-3xl font-black text-white hover:text-red-300 transition-colors cursor-default drop-shadow-md hover:scale-110 transform duration-300">Rafa the Boss</span>
                    <span className="text-xl md:text-3xl font-black text-white hover:text-blue-300 transition-colors cursor-default drop-shadow-md hover:scale-110 transform duration-300">SalvaStark</span>
                </div>
            </div>


        </div>
    );
}
