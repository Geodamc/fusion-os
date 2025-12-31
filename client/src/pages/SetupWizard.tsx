import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft, Rocket, Check, AlertTriangle, Monitor, Speaker } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';

const API_BASE = '/api/vmset';

interface HardwareInfo {
    gpus: any[];
    totalThreads: number;
    isos: string[];
    usbDevices: any[];
}

const SetupWizard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hardware, setHardware] = useState<HardwareInfo>({ gpus: [], totalThreads: 0, isos: [], usbDevices: [] });

    const [config, setConfig] = useState({
        name: 'win11-2',
        ramGB: 16,
        gpuPciId: '',
        audioPciId: '',
        passAudio: true,
        hostThreads: 2,
        ksm: false,
        stealthMode: true,
        winIso: 'Win11_25H2_EnglishInternational_x64.iso',
        virtioIso: 'virtio-win.iso',
        diskSizeGB: 100,
        useLookingGlass: true,
        resolution: '1080p',
        usbDevices: [] as any[],
        useScream: true,
        experimentalDisableHyperV: false
    });





    const [generatedXml, setGeneratedXml] = useState('');
    const [creationResult, setCreationResult] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gpus, cpu, isos, usb] = await Promise.all([
                    fetch(`${API_BASE}/hardware/gpu`).then(r => r.json()),
                    fetch(`${API_BASE}/hardware/cpu`).then(r => r.json()),
                    fetch(`${API_BASE}/files/isos`).then(r => r.json()),
                    fetch(`${API_BASE}/hardware/usb`).then(r => r.json()),
                ]);
                setHardware({ gpus, totalThreads: cpu.totalThreads, isos, usbDevices: usb });
            } catch (err) {
                console.error("Failed to fetch hardware info", err);
            }
        };
        fetchData();
    }, []);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const toggleUsbDevice = (dev: any) => {
        const exists = config.usbDevices.find(d => d.vendorId === dev.vendorId && d.productId === dev.productId);
        if (exists) {
            setConfig({ ...config, usbDevices: config.usbDevices.filter(d => d !== exists) });
        } else {
            setConfig({ ...config, usbDevices: [...config.usbDevices, dev] });
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        const virtioIso = hardware.isos.find(iso => iso.toLowerCase().includes('virtio-win'));
        try {
            const res = await fetch(`${API_BASE}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...config,
                    totalThreads: hardware.totalThreads,
                    virtioIso: virtioIso
                })
            });
            const xml = await res.text();
            setGeneratedXml(xml);
            nextStep();
        } catch (err) {
            alert("Failed to generate XML");
        }
        setLoading(false);
    };

    const handleDeploy = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/create-environment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    xml: generatedXml,
                    diskSizeGB: config.diskSizeGB,
                    totalThreads: hardware.totalThreads,
                    hostThreads: config.hostThreads,
                    gpuPciId: config.gpuPciId,
                    audioPciId: config.audioPciId
                })
            });
            const result = await res.json();
            setCreationResult(result);
        } catch (err) {
            alert("Failed to deploy environment");
        }
        setLoading(false);
    };

    const StepHeader = ({ title, sub }: { title: string, sub?: string }) => (
        <div className="mb-12 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#00bcd4]/10 blur-[80px] pointer-events-none" />
            <div className="flex items-center gap-3 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#26c6da] to-[#00bcd4] font-black uppercase tracking-[0.3em] text-[10px]">
                <Rocket size={20} className="animate-pulse text-[#26c6da]" />
                <span>Environment Deployment // Phase {step}/9</span>
            </div>
            <h2 className="text-5xl font-black mb-3 tracking-tighter shrink-0 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 drop-shadow-2xl">{title}</h2>
            {sub && <p className="text-gray-400 font-medium leading-relaxed max-w-2xl">{sub}</p>}
            <div className="h-1 w-20 bg-gradient-to-r from-[#00bcd4] to-[#26c6da] mt-6 rounded-full" />
        </div>
    );

    return (
        <div className="min-h-screen p-6 sm:p-12 flex flex-col items-center justify-center">
            <div className="w-full max-w-5xl">

                <GlassCard premium animated className="min-h-[520px] !p-12">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
                            <StepHeader title="Core Topology" sub="Define the foundational resource allocation for your virtual environment." />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                                <div className="space-y-8">
                                    <GlassInput label="Environment Identifier" value="Windows 11" disabled className="opacity-50" />
                                    <GlassInput
                                        label="Memory Buffer (GB)"
                                        type="number"
                                        value={config.ramGB}
                                        onChange={e => setConfig({ ...config, ramGB: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="p-8 rounded-3xl bg-blue-500/5 border-2 border-blue-500/20 text-sm text-blue-300 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <Monitor size={80} />
                                    </div>
                                    <h4 className="font-black uppercase tracking-tighter text-sm mb-3 text-blue-400">Deployment Manifest</h4>
                                    <ul className="space-y-3 font-medium opacity-80">
                                        <li className="flex items-center gap-2">• Windows 11</li>
                                        <li className="flex items-center gap-2">• VirtIO Driver Set v0.1.285</li>
                                        <li className="flex items-center gap-2">• UEFI + Secure Boot Active + TPM</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-auto pt-12 flex justify-end">
                                <GlassButton onClick={nextStep} variant="primary" className="px-12 py-4 !text-xs font-black" icon={<ChevronRight size={16} />}>Next Phase</GlassButton>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <StepHeader title="PCI-E Handover" sub="Directly bind physical GPU hardware to the virtualized guest drivers." />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {hardware.gpus.filter(g => !g.isAudio).map(gpu => (
                                    <div
                                        key={gpu.pciId}
                                        onClick={() => {
                                            const audio = hardware.gpus.find(g => g.isAudio && g.pciId.startsWith(gpu.pciId.split('.')[0]));
                                            setConfig({ ...config, gpuPciId: gpu.pciId, audioPciId: audio ? audio.pciId : '' });
                                        }}
                                        className={`group p-8 rounded-3xl border-2 cursor-pointer transition-all duration-500 relative overflow-hidden ${config.gpuPciId === gpu.pciId
                                            ? 'bg-[#5e3aee]/10 border-[#5e3aee] shadow-[0_0_30px_rgba(94,58,238,0.2)]'
                                            : 'bg-black/40 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="relative z-10">
                                            <div className="font-mono text-[10px] text-blue-400/50 mb-3 tracking-widest font-black uppercase">PCI BUS: {gpu.pciId}</div>
                                            <h3 className={`font-black uppercase tracking-tighter text-xl mb-2 transition-colors ${config.gpuPciId === gpu.pciId ? 'text-white' : 'text-gray-400'}`}>{gpu.name}</h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Discrete Graphics Controller</p>
                                        </div>
                                        {config.gpuPciId === gpu.pciId && (
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#5e3aee] to-[#c56bf0]" />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-12 flex justify-between pt-10 border-t border-white/5">
                                <GlassButton variant="ghost" onClick={prevStep} icon={<ChevronLeft size={16} />} className="font-black uppercase tracking-widest !text-[10px]">Back</GlassButton>
                                <GlassButton onClick={nextStep} disabled={!config.gpuPciId} variant="primary" className="px-12 font-black uppercase tracking-widest !text-[10px]" icon={<ChevronRight size={16} />}>Confirm Hardware</GlassButton>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <StepHeader title="USB Injection" sub="Isolate physical USB controllers for native input performance." />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {hardware.usbDevices.map(dev => {
                                    const isActive = config.usbDevices.find(d => d.vendorId === dev.vendorId && d.productId === dev.productId);
                                    return (
                                        <div
                                            key={`${dev.vendorId}:${dev.productId}`}
                                            onClick={() => toggleUsbDevice(dev)}
                                            className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 text-sm flex justify-between items-center ${isActive
                                                ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                                : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/10'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-black uppercase tracking-tight text-[11px] truncate w-32" title={dev.name}>{dev.name}</span>
                                                <span className="text-[9px] font-mono text-gray-500 mt-1 uppercase tracking-widest">{dev.vendorId}:{dev.productId}</span>
                                            </div>
                                            {isActive && <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)] animate-pulse" />}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-12 flex justify-between pt-10 border-t border-white/5">
                                <GlassButton variant="ghost" onClick={prevStep} icon={<ChevronLeft size={16} />} className="font-black uppercase tracking-widest !text-[10px]">Back</GlassButton>
                                <GlassButton onClick={nextStep} variant="primary" className="px-12 font-black uppercase tracking-widest !text-[10px]" icon={<ChevronRight size={16} />}>Confirm Hub</GlassButton>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <StepHeader title="Thread Scheduling" sub={`Total Logic Threads: ${hardware.totalThreads}`} />
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center h-[280px]">
                                <div className="md:col-span-5 space-y-8">
                                    <GlassInput
                                        label="Host Reservation"
                                        type="number"
                                        min={2}
                                        value={config.hostThreads}
                                        onChange={e => setConfig({ ...config, hostThreads: parseInt(e.target.value) })}
                                    />
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Threads reserved for Host Linux to maintain system stability and prevent audio stutters.</p>
                                </div>
                                <div className="md:col-span-7 flex flex-col items-center justify-center p-10 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full scale-150" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2 relative z-10">Guest Allocation</span>
                                    <div className="text-8xl font-black text-white relative z-10 tracking-tighter">
                                        {Math.max(0, hardware.totalThreads - config.hostThreads)}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-4 relative z-10">High-Precision Cores Assigned</span>
                                </div>
                            </div>
                            <div className="mt-10 flex justify-between pt-10 border-t border-white/5">
                                <GlassButton variant="ghost" onClick={prevStep} icon={<ChevronLeft size={16} />} className="font-black uppercase tracking-widest !text-[10px]">Back</GlassButton>
                                <GlassButton onClick={nextStep} variant="primary" className="px-12 font-black uppercase tracking-widest !text-[10px]" icon={<ChevronRight size={16} />}>Confirm Pinning</GlassButton>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <StepHeader title="System Obfuscation" sub="Configure hypervisor invisibility to bypass kernel-level detections." />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div
                                    onClick={() => setConfig({ ...config, stealthMode: !config.stealthMode })}
                                    className={`group p-10 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 relative overflow-hidden ${config.stealthMode ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : 'bg-black/40 border-white/5'}`}
                                >
                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                        <div className={`p-4 rounded-2xl ${config.stealthMode ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-gray-600'}`}>
                                            <AlertTriangle size={24} />
                                        </div>
                                        <span className="font-black uppercase tracking-widest text-sm">Enhanced Stealth</span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed uppercase tracking-tight relative z-10">Spoof hardware identifiers and CPU masks to hide the hypervisor from the guest operating system.</p>
                                </div>

                                <div
                                    onClick={() => setConfig({ ...config, experimentalDisableHyperV: !config.experimentalDisableHyperV })}
                                    className={`group p-10 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 relative overflow-hidden ${config.experimentalDisableHyperV ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'bg-black/40 border-white/5'}`}
                                >
                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                        <div className={`p-4 rounded-2xl ${config.experimentalDisableHyperV ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-600'}`}>
                                            <AlertTriangle size={24} />
                                        </div>
                                        <span className="font-black uppercase tracking-widest text-sm text-balance">Naked Hypervisor</span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed uppercase tracking-tight relative z-10">Experimental: Removes all Hyper-V enlightenments for total hypervisor invisibility. High performance cost.</p>
                                </div>
                            </div>
                            <div className="mt-12 flex justify-between pt-10 border-t border-white/5">
                                <GlassButton variant="ghost" onClick={prevStep} icon={<ChevronLeft size={16} />} className="font-black uppercase tracking-widest !text-[10px]">Back</GlassButton>
                                <GlassButton onClick={nextStep} variant="primary" className="px-12 font-black uppercase tracking-widest !text-[10px]" icon={<ChevronRight size={16} />}>Confirm Stealth</GlassButton>
                            </div>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <StepHeader title="Audio Architecture" sub="Select the low-latency signal pathway for virtualized sound." />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div
                                    onClick={() => setConfig({ ...config, useScream: false })}
                                    className={`group p-10 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 relative overflow-hidden ${!config.useScream ? 'bg-blue-500/10 border-blue-500' : 'bg-black/40 border-white/5'}`}
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <Speaker className={!config.useScream ? "text-blue-400" : "text-gray-600"} size={32} />
                                        <span className="font-black uppercase tracking-widest text-sm">Spice Backhaul</span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium tracking-tight uppercase leading-relaxed">Standard virtual audio routing. Reliable and widely compatible across all operating systems.</p>
                                </div>

                                <div
                                    onClick={() => setConfig({ ...config, useScream: true })}
                                    className={`group p-10 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 relative overflow-hidden ${config.useScream ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'bg-black/40 border-white/5'}`}
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <Speaker className={config.useScream ? "text-yellow-400" : "text-gray-600"} size={32} />
                                        <span className="font-black uppercase tracking-widest text-sm">Scream (Shared Memory)</span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium tracking-tight uppercase leading-relaxed">Industrial-grade IVSHMEM audio. Near-zero latency. Requires guest driver installation.</p>
                                </div>
                            </div>
                            <div className="mt-12 flex justify-between pt-10 border-t border-white/5">
                                <GlassButton variant="ghost" onClick={prevStep} icon={<ChevronLeft size={16} />} className="font-black uppercase tracking-widest !text-[10px]">Back</GlassButton>
                                <GlassButton onClick={nextStep} variant="primary" className="px-12 font-black uppercase tracking-widest !text-[10px]" icon={<ChevronRight size={16} />}>Confirm Audio</GlassButton>
                            </div>
                        </div>
                    )}

                    {step === 7 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <StepHeader title="Disk Provisioning" sub="Allocate high-speed virtual storage volumes." />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-[280px]">
                                <div className="space-y-8">
                                    <GlassInput
                                        label="Provisioned Size (GB)"
                                        type="number"
                                        value={config.diskSizeGB}
                                        onChange={e => setConfig({ ...config, diskSizeGB: parseInt(e.target.value) })}
                                    />
                                    <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3 font-mono text-[9px] uppercase tracking-widest text-gray-500">
                                        <p>Target: /var/lib/libvirt/images/win11.qcow2</p>
                                        <p>Bus Type: VIRTIO-SCSI (FAST)</p>
                                        <p>Cach Mode: RAW-WRITEBACK</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center p-12 rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent border-2 border-white/10">
                                    <div className="text-7xl font-black text-white mb-2">{config.diskSizeGB} <span className="text-2xl text-gray-600 uppercase">GB</span></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Total System Volume</span>
                                </div>
                            </div>
                            <div className="mt-10 flex justify-between pt-10 border-t border-white/5">
                                <GlassButton variant="ghost" onClick={prevStep} icon={<ChevronLeft size={16} />} className="font-black uppercase tracking-widest !text-[10px]">Back</GlassButton>
                                <GlassButton onClick={nextStep} variant="primary" className="px-12 font-black uppercase tracking-widest !text-[10px]" icon={<ChevronRight size={16} />}>Confirm Capacity</GlassButton>
                            </div>
                        </div>
                    )}

                    {step === 8 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <StepHeader title="Video Interlink" sub="Configure visual output and shared memory display controllers." />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div
                                        onClick={() => setConfig({ ...config, useLookingGlass: !config.useLookingGlass })}
                                        className={`group p-10 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 flex flex-col items-center justify-center text-center gap-4 ${config.useLookingGlass ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'bg-black/40 border-white/5'}`}
                                    >
                                        <Monitor size={48} className={config.useLookingGlass ? "text-blue-400" : "text-gray-700"} />
                                        <span className="font-black uppercase tracking-[0.2em] text-xs">Looking Glass Interlink</span>
                                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-tight">Zero-latency shared memory video back-buffer. Best for high-refresh gaming on same monitor.</p>
                                    </div>
                                </div>

                                <div className={`transition-all duration-700 ${config.useLookingGlass ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                                    <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.3em]">Frame Buffer Target</label>
                                    <div className="grid grid-cols-1 gap-4">
                                        {['1080p', '1440p', '4K'].map(res => (
                                            <div
                                                key={res}
                                                onClick={() => setConfig({ ...config, resolution: res })}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all text-sm font-black tracking-widest flex justify-between items-center ${config.resolution === res ? 'bg-white/10 border-white/20 text-white' : 'bg-black/20 border-white/5 text-gray-600'}`}
                                            >
                                                <span>{res} RESOLUTION</span>
                                                {config.resolution === res && <div className="h-2 w-2 rounded-full bg-blue-400" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12 flex justify-between pt-10 border-t border-white/5">
                                <GlassButton variant="ghost" onClick={prevStep} icon={<ChevronLeft size={16} />} className="font-black uppercase tracking-widest !text-[10px]">Back</GlassButton>
                                <GlassButton onClick={handleGenerate} isLoading={loading} variant="primary" className="px-12 font-black uppercase tracking-widest !text-[10px]" icon={<Rocket size={16} />}>Execute Protocol</GlassButton>
                            </div>
                        </div>
                    )}

                    {step === 9 && (
                        <div className="animate-in fade-in zoom-in duration-700 text-center flex flex-col items-center justify-center h-full">
                            <StepHeader title="Environment Manifest" sub="Review the orchestrated XML definition before host deployment." />

                            <div className="w-full relative group mb-12">
                                <div className="absolute inset-0 bg-white/2 blur-2xl group-hover:bg-blue-500/5 transition-colors duration-500 rounded-3xl" />
                                <pre className="relative p-10 rounded-[2.5rem] bg-black/80 border-2 border-white/5 text-[10px] font-mono text-blue-400/90 overflow-auto max-h-[350px] leading-relaxed text-left scrollbar-custom shadow-2xl">
                                    {generatedXml}
                                </pre>
                                {creationResult && (
                                    <div className={`mt-6 p-6 rounded-3xl backdrop-blur-3xl border-2 animate-in slide-in-from-bottom-4 duration-700 ${creationResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                        <div className="flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[10px]">
                                            {creationResult.success ? <Check size={18} /> : <AlertTriangle size={18} />}
                                            <span>{creationResult.message}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-6 w-full max-w-lg">
                                <GlassButton variant="ghost" onClick={() => setStep(1)} className="flex-1 py-5 font-black uppercase tracking-widest !text-[10px]">Reset Protocol</GlassButton>
                                <GlassButton
                                    onClick={handleDeploy}
                                    disabled={loading || (creationResult && creationResult.success)}
                                    isLoading={loading}
                                    variant="primary"
                                    className="flex-[2] py-5 font-black uppercase tracking-widest !text-[10px]"
                                >
                                    {creationResult && creationResult.success ? 'System Operational' : 'Initialize Deployment'}
                                </GlassButton>
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};
export default SetupWizard;
