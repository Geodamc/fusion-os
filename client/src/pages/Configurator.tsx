import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Copy, Cpu, Database, Layers, Loader2, Monitor, RefreshCcw, ShieldAlert, Terminal, Wrench, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';

const API_BASE = '/api/config';

interface OptionCardProps {
    title: string;
    description: string;
    selected: boolean;
    onClick: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({ title, description, selected, onClick }) => (
    <div
        onClick={onClick}
        className={`group p-8 rounded-3xl border-2 cursor-pointer transition-all duration-500 relative overflow-hidden ${selected
            ? 'bg-black/60 border-[#00bcd4] shadow-[0_20px_40px_-15px_rgba(249,115,22,0.2)]'
            : 'bg-black/30 border-white/5 hover:border-white/15'
            }`}
    >
        <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
                <h3 className={`font-black uppercase tracking-widest text-sm transition-colors ${selected ? 'text-[#26c6da]' : 'text-white'}`}>{title}</h3>
                {selected && <div className="h-2 w-2 rounded-full bg-[#26c6da] animate-pulse shadow-[0_0_10px_#26c6da]" />}
            </div>
            <p className="text-xs text-gray-300 font-medium leading-relaxed group-hover:text-white transition-colors uppercase tracking-tight">{description}</p>
        </div>
        {selected && (
            <>
                <div className="absolute inset-0 bg-gradient-to-br from-[#00bcd4]/5 via-[#26c6da]/5 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#00bcd4] to-[#26c6da] background-animate" />
            </>
        )}
    </div>
);

const Configurator = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState<any>({
        cpuManufacturer: null,
        amdZen2Plus: null,
        nestedVirtualization: null,
        disableMitigations: null,
        performanceGovernor: null,
        biosFixes: null,
    });

    const [gpuList, setGpuList] = useState<any[]>([]);
    const [selectedGpu, setSelectedGpu] = useState<any>(null);
    const [guestGpuBrand, setGuestGpuBrand] = useState<'Nvidia' | 'AMD' | null>(null);
    const [isLoadingGpus, setIsLoadingGpus] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [applyMessage, setApplyMessage] = useState<any>(null);

    useEffect(() => {
        if (step === 7 && gpuList.length === 0) {
            setIsLoadingGpus(true);
            fetch(`${API_BASE}/get-gpus`)
                .then(res => res.json())
                .then(data => setGpuList(data.gpus || []))
                .finally(() => setIsLoadingGpus(false));
        }
    }, [step]);

    const generateCommand = () => {
        let cmd = 'GRUB_CMDLINE_LINUX_DEFAULT="quiet splash video=efifb:off rd.driver.pre=vfio-pci iommu=pt kvm.ignore_msrs=1';
        if (config.cpuManufacturer === 'Intel') cmd += ' intel_iommu=on';
        if (config.cpuManufacturer === 'AMD') cmd += ' amd_iommu=on';
        if (config.cpuManufacturer === 'AMD' && config.amdZen2Plus) cmd += ' amd_pstate=active';

        if (config.nestedVirtualization) {
            if (config.cpuManufacturer === 'Intel') cmd += ' kvm-intel.nested=1';
            if (config.cpuManufacturer === 'AMD') cmd += ' kvm-amd.nested=1';
        }
        if (config.disableMitigations) cmd += ' mitigations=off';
        if (config.performanceGovernor) cmd += ' cpufreq.default_governor=performance';
        if (config.biosFixes) cmd += ' processor.ignore_ppc=1';

        cmd += '"';
        return cmd;
    };

