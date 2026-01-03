import React, { useState } from 'react';
import { HardDrive, X, Plus, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';
import { GlassButton } from './ui/GlassButton';

interface DiskManagerProps {
    vmName: string;
    currentSizeGB: number;
    onClose: () => void;
    onExpand: (newSize: number) => void;
}

export const DiskManager = ({ vmName, currentSizeGB, onClose, onExpand }: DiskManagerProps) => {
    const [expanding, setExpanding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIncrement, setSelectedIncrement] = useState<number>(25);
    const [mode, setMode] = useState<'preset' | 'custom'>('preset');
    const [customAmount, setCustomAmount] = useState<string>('');
    const [customUnit, setCustomUnit] = useState<'GB' | 'MB'>('GB');

    const API_CONTROL = '/api/control';

    const handleExpand = async () => {
        try {
            setExpanding(true);
            setError(null);

            const body: any = {};
            if (mode === 'preset') {
                body.expansionGB = selectedIncrement;
            } else {
                if (!customAmount || isNaN(parseFloat(customAmount))) {
                    setError('Please enter a valid amount');
                    setExpanding(false);
                    return;
                }
                body.amount = parseFloat(customAmount);
                body.unit = customUnit;
            }

            const response = await fetch(`${API_CONTROL}/expand-disk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (data.success) {
                onExpand(data.newSizeGB);
                // We keep it open so they see the success or can expand more, 
                // but usually closing on success is cleaner if the parent updates.
                // However, let's keep it open for a moment.
                if (mode === 'custom') setCustomAmount('');
            } else {
                setError(data.error || 'Failed to expand disk');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setExpanding(false);
        }
    };

    const increments = [10, 25, 50, 100];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900/95 border border-white/20 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <HardDrive className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tighter shrink-0 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 drop-shadow-2xl">Disk Manager</h3>
                            <p className="text-sm text-gray-400">Manage storage for {vmName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Current Size Display */}
                    <div className="bg-white/5 rounded-xl p-5 border border-white/10 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Current Capacity</p>
                            <p className="text-3xl font-black text-white">{currentSizeGB} GB</p>
                        </div>
                        <HardDrive size={40} className="text-white/10" />
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setMode('preset')}
                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${mode === 'preset' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Presets
                        </button>
                        <button
                            onClick={() => setMode('custom')}
                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${mode === 'custom' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Custom
                        </button>
                    </div>

                    {/* Expansion Selection */}
                    <div className="min-h-[140px]">
                        {mode === 'preset' ? (
                            <div>
                                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Quick Resize
                                </h4>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {increments.map((inc) => (
                                        <button
                                            key={inc}
                                            onClick={() => setSelectedIncrement(inc)}
                                            className={`py-3 rounded-lg font-bold transition-all border ${selectedIncrement === inc
                                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            +{inc} GB
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Custom Amount
                                </h4>
                                <div className="flex gap-3 mb-6">
                                    <input
                                        type="number"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                        placeholder="Enter value"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all font-bold"
                                    />
                                    <div className="flex bg-black/40 rounded-lg border border-white/10 p-1">
                                        <button
                                            onClick={() => setCustomUnit('GB')}
                                            className={`px-3 rounded-md text-xs font-black transition-all ${customUnit === 'GB' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                                        >
                                            GB
                                        </button>
                                        <button
                                            onClick={() => setCustomUnit('MB')}
                                            className={`px-3 rounded-md text-xs font-black transition-all ${customUnit === 'MB' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                                        >
                                            MB
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <GlassButton
                            onClick={handleExpand}
                            disabled={expanding}
                            variant="primary"
                            className="w-full py-4 !text-base"
                            icon={expanding ? <RefreshCw className="animate-spin" /> : <ChevronRight />}
                        >
                            {expanding ? 'Expanding Storage...' :
                                mode === 'preset' ? `Confirm +${selectedIncrement} GB Expansion` :
                                    `Confirm +${customAmount || 0} ${customUnit} Expansion`}
                        </GlassButton>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-center gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white/2 border-t border-white/5">
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                        <span className="text-yellow-500/80 font-bold uppercase tracking-tighter mr-1">Note:</span>
                        Expansion is immediate at the hardware level. You may need to extend the partition within the guest OS (e.g., Disk Management in Windows) to use the new space.
                    </p>
                </div>
            </div>
        </div>
    );
};
