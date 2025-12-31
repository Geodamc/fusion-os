'use client';

export default function FooterGlow() {
    return (
        <footer className="relative z-10 w-full overflow-hidden pt-16 pb-8 bg-transparent">
            {/* Soft decorative glows */}
            <div className="pointer-events-none absolute top-0 left-1/2 z-0 h-full w-full -translate-x-1/2 select-none">
                <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute right-1/4 -bottom-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>
            </div>

            <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 rounded-3xl border border-white/20 bg-white/10 px-8 py-12 md:flex-row md:items-start md:justify-between md:gap-12 text-white backdrop-blur-xl shadow-2xl mx-4">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <a href="#" className="mb-4 flex items-center gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-xl">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </span>
                        <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 drop-shadow-sm uppercase">
                            FusionOS
                        </span>
                    </a>
                    <p className="text-white/80 mb-6 max-w-xs text-sm font-medium leading-relaxed">
                        The only OS that makes your computer cooler than you.
                    </p>
                </div>

                <div className="flex w-full flex-col gap-12 text-center md:w-auto md:flex-row md:justify-end md:text-left">
                    <div>
                        <div className="mb-4 text-sm font-black tracking-tighter text-white uppercase bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">Legal (Boring)</div>
                        <ul className="space-y-3 text-white/80 text-sm font-bold">
                            <li className="hover:text-white cursor-pointer transition-colors">We Own Your Soul</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Don't Sue Us</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Cookies (Real ones?)</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="text-white/40 relative z-10 mt-12 text-center text-[10px] font-bold tracking-widest uppercase">
                <span>Built with 0% logic and 100% vibes.</span>
            </div>
        </footer>
    );
}
