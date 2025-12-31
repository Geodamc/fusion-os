import React, { useState, useEffect } from 'react';
import { Play, Square, Activity, Cpu, Monitor, RefreshCw, HardDrive, Camera, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { SnapshotManager } from '../components/SnapshotManager';
import { PremiumSwitch } from '../components/ui/PremiumSwitch';

const API_BASE = '/api/control';
import { cn } from '../components/ui/GlassCard';

interface SystemState {
    cpuBoostTarget: 'windows' | 'linux';
    gpuOwner: 'windows' | 'linux';
    vmStatus: 'running' | 'stopped' | 'unknown';
}

interface SystemConfig {
    totalThreads: number;
    hostThreads: number;
    lastEnvName: string;
}

const ControlCenter = () => {
    const navigate = useNavigate();
    const [state, setState] = useState<SystemState>({
        cpuBoostTarget: 'linux',
        gpuOwner: 'linux',
        vmStatus: 'stopped'
    });
    const [config, setConfig] = useState<SystemConfig>({
        totalThreads: 16,
        hostThreads: 2,
        lastEnvName: 'win11-2'
    });
    const [loading, setLoading] = useState<string | null>(null);
    const [showSnapshotModal, setShowSnapshotModal] = useState(false);

    // Polling System Status
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch(`${API_BASE}/config`);
                const data = await res.json();
                setConfig(data);
            } catch (e) {
                console.error("Config fetch error", e);
            }
        };

        const poll = async () => {
            try {
                const [vmRes, cpuRes, gpuRes] = await Promise.all([
                    fetch(`${API_BASE}/vm-status`),
                    fetch(`${API_BASE}/cpu-status`),
                    fetch(`${API_BASE}/gpu-status`)
                ]);

                const vmData = await vmRes.json();
                const cpuData = await cpuRes.json();
                const gpuData = await gpuRes.json();

                setState((prev: SystemState) => ({
                    ...prev,
                    vmStatus: vmData.status || 'unknown',
                    cpuBoostTarget: cpuData.target || prev.cpuBoostTarget,
                    gpuOwner: gpuData.owner || prev.gpuOwner
                }));
            } catch (e) {
                console.error("Polling error", e);
            }
        };

        fetchConfig();
        const interval = setInterval(poll, 5000);
        poll();
        return () => clearInterval(interval);
    }, []);

    const toggleCpu = async (checked: boolean) => {
        const target = checked ? 'windows' : 'linux';
        setLoading('cpu');
        try {
            await fetch(`${API_BASE}/cpu`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target })
            });
            setState((prev: SystemState) => ({ ...prev, cpuBoostTarget: target }));
        } catch (e) { console.error(e); }
        setLoading(null);
    };

    const toggleGpu = async (checked: boolean) => {
        const target = checked ? 'windows' : 'linux';
        setLoading('gpu');
        try {
            await fetch(`${API_BASE}/gpu`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target })
            });
            setState((prev: SystemState) => ({ ...prev, gpuOwner: target }));
        } catch (e) { console.error(e); }
        setLoading(null);
    };

    const toggleVmPower = async () => {
        setLoading('vm');
        const action = state.vmStatus === 'running' ? 'shutdown' : 'start';
        try {
            const res = await fetch(`${API_BASE}/vm-power`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                alert(`Error: ${data.error || 'Failed to toggle VM power'}`);
            }
        } catch (e) {
            console.error(e);
            alert(`Network Error: Could not connect to the system orchestrator.`);
        }
        setLoading(null);
    };

    const handleRestartCpu = async () => {
        if (!confirm("This will kill the current user session (logout) to reset resources. Continue?")) return;
        try {
            await fetch(`${API_BASE}/restart_cpu`, { method: 'POST' });
        } catch (e) { console.error(e); }
    };

    return (
        <div className="min-h-screen p-6 sm:p-12 flex flex-col items-center justify-center">
            <div className="w-full max-w-6xl">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                    <div>
                        <div className="flex items-center gap-2 text-cyan-400 font-black uppercase tracking-[0.2em] text-xs mb-3">
                            <Activity size={16} className="animate-pulse" />
                            <span>Live System Control</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 drop-shadow-2xl">Control Center</h1>
                    </div>
                    <div className="flex gap-4">
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Hardware Toggles */}
                    <div className="lg:col-span-4 space-y-8">
                        <GlassCard premium animated className="flex flex-col justify-between !p-8 h-[220px]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3 text-cyan-400">
                                    <Cpu size={28} />
                                    <h3 className="font-black uppercase tracking-widest text-xs">CPU Allocation</h3>
                                </div>
                                <PremiumSwitch
                                    checked={state.cpuBoostTarget === 'windows'}
                                    onChange={toggleCpu}
                                    id="cpu-switch"
                                />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white mb-2 tracking-tighter uppercase shrink-0">
                                    {state.cpuBoostTarget === 'windows' ? 'Guest Priority' : 'Host Priority'}
                                </h4>
                                <p className="text-gray-400 text-xs leading-relaxed font-medium">
                                    Redirect precision cores to the virtual environment for maximum gaming performance.
                                </p>
                            </div>
                            {loading === 'cpu' && <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50 rounded-3xl animate-in fade-in">
                                <RefreshCw className="animate-spin text-blue-400" />
                            </div>}
                        </GlassCard>

                        <GlassCard premium animated className="flex flex-col justify-between !p-8 h-[220px]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3 text-cyan-400">
                                    <Monitor size={28} />
                                    <h3 className="font-black uppercase tracking-widest text-xs">GPU Ownership</h3>
                                </div>
                                <PremiumSwitch
                                    checked={state.gpuOwner === 'windows'}
                                    onChange={toggleGpu}
                                    id="gpu-switch"
                                />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white mb-2 tracking-tighter uppercase shrink-0">
                                    {state.gpuOwner === 'windows' ? 'VFIO Passthrough' : 'Host Environment'}
                                </h4>
                                <p className="text-gray-400 text-xs leading-relaxed font-medium">
                                    Toggle hardware owner. Detaches GPU from host and binds to guest drivers.
                                </p>
                            </div>
                            {loading === 'gpu' && <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50 rounded-3xl animate-in fade-in">
                                <RefreshCw className="animate-spin text-emerald-400" />
                            </div>}
                        </GlassCard>
                    </div>

                    {/* Middle Column: VM Cockpit */}
                    <GlassCard premium animated className="lg:col-span-8 !p-0 overflow-hidden min-h-[460px] relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#5e3aee]/20 via-[#c56bf0]/10 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(197,107,240,0.15),transparent_70%)] pointer-events-none" />

                        <div className="p-10 relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2 block">Environment Profile</span>
                                    <h2 className="text-4xl font-black tracking-tighter uppercase shrink-0 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 drop-shadow-2xl">Windows 11</h2>
                                </div>
                                <div className={`px-6 py-2 rounded-full border-2 text-[10px] font-black tracking-widest uppercase transition-all duration-700 ${state.vmStatus === 'running' ? 'border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-white/10 text-gray-500 font-medium'}`}>
                                    System {state.vmStatus === 'running' ? 'Online' : 'Offline'}
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center py-4">
                                <div className={`relative group mb-8`}>
                                    <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-1000 ${state.vmStatus === 'running' ? 'bg-emerald-500 scale-150' : 'bg-white/5'}`} />
                                    <div className={`w-40 h-40 rounded-full border-2 flex items-center justify-center transition-all duration-700 relative z-10 ${state.vmStatus === 'running' ? 'border-emerald-500/50 bg-emerald-500/10 scale-110 rotate-3' : 'border-white/5 bg-white/2'}`}>
                                        <Monitor size={64} className={state.vmStatus === 'running' ? 'text-emerald-400 animate-pulse' : 'text-gray-800'} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-12 w-full max-w-sm mb-12">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Cores</p>
                                        <p className="text-2xl font-black text-white">{config.totalThreads - config.hostThreads}/{config.totalThreads}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Status</p>
                                        <p className={`text-2xl font-black uppercase ${state.vmStatus === 'running' ? 'text-emerald-400' : 'text-white'}`}>{state.vmStatus}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-auto">
                                <GlassButton
                                    onClick={toggleVmPower}
                                    disabled={loading === 'vm'}
                                    variant={state.vmStatus === 'running' ? 'danger' : 'primary'}
                                    className="flex-1 py-5 !text-sm"
                                    icon={state.vmStatus === 'running' ? <Square fill="currentColor" /> : <Play fill="currentColor" />}
                                >
                                    {state.vmStatus === 'running' ? 'Shutdown Environment' : 'Launch Environment'}
                                </GlassButton>
                                <GlassButton
                                    onClick={() => setShowSnapshotModal(true)}
                                    variant="secondary"
                                    className="px-10"
                                >
                                    Snapshots
                                </GlassButton>
                            </div>
                        </div>
                    </GlassCard>
                </div>

            </div>


            {showSnapshotModal && (
                <SnapshotManager
                    vmId="win11-2"
                    vmName="Windows 11"
                    onClose={() => setShowSnapshotModal(false)}
                />
            )}
        </div>
    );
};
export default ControlCenter;