    const handleApplyConfig = async () => {
        setIsApplying(true);
        setApplyMessage(null);
        try {
            const grubResponse = await fetch(`${API_BASE}/update-grub`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grubConfig: generateCommand() }),
            });
            if (!grubResponse.ok) throw new Error('Error updating GRUB');

            if (selectedGpu && guestGpuBrand) {
                const gpuIds = [selectedGpu.gpuId];
                if (selectedGpu.audioId) gpuIds.push(selectedGpu.audioId);
                const vfioResponse = await fetch(`${API_BASE}/apply-vfio`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gpuIds, guestBrand: guestGpuBrand }),
                });
                if (!vfioResponse.ok) throw new Error('Error applying VFIO config');
            }
            setApplyMessage({ type: 'success', text: 'Configuration applied successfully! Please reboot.' });
        } catch (error: any) {
            setApplyMessage({ type: 'error', text: error.message || 'Unknown error' });
        } finally {
            setIsApplying(false);
        }
    };

    const nextStep = () => {
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
    };

    const StepHeader = ({ icon: Icon, title, sub }: any) => (
        <div className="mb-12 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#00bcd4]/10 blur-[80px] pointer-events-none" />
            <div className="flex items-center gap-3 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#26c6da] to-[#00bcd4] font-black uppercase tracking-[0.3em] text-[10px]">
                <Icon size={20} className="text-[#26c6da]" />
                <span>Configuration Protocol // Phase {step}/8</span>
            </div>
            <h2 className="text-5xl font-black mb-3 tracking-tighter shrink-0 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 drop-shadow-2xl">{title}</h2>
            <p className="text-gray-300 font-medium leading-relaxed max-w-2xl">{sub}</p>
            <div className="h-1 w-20 bg-gradient-to-r from-[#00bcd4] to-[#26c6da] mt-6 rounded-full" />
        </div>
    );

    return (
        <div className="min-h-screen p-6 sm:p-12 flex flex-col items-center justify-center">
            <div className="w-full max-w-4xl">
                <GlassCard premium animated className="min-h-[580px] flex flex-col !p-12">
                    <div className="flex-1">
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <StepHeader icon={Cpu} title="CPU Manufacturer" sub="Select the orchestration engine powering your physical machine." />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <OptionCard title="Intel" description="Optimized for Core i3, i5, i7, i9, Xeon" selected={config.cpuManufacturer === 'Intel'} onClick={() => setConfig({ ...config, cpuManufacturer: 'Intel' })} />
                                    <OptionCard title="AMD" description="Optimized for Ryzen, Threadripper, EPYC" selected={config.cpuManufacturer === 'AMD'} onClick={() => setConfig({ ...config, cpuManufacturer: 'AMD' })} />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <StepHeader icon={Cpu} title="AMD Generation" sub="Precision tuning for Zen microarchitecture and P-State." />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <OptionCard title="Modern Zen" description="Zen 2 (3000) or newer (5000/7000/9000)" selected={config.amdZen2Plus === true} onClick={() => setConfig({ ...config, amdZen2Plus: true })} />
                                    <OptionCard title="Legacy AMD" description="Zen 1, FX, or older architectures" selected={config.amdZen2Plus === false} onClick={() => setConfig({ ...config, amdZen2Plus: false })} />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <StepHeader icon={Layers} title="Nested Virt" sub="Layered virtualization for dev environments like WSL2 or Docker." />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <OptionCard title="Enable" description="Allow virtualized hardware acceleration inside VM" selected={config.nestedVirtualization === true} onClick={() => setConfig({ ...config, nestedVirtualization: true })} />
                                    <OptionCard title="Disable" description="Limit guest to single-layer execution environment" selected={config.nestedVirtualization === false} onClick={() => setConfig({ ...config, nestedVirtualization: false })} />
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <StepHeader icon={ShieldAlert} title="Performance Core" sub="Disable silicon mitigations to unlock raw compute power." />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <OptionCard title="Unrestricted" description="Disable mitigations. Maximum FPS, higher risk." selected={config.disableMitigations === true} onClick={() => setConfig({ ...config, disableMitigations: true })} />
                                    <OptionCard title="Protected" description="Keep security patches active. Lower performance." selected={config.disableMitigations === false} onClick={() => setConfig({ ...config, disableMitigations: false })} />
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <StepHeader icon={Zap} title="Clock Governor" sub="Override system power management for consistent latencies." />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <OptionCard title="Performance" description="Lock high clock states. Ideal for gaming." selected={config.performanceGovernor === true} onClick={() => setConfig({ ...config, performanceGovernor: true })} />
                                    <OptionCard title="Schedutil" description="Balanced default Linux scheduling frequency." selected={config.performanceGovernor === false} onClick={() => setConfig({ ...config, performanceGovernor: false })} />
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <StepHeader icon={Wrench} title="ACPI Precision" sub="Correct BIOS frequency reporting inconsistencies." />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <OptionCard title="Apply Override" description="Force ignore PPC reporting limitations." selected={config.biosFixes === true} onClick={() => setConfig({ ...config, biosFixes: true })} />
                                    <OptionCard title="Native" description="Use standard kernel ACPI frequency tables." selected={config.biosFixes === false} onClick={() => setConfig({ ...config, biosFixes: false })} />
                                </div>
                            </div>
                        )}

                        {step === 7 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <StepHeader icon={Monitor} title="Hardware Isolation" sub="Select primary PCI-E Controller for VFIO binding." />
                                {isLoadingGpus ? (
                                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                                        <RefreshCcw className="animate-spin text-blue-500" size={40} />
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Scanning PCI Bus...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[300px] overflow-auto pr-4 scrollbar-custom">
                                        {gpuList.map((gpu, idx) => (
                                            <OptionCard
                                                key={idx}
                                                title={gpu.name}
                                                description={`PCI ID: ${gpu.gpuId} ${gpu.audioId ? `| AUDIO: ${gpu.audioId}` : ''}`}
                                                selected={selectedGpu?.gpuId === gpu.gpuId}
                                                onClick={() => setSelectedGpu(gpu)}
                                            />
                                        ))}
                                        <OptionCard title="Manual Config" description="Skip automated binding. Configure VFIO later." selected={selectedGpu === null} onClick={() => setSelectedGpu(null)} />
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 8 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <StepHeader icon={Monitor} title="Guest GPU Brand" sub="Enable vendor-specific optimizations and Error 43 fixes." />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <OptionCard title="Nvidia GeForce" description="Hide KVM, apply vendor-id fixes & blacklist Nouveau." selected={guestGpuBrand === 'Nvidia'} onClick={() => setGuestGpuBrand('Nvidia')} />
                                    <OptionCard title="AMD Radeon" description="Standard VFIO binding for RDNA architectures." selected={guestGpuBrand === 'AMD'} onClick={() => setGuestGpuBrand('AMD')} />
                                </div>
                            </div>
                        )}

                        {step === 9 && (
                            <div className="animate-in fade-in zoom-in duration-700 text-center flex flex-col items-center justify-center h-full">
                                <div className="relative mb-12">
                                    <div className="absolute inset-0 bg-[#5e3aee]/20 blur-3xl rounded-full scale-150" />
                                    <div className="relative p-8 rounded-full bg-gradient-to-br from-[#5e3aee] to-[#c56bf0] text-white shadow-2xl">
                                        <Terminal size={48} />
                                    </div>
                                </div>
                                <h2 className="text-5xl font-black mb-4 tracking-tighter text-white">Kernel Synchronized</h2>
                                <p className="text-gray-400 font-medium mb-12 max-w-lg mx-auto leading-relaxed">System parameters have been computed. Review the low-level boot arguments before committing to GRUB.</p>

                                <div className="w-full max-w-2xl mb-12 relative group">
                                    <div className="absolute inset-0 bg-white/5 blur-xl group-hover:bg-[#5e3aee]/5 transition-colors duration-500 rounded-3xl" />
                                    <div className="relative bg-black/80 rounded-3xl border-2 border-white/5 p-8 font-mono text-sm text-blue-400/90 shadow-2xl overflow-x-auto text-left leading-loose">
                                        {generateCommand()}
                                    </div>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(generateCommand()); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                        className="absolute top-4 right-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all active:scale-95"
                                    >
                                        {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
                                    </button>
                                </div>

                                <div className="flex flex-col items-center gap-6 w-full max-w-xs">
                                    <GlassButton onClick={handleApplyConfig} disabled={isApplying} isLoading={isApplying} variant="primary" className="w-full py-5 !text-sm font-black">
                                        Initialize Protocol
                                    </GlassButton>

                                    {applyMessage && (
                                        <div className={`w-full px-6 py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest ${applyMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                            {applyMessage.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {step < 9 && (
                        <div className="mt-12 flex justify-between items-center pt-10 border-t border-white/5">
                            <GlassButton variant="ghost" onClick={prevStep} disabled={step === 1} icon={<ChevronLeft size={18} />} className="!px-6 !py-3 !text-[10px] font-black uppercase tracking-widest">
                                Back
                            </GlassButton>

                            <GlassButton
                                onClick={nextStep}
                                variant="primary"
                                className="px-12 py-3 !text-[10px] font-black uppercase tracking-widest"
                                icon={<ChevronRight size={16} />}
                            >
                                Confirm Hub
                            </GlassButton>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};
export default Configurator;
