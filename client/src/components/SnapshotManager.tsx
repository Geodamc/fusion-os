import React, { useState, useEffect } from 'react';
import { Camera, RotateCcw, Trash2, X, Plus, Clock, AlertCircle } from 'lucide-react';
// import { GlassCard } from './ui/GlassCard'; // Removed as unused in original code rendering, relying on modal divs

interface Snapshot {
    name: string;
    creationTime: string;
    state: string;
}

interface SnapshotManagerProps {
    vmId: string; // Not strictly used by backend (uses hardcoded VM_NAME) but good for props
    vmName: string;
    onClose: () => void;
}

export const SnapshotManager = ({ vmId, vmName, onClose }: SnapshotManagerProps) => {
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newSnapshotName, setNewSnapshotName] = useState('');
    const [newSnapshotDesc, setNewSnapshotDesc] = useState('');
    const [creating, setCreating] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);

    // Backend endpoint base
    const API_CONTROL = '/api/control';

    useEffect(() => {
        fetchSnapshots();
    }, []);

    const fetchSnapshots = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_CONTROL}/list-snapshots`, {
                method: 'GET', // Changed to GET to match backend definition I added? Wait, I added it as GET. Original was POST.
            });
            const data = await response.json();
            if (data.success) {
                setSnapshots(data.snapshots);
            } else {
                setError(data.error || 'Failed to fetch snapshots');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSnapshot = async () => {
        if (!newSnapshotName.trim()) return;

        try {
            setCreating(true);
            const response = await fetch(`${API_CONTROL}/create-snapshot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSnapshotName, description: newSnapshotDesc }),
            });
            const data = await response.json();
            if (data.success) {
                setNewSnapshotName('');
                setNewSnapshotDesc('');
                fetchSnapshots();
            } else {
                setError(data.error || 'Failed to create snapshot');
            }
        } catch (err) {
            setError('Failed to create snapshot');
        } finally {
            setCreating(false);
        }
    };

    const handleRevertSnapshot = async (snapshotName: string) => {
        if (!confirm(`Are you sure you want to revert to snapshot "${snapshotName}"? Current state will be lost.`)) return;

        try {
            setProcessing(snapshotName);
            const response = await fetch(`${API_CONTROL}/revert-snapshot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ snapshotName }),
            });
            const data = await response.json();
            if (data.success) {
                alert('Snapshot reverted successfully');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            alert('Failed to revert snapshot');
        } finally {
            setProcessing(null);
        }
    };

    const handleDeleteSnapshot = async (snapshotName: string) => {
        if (!confirm(`Are you sure you want to delete snapshot "${snapshotName}"?`)) return;

        try {
            setProcessing(snapshotName);
            const response = await fetch(`${API_CONTROL}/delete-snapshot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ snapshotName }),
            });
            const data = await response.json();
            if (data.success) {
                fetchSnapshots();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            alert('Failed to delete snapshot');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900/95 border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Camera className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tighter shrink-0 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 drop-shadow-2xl">Snapshot Manager</h3>
                            <p className="text-sm text-gray-400">Manage restore points for {vmName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Create New Snapshot Section */}
                    <div className="mb-8 bg-white/5 rounded-xl p-5 border border-white/10">
                        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Create New Snapshot
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newSnapshotName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSnapshotName(e.target.value)}
                                    placeholder="e.g. Clean Install"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={newSnapshotDesc}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSnapshotDesc(e.target.value)}
                                    placeholder="e.g. Before installing updates"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleCreateSnapshot}
                            disabled={!newSnapshotName || creating}
                            className={`w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${!newSnapshotName || creating
                                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                }`}
                        >
                            {creating ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating Snapshot...
                                </>
                            ) : (
                                <>
                                    <Camera className="w-4 h-4" />
                                    Create Snapshot
                                </>
                            )}
                        </button>
                    </div>

                    {/* Snapshots List */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Existing Snapshots
                        </h4>

                        {loading ? (
                            <div className="text-center py-12 text-gray-500">
                                <span className="w-6 h-6 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin inline-block mb-2" />
                                <p>Loading snapshots...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        ) : snapshots.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
                                <Camera className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                <p>No snapshots found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {snapshots.map((snap: Snapshot) => (
                                    <div key={snap.name} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/10 transition-colors group">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h5 className="font-bold text-white">{snap.name}</h5>
                                                {snap.state === 'running' && (
                                                    <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">
                                                        RUNNING
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {snap.creationTime}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleRevertSnapshot(snap.name)}
                                                disabled={!!processing}
                                                className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-white/5 hover:bg-yellow-500/20 text-gray-300 hover:text-yellow-400 border border-white/5 hover:border-yellow-500/30 transition-all text-sm flex items-center justify-center gap-2"
                                                title="Revert to this snapshot"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                <span className="sm:hidden">Revert</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSnapshot(snap.name)}
                                                disabled={!!processing}
                                                className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all text-sm flex items-center justify-center gap-2"
                                                title="Delete snapshot"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="sm:hidden">Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
