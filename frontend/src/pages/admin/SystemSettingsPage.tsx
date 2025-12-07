import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import type { SystemSetting } from '../../types/admin';
import { Loader2, Save, Settings, Globe, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export const SystemSettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [editValues, setEditValues] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await adminService.getSettings();
            setSettings(data);
            // Initialize edit values
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
        try {
            await adminService.updateSetting(key, { value: editValues[key] });
            toast.success('Setting updated successfully');
        } catch (error) {
            console.error('Failed to update setting:', error);
            toast.error('Failed to update setting');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                    <p className="mt-2 text-gray-600">Configure platform-wide settings and variables.</p>
                </div>

                {/* Settings List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-500" />
                            General Configuration
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {settings.length > 0 ? (
                            settings.map((setting) => (
                                <div key={setting.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <label className="font-medium text-gray-900">{setting.key}</label>
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
                                            <p className="text-sm text-gray-500 mb-3">{setting.description || 'No description'}</p>

                                            <div className="flex gap-8">
                                                <input
                                                    type="text"
                                                    value={editValues[setting.key] || ''}
                                                    onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                                                />
                                                <button
                                                    onClick={() => handleSave(setting.key)}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <Settings className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p>No settings found.</p>
                                <p className="text-sm mt-2">Initialize the database with default settings.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
