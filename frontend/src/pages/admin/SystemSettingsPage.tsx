import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import type { SystemSetting } from '../../types/admin';
import { Loader2, Save, Settings, Globe, Lock, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const SystemSettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [editValues, setEditValues] = useState<{ [key: string]: string }>({});
    const [savingKey, setSavingKey] = useState<string | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSetting, setNewSetting] = useState({
        key: '',
        value: '',
        description: '',
        is_public: false
    });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await adminService.getSettings();
            setSettings(data);
            const values: { [key: string]: string } = {};
            data.forEach(s => values[s.key] = s.value);
            setEditValues(values);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string) => {
        setSavingKey(key);
        try {
            await adminService.updateSetting(key, { value: editValues[key] });
            toast.success('Setting updated successfully');
        } catch (error) {
            console.error('Failed to update setting:', error);
            toast.error('Failed to update setting');
        } finally {
            setSavingKey(null);
        }
    };

    const handleCreateSetting = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const created = await adminService.createSetting(newSetting);
            setSettings([...settings, created]);
            setEditValues({ ...editValues, [created.key]: created.value });
            toast.success('Setting created successfully');
            setShowCreateModal(false);
            setNewSetting({ key: '', value: '', description: '', is_public: false });
        } catch (error: any) {
            console.error('Failed to create setting:', error);
            toast.error(error.response?.data?.detail || 'Failed to create setting');
        } finally {
            setIsCreating(false);
        }
    };

    const renderInput = (setting: SystemSetting) => {
        // Determine input type based on key or value content
        // This is a naive heuristic, can be improved with explicit types from backend
        const isSecret = setting.key.toLowerCase().includes('secret') || setting.key.toLowerCase().includes('key') || setting.key.toLowerCase().includes('password');
        const isBoolean = setting.value === 'true' || setting.value === 'false';

        if (isBoolean) {
            return (
                <select
                    value={editValues[setting.key]}
                    onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="true">True (Enabled)</option>
                    <option value="false">False (Disabled)</option>
                </select>
            );
        }

        return (
            <input
                type={isSecret ? "password" : "text"}
                value={editValues[setting.key] || ''}
                onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                placeholder={isSecret ? "••••••••" : ""}
            />
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    // Group settings by prefix (e.g., "auth.", "email.", "site.")
    const groups: { [key: string]: SystemSetting[] } = {};
    settings.forEach(setting => {
        const prefix = setting.key.split('.')[0];
        const groupName = prefix.charAt(0).toUpperCase() + prefix.slice(1) + " Configuration";
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(setting);
    });

    // If no grouped settings (no dots), fallback to "General"
    if (Object.keys(groups).length === 0 && settings.length > 0) {
        groups["General Configuration"] = settings;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                        <p className="mt-2 text-gray-600">Configure platform-wide settings, feature flags, and secrets.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Setting
                    </button>
                </div>

                {Object.entries(groups).map(([groupName, groupSettings]) => (
                    <div key={groupName} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-indigo-600" />
                                {groupName}
                            </h2>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {groupSettings.map((setting) => (
                                <div key={setting.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between gap-4 flex-wrap md:flex-nowrap">
                                        <div className="flex-1 min-w-[300px]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <label className="font-medium text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded">{setting.key}</label>
                                                {setting.is_public ? (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                                        <Globe className="w-3 h-3" /> Public
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                                        <Lock className="w-3 h-3" /> Private
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mb-3">{setting.description || 'No description available for this setting.'}</p>

                                            <div className="flex gap-4">
                                                {renderInput(setting)}
                                                <button
                                                    onClick={() => handleSave(setting.key)}
                                                    disabled={savingKey === setting.key}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
                                                >
                                                    {savingKey === setting.key ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Save className="w-4 h-4" />
                                                            Save
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Create Setting Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Add New Setting</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSetting} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Key (e.g. site.name)</label>
                                    <input
                                        type="text"
                                        required
                                        value={newSetting.key}
                                        onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                                        placeholder="category.key_name"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Use dot notation to group settings (e.g. 'auth.google_client_id')</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                                    <input
                                        type="text"
                                        required
                                        value={newSetting.value}
                                        onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Value"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={newSetting.description}
                                        onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="What is this setting for?"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_public"
                                        checked={newSetting.is_public}
                                        onChange={(e) => setNewSetting({ ...newSetting, is_public: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="is_public" className="text-sm text-gray-700">Make this setting public (visible to anyone)</label>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            "Create Setting"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {settings.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                        <Settings className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No settings found.</p>
                        <p className="text-sm mt-2">Initialize the database with default settings.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
