import { useState, useEffect } from 'react';
import { systemService } from '../../services/system.service';
import type { SystemSetting } from '../../services/system.service';
import { Loader2, Save, Settings, Globe, Lock, Plus, X, Monitor, Moon, Sun, LayoutTemplate, Power, Trash } from 'lucide-react';
// ... imports

import { PageLoader } from '../../components/common/PageLoader';
import toast from 'react-hot-toast';
import { useThemeStore } from '../../store/theme.store';
import { useTranslation } from '../../hooks/useTranslation';
import { ImageUpload } from '../../components/common/ImageUpload';
import { DeleteConfirmationModal } from '../../components/common/DeleteConfirmationModal';

const THEME_COLORS = [
    { id: 'default', name: 'Default Indigo', value: 'indigo' },
    { id: 'ocean', name: 'Ocean Blue', value: 'blue' },
    { id: 'midnight', name: 'Midnight Purple', value: 'purple' },
    { id: 'forest', name: 'Forest Green', value: 'emerald' },
    { id: 'sunset', name: 'Sunset Orange', value: 'orange' },
] as const;

export const SystemSettingsPage = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'localization' | 'advanced'>('general');

    // Store State

    const {
        themeColor, setThemeColor,
        mode, setMode,
        language, setLanguage,
        appIcon, setAppIcon,
        appName, setAppName,
        maintenanceMode, setMaintenanceMode,
        allowRegistration, setAllowRegistration
    } = useThemeStore();
    const { t } = useTranslation();

    // Advanced Settings State (Backend)
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
        // Since we are using a store for the main UI, we don't strictly *need* to wait for backend 
        // for the first 3 tabs, but we'll keep the loader for the "Advanced" data.
    }, []);

    // Apply theme effect (Visual simulation for now)
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('dark');
        if (mode === 'dark') {
            root.classList.add('dark');
        } else if (mode === 'system') {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
            }
        }
        // In a real app, we'd would also swap CSS variables for colors here based on themeColor
    }, [mode, themeColor]);


    const fetchSettings = async () => {
        try {
            const data = await systemService.getAllSettings();
            setSettings(data);
            const values: { [key: string]: string } = {};
            data.forEach(s => values[s.key] = s.value);
            setEditValues(values);

            // Sync Store with Backend Settings (Source of Truth)
            const syncedName = data.find(s => s.key === 'site.name')?.value;
            if (syncedName) setAppName(syncedName);

            const syncedIcon = data.find(s => s.key === 'site.icon')?.value;
            if (syncedIcon) setAppIcon(syncedIcon);

            const syncedMaint = data.find(s => s.key === 'site.maintenance_mode')?.value;
            if (syncedMaint) setMaintenanceMode(syncedMaint === 'true');

            const syncedReg = data.find(s => s.key === 'site.allow_registration')?.value;
            if (syncedReg) setAllowRegistration(syncedReg === 'true');

            const syncedLang = data.find(s => s.key === 'site.language')?.value;
            if (syncedLang) setLanguage(syncedLang as any);

        } catch (error) {
            console.error('Failed to fetch settings:', error);
            // Don't show toast on 404/auth error to avoid spamming if backend isn't fully ready
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBackendSetting = async (key: string) => {
        setSavingKey(key);
        try {
            await systemService.updateSetting(key, { value: editValues[key] });
            toast.success('Setting updated successfully');
        } catch (error) {
            console.error('Failed to update setting:', error);
            toast.error('Failed to update setting');
        } finally {
            setSavingKey(null);
        }
    };

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [settingToDelete, setSettingToDelete] = useState<string | null>(null);

    const handleDeleteClick = (key: string) => {
        setSettingToDelete(key);
        setDeleteModalOpen(true);
    };

    const confirmDeleteSetting = async () => {
        if (!settingToDelete) return;

        const toastId = toast.loading('Deleting setting...');
        try {
            await systemService.deleteSetting(settingToDelete);
            setSettings(settings.filter(s => s.key !== settingToDelete));
            const newEditValues = { ...editValues };
            delete newEditValues[settingToDelete];
            setEditValues(newEditValues);
            toast.success('Setting deleted successfully', { id: toastId });
            setDeleteModalOpen(false);
        } catch (error) {
            console.error('Failed to delete setting:', error);
            toast.error('Failed to delete setting', { id: toastId });
        } finally {
            setSettingToDelete(null);
        }
    };

    const [searchQuery, setSearchQuery] = useState('');

    const handleCreateSetting = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const created = await systemService.createSetting(newSetting);
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

    const saveGeneralSettings = async () => {
        const toastId = toast.loading('Saving general settings...');
        try {
            // Update or create settings on backend
            const updates = [
                { key: 'site.name', value: appName, description: 'Application Name', is_public: true },
                { key: 'site.icon', value: appIcon || '', description: 'Application Icon URL', is_public: true },
                { key: 'site.maintenance_mode', value: String(maintenanceMode), description: 'System Maintenance Mode', is_public: true },
                { key: 'site.allow_registration', value: String(allowRegistration), description: 'Allow User Registration', is_public: true },
            ];

            // In a real app we might want a bulk update endpoint, but concurrent requests work for now
            await Promise.all(updates.map(u => systemService.createSetting(u).catch(() => systemService.updateSetting(u.key, { value: u.value }))));

            toast.success('General settings saved', { id: toastId });
            fetchSettings(); // Refresh advanced list
        } catch (error) {
            console.error('Failed to save general settings:', error);
            toast.error('Failed to save settings', { id: toastId });
        }
    };

    const saveLocalizationSettings = async () => {
        const toastId = toast.loading('Saving localization settings...');
        try {
            await systemService.createSetting({
                key: 'site.language',
                value: language,
                description: 'Default System Language',
                is_public: true
            }).catch(() => systemService.updateSetting('site.language', { value: language }));

            toast.success('Localization settings saved', { id: toastId });
            fetchSettings();
        } catch (error) {
            console.error('Failed to save localization:', error);
            toast.error('Failed to save settings', { id: toastId });
        }
    };

    const renderInput = (setting: SystemSetting) => {
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

    // Advanced Grouping Logic
    const groups: { [key: string]: SystemSetting[] } = {};
    const filteredSettings = settings.filter(s =>
        s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filteredSettings.forEach(setting => {
        const prefix = setting.key.split('.')[0];
        const groupName = prefix.charAt(0).toUpperCase() + prefix.slice(1) + " Configuration";
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(setting);
    });
    if (Object.keys(groups).length === 0 && settings.length > 0) {
        // If search results exist but logic failed to group (unlikely if logic is consistent), or if no search results.
        // Actually, if filteredSettings is empty, groups will be empty.
        // If filteredSettings has items but they don't have dots, put in General.
        if (filteredSettings.length > 0) {
            groups["General Configuration"] = filteredSettings;
        }
    }

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
                    <p className="mt-2 text-gray-600">{t('settings.subtitle')}</p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-8 overflow-x-auto">
                    {[
                        { id: 'general', label: t('settings.tabs.general'), icon: Settings },
                        { id: 'appearance', label: t('settings.tabs.appearance'), icon: LayoutTemplate },
                        { id: 'localization', label: t('settings.tabs.localization'), icon: Globe },
                        { id: 'advanced', label: t('settings.tabs.advanced'), icon: Lock },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-6">

                    {/* --- GENERAL TAB --- */}
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <Monitor className="w-5 h-5 text-primary-600" />
                                    Application Identity
                                </h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Name</label>
                                    <input
                                        type="text"
                                        value={appName}
                                        onChange={(e) => setAppName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Mindporium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Icon</label>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <ImageUpload
                                            value={appIcon || ''}
                                            onChange={(url) => setAppIcon(url)}
                                            label=""
                                            variant="avatar"
                                            className="flex flex-col items-center justify-center"
                                            entityType="system"
                                            entityId="0"
                                            category="icon"
                                        />
                                        <p className="text-xs text-center text-gray-500 mt-2">Recommended: 512x512px PNG/SVG</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <Power className="w-5 h-5 text-indigo-600" />
                                    System Status
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                                            <p className="text-sm text-gray-500">Disable access for non-admin users</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={maintenanceMode}
                                                onChange={(e) => setMaintenanceMode(e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Allow Registration</h3>
                                            <p className="text-sm text-gray-500">Allow new users to create accounts</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={allowRegistration}
                                                onChange={(e) => setAllowRegistration(e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={saveGeneralSettings}
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm font-medium"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* --- APPEARANCE TAB --- */}
                    {activeTab === 'appearance' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <Moon className="w-5 h-5 text-primary-600" />
                                    Display Mode
                                </h2>

                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setMode('light')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${mode === 'light' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                                    >
                                        <Sun className="w-8 h-8 mb-2" />
                                        <span className="font-medium text-sm">Light</span>
                                    </button>
                                    <button
                                        onClick={() => setMode('dark')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${mode === 'dark' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                                    >
                                        <Moon className="w-8 h-8 mb-2" />
                                        <span className="font-medium text-sm">Dark</span>
                                    </button>
                                    <button
                                        onClick={() => setMode('system')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${mode === 'system' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                                    >
                                        <Monitor className="w-8 h-8 mb-2" />
                                        <span className="font-medium text-sm">System</span>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <LayoutTemplate className="w-5 h-5 text-primary-600" />
                                    Theme Color
                                </h2>

                                <div className="grid grid-cols-2 gap-3">
                                    {THEME_COLORS.map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => setThemeColor(theme.id as any)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${themeColor === theme.id ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-200' : 'border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full shadow-sm flex-shrink-0 bg-${theme.value}-500 border-2 border-white ring-1 ring-gray-100`}></div>
                                            <span className={`font-medium ${themeColor === theme.id ? 'text-primary-900' : 'text-gray-700'}`}>{theme.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- LOCALIZATION TAB --- */}
                    {activeTab === 'localization' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 max-w-2xl">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
                                <Globe className="w-5 h-5 text-indigo-600" />
                                Language & Region
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.localization.language')}</label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value as any)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="en">English (United States)</option>
                                        <option value="es">Español (Spanish)</option>
                                        <option value="fr">Français (French)</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-2">The default language for the system interface.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.localization.timezone')}</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                        disabled
                                    >
                                        <option>UTC (Coordinated Universal Time)</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-2">Server timezone settings coming soon.</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={saveLocalizationSettings}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm font-medium"
                                >
                                    <Save className="w-4 h-4" />
                                    {t('common.save')}
                                </button>
                            </div>
                        </div>
                    )}


                    {/* --- ADVANCED TAB --- */}
                    {activeTab === 'advanced' && (
                        <div>
                            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-indigo-600" />
                                        Advanced Configuration
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Directly edit database configuration keys. <span className="text-red-500 font-medium">Use with caution.</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <input
                                        type="text"
                                        placeholder="Search keys..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-48"
                                    />
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Key
                                    </button>
                                </div>
                            </div>

                            {Object.keys(groups).length === 0 ? (
                                <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <Settings className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                    <p>{searchQuery ? 'No settings match your search.' : 'No backend settings found.'}</p>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium"
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                </div>
                            ) : (
                                Object.entries(groups).map(([groupName, groupSettings]) => (
                                    <div key={groupName} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">{groupName}</h3>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {groupSettings.map((setting) => (
                                                <div key={setting.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                                        <div className="flex-1 min-w-[250px]">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{setting.key}</span>
                                                                {setting.is_public && (
                                                                    <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Public</span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-500">{setting.description || 'No description'}</p>
                                                        </div>
                                                        <div className="flex-1 flex gap-2 w-full md:w-auto">
                                                            {renderInput(setting)}
                                                            <button
                                                                onClick={() => handleSaveBackendSetting(setting.key)}
                                                                disabled={savingKey === setting.key}
                                                                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center min-w-[40px]"
                                                                title="Save"
                                                            >
                                                                {savingKey === setting.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(setting.key)}
                                                                disabled={savingKey === setting.key}
                                                                className="px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center justify-center min-w-[40px]"
                                                                title="Delete"
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Create Setting Modal (Only for Advanced Tab) */}
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
                                    <label htmlFor="is_public" className="text-sm text-gray-700">Make this setting public</label>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button onClick={() => setShowCreateModal(false)} type="button" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" disabled={isCreating} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDeleteSetting}
                title="Delete Setting"
                message="Are you sure you want to delete this setting? This action cannot be undone."
                itemName={settingToDelete || undefined}
                isDeleting={!!settingToDelete && settings.findIndex(s => s.key === settingToDelete) === -1} // Using optimistic UI or just loader from toast? Actually modal handles loading if we pass isDeleting prop properly. 
            // But here I used toast.loading. Let's stick to modal loading.
            />
        </div>
    );
};
