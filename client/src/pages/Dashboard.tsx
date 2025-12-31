import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Rocket,
    Settings,
    Cpu,
    ShieldCheck,
    Check
} from 'lucide-react';
import { GlassCard, cn } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';

const Dashboard = () => {
    const navigate = useNavigate();

    const modules = [
        {
            id: 1,
            title: 'VM Setup Wizard',
            desc: 'Create the base environment and define hardware topology.',
            features: [
                'Dynamic CPU Config',
                'GPU Auto-Detection',
                'ISO & VirtIO Manager',
                'Instant XML Deploy'
            ],
            icon: <Rocket className="text-white" size={32} />,
            path: '/setup',
            accent: 'from-white/20 to-white/5',
        },
        {
            id: 2,
            title: 'After-Install Config',
            desc: 'Apply Kernel, GRUB parameters and configure VFIO Drivers.',
            features: [
                'Core Isolation',
                'Hugepages Config',
                'Driver Blacklisting',
                'Latency Tuning'
            ],
            icon: <Settings className="text-white" size={32} />,
            path: '/config',
            accent: 'from-white/20 to-white/5',
        },
        {
            id: 3,
            title: 'Control Center',
            desc: 'Manage VMs, core isolation, and real-time hardware switching.',
            features: [
                'Power Management',
                'Advanced Snapshots',
                'GPU Host/VM Toggle',
                'Resource Monitor'
            ],
            icon: <Cpu className="text-white" size={32} />,
            path: '/control',
            accent: 'from-white/20 to-white/5',
        }
    ];

    return (
        <div className="w-full min-h-screen p-6 sm:p-12 flex flex-col items-center justify-center overflow-x-hidden">
            <div className="max-w-6xl w-full">
                <header className="mb-20 text-center animate-in fade-in zoom-in duration-1000">

                    <h1 className="text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 drop-shadow-2xl">
                        System Orchestrator
                    </h1>
                    <p className="text-white text-xl max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        Powerful virtualization management. Precision engineered for high-performance passthrough and real-time environment control.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {modules.map((m, idx) => (
                        <GlassCard
                            key={m.id}
                            premium
                            animated
                            hoverEffect
                            className="group h-full flex flex-col"
                            style={{ animationDelay: `${idx * 200}ms` }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn(
                                    "p-5 rounded-2xl bg-gradient-to-br border transition-all duration-500 shadow-xl relative group-hover:scale-110",
                                    m.accent,
                                    "border-white/20 group-hover:border-white/40 shadow-blue-500/10"
                                )}>
                                    <div className="relative z-10">{m.icon}</div>
                                    <div className="absolute inset-0 bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 mb-2 group-hover:translate-x-1 transition-transform duration-500">{m.title}</h3>
                                <p className="text-gray-300 text-xs leading-relaxed mb-6 w-4/5 font-medium group-hover:text-white transition-colors uppercase tracking-tight">{m.desc}</p>



                                <ul className="space-y-3 mb-8">
                                    {m.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-3 group/item">
                                            <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover/item:bg-white/30 transition-all">
                                                <Check className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-200 group-hover/item:text-white transition-colors">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <GlassButton
                                onClick={() => navigate(m.path)}
                                variant="primary"
                                className="w-full py-4 text-sm font-black"
                            >
                                Launch Module
                            </GlassButton>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
