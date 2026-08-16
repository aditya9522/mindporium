import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Mail, Shield, Loader2, Save, Palette, Layout, Moon, Sun, Monitor, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { ImageUpload } from '../../components/common/ImageUpload';
import { useThemeStore, type ThemeColor, type ThemeMode } from '../../store/theme.store';
import { getImageUrl } from '../../lib/utils';

const profileSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone_number: z.string().optional(),
    bio: z.string().optional(),
    experience: z.string().optional(),
    timezone: z.string().optional(),
    photo: z.string().optional(),
    banner_image: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const DISPLAY_MODES = [
    { id: 'light', icon: Sun, label: 'Light', description: 'Bright interface' },
    { id: 'dark', icon: Moon, label: 'Dark', description: 'Low-light interface' },
    { id: 'system', icon: Monitor, label: 'System', description: 'Follow device' },
] as const;

const THEME_COLORS = [
    { id: 'default', name: 'Indigo', className: 'bg-indigo-500', ringClassName: 'ring-indigo-200 dark:ring-indigo-900' },
    { id: 'ocean', name: 'Ocean', className: 'bg-blue-500', ringClassName: 'ring-blue-200 dark:ring-blue-900' },
    { id: 'midnight', name: 'Midnight', className: 'bg-purple-500', ringClassName: 'ring-purple-200 dark:ring-purple-900' },
    { id: 'forest', name: 'Forest', className: 'bg-emerald-500', ringClassName: 'ring-emerald-200 dark:ring-emerald-900' },
    { id: 'sunset', name: 'Sunset', className: 'bg-orange-500', ringClassName: 'ring-orange-200 dark:ring-orange-900' },
] as const;

export const ProfilePage = () => {
    const { user, setUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'appearance'>('profile');

    const {
        themeColor, setThemeColor,
        mode, setMode,
        resetAppearance,
    } = useThemeStore();

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: user?.full_name || '',
            email: user?.email || '',
            phone_number: user?.phone_number || '',
            bio: user?.bio || '',
            experience: user?.experience || '',
            timezone: user?.timezone || 'UTC',
            photo: user?.photo || '',
            banner_image: user?.banner_image || '',
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                full_name: user.full_name,
                email: user.email,
                phone_number: user.phone_number || '',
                bio: user.bio || '',
                experience: user.experience || '',
                timezone: user.timezone || 'UTC',
                photo: user.photo || '',
                banner_image: user.banner_image || '',
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);
        try {
            const response = await api.put('/users/me', data);
            setUser(response.data);
            toast.success('Profile updated successfully');
        } catch (error: unknown) {
            const message = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
                : undefined;
            toast.error(message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleBadge = (role?: string) => {
        switch (role) {
            case 'admin':
                return <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold flex items-center gap-1 border border-purple-200 dark:border-purple-800"><Shield className="w-4 h-4" /> Admin</span>;
            case 'instructor':
                return <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold flex items-center gap-1 border border-blue-200 dark:border-blue-800"><User className="w-4 h-4" /> Instructor</span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full text-sm font-semibold flex items-center gap-1 border border-gray-200 dark:border-gray-700"><User className="w-4 h-4" /> Student</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Profile Settings</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Manage your personal information and account preferences</p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white dark:bg-gray-900 p-1 rounded-xl shadow-sm border border-primary-100/70 dark:border-primary-900/30 mb-8 w-fit mx-auto md:mx-0 transition-all">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'profile'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-300'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        Profile Info
                    </button>
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'appearance'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-300'
                            }`}
                    >
                        <Palette className="w-4 h-4" />
                        Appearance
                    </button>
                </div>

                {activeTab === 'profile' ? (
                    <div className="rounded-3xl border border-primary-100/70 dark:border-primary-900/30 bg-primary-50/40 dark:bg-primary-950/10 p-4 sm:p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-primary-100/80 dark:border-primary-900/30 p-8 sticky top-8 transition-colors duration-300">
                                <div className="text-center">
                                    <div className="mb-6 flex justify-center">
                                        <div className="relative group">
                                            <div className="absolute -inset-0.5 bg-primary-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                                            <div className="relative bg-white dark:bg-gray-800 rounded-full p-1 transition-colors">
                                                <ImageUpload
                                                    value={watch('photo')}
                                                    onChange={(url) => setValue('photo', url, { shouldDirty: true })}
                                                    label=""
                                                    variant="avatar"
                                                    entityType="users"
                                                    entityId={user?.id}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <h2 className="break-words text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{user?.full_name}</h2>
                                    <div className="inline-flex max-w-full items-center justify-center gap-2 mb-4 text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-800/50 py-1 px-3 rounded-full mx-auto border border-gray-100 dark:border-gray-700">
                                        <Mail className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate text-sm">{user?.email}</span>
                                    </div>
                                    <div className="mt-4 flex justify-center">
                                        {getRoleBadge(user?.role)}
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 font-medium">Account Status</span>
                                            <span className={`font-bold px-2 py-0.5 rounded border ${user?.is_active ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'}`}>
                                                {user?.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 font-medium">Member Since</span>
                                            <span className="font-bold text-gray-900 dark:text-gray-100">
                                                {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-primary-100/80 dark:border-primary-900/30 p-8 transition-colors duration-300">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                                    <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    Personal Information
                                </h3>

                                <div className="mb-6">
                                    <ImageUpload
                                        value={watch('banner_image')}
                                        onChange={(url) => setValue('banner_image', url, { shouldDirty: true })}
                                        label="Banner Image"
                                        variant="banner"
                                        placeholder="Change Banner"
                                        entityType="users"
                                        entityId={user?.id}
                                    />
                                </div>

                                <div className="mb-6 overflow-hidden rounded-xl border border-primary-100/80 dark:border-primary-900/30 bg-primary-50/30 dark:bg-primary-950/10">
                                    <div
                                        className="h-28 bg-gray-100 dark:bg-gray-800 bg-cover bg-center"
                                        style={watch('banner_image') ? { backgroundImage: `url(${getImageUrl(watch('banner_image'))})` } : undefined}
                                    />
                                    <div className="px-5 pb-5">
                                        <div className="-mt-8 flex items-start gap-4">
                                            <div className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-900 bg-primary-100 dark:bg-primary-900/40 overflow-hidden flex items-center justify-center shrink-0">
                                                {watch('photo') ? (
                                                    <img src={getImageUrl(watch('photo'))} alt="Profile preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0 pt-10">
                                                <p className="text-xs font-bold uppercase tracking-wide text-primary-600 dark:text-primary-400">Profile Preview</p>
                                                <h4 className="break-words text-lg font-bold text-gray-900 dark:text-gray-100">{watch('full_name') || user?.full_name}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{watch('email') || user?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                        <Input
                                            {...register('full_name')}
                                            placeholder="John Doe"
                                            className={errors.full_name ? "border-red-500 focus-visible:ring-red-500" : ""}
                                        />
                                        {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                        <Input
                                            {...register('email')}
                                            type="email"
                                            placeholder="you@example.com"
                                            className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                                        />
                                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                        <Input
                                            {...register('phone_number')}
                                            type="tel"
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>

                                    {(user?.role === 'instructor' || user?.role === 'admin') && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                                                <textarea
                                                    {...register('bio')}
                                                    rows={4}
                                                    placeholder="Tell us about yourself..."
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience</label>
                                                <textarea
                                                    {...register('experience')}
                                                    rows={3}
                                                    placeholder="Your professional experience..."
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
                                        <select
                                            {...register('timezone')}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                        >
                                            <option value="UTC">UTC</option>
                                            <option value="America/New_York">Eastern Time</option>
                                            <option value="America/Chicago">Central Time</option>
                                            <option value="America/Denver">Mountain Time</option>
                                            <option value="America/Los_Angeles">Pacific Time</option>
                                            <option value="Europe/London">London</option>
                                            <option value="Asia/Kolkata">India</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                        <Input
                                            value={user?.role || 'student'}
                                            disabled
                                            className="bg-gray-50 dark:bg-gray-800 capitalize"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Contact an administrator to change your role</p>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => reset()}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex items-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    </div>
                ) : (
                    /* Appearance Tab Content */
                    <div className="max-w-6xl mx-auto md:mx-0 rounded-3xl border border-primary-100/70 dark:border-primary-900/30 bg-primary-50/40 dark:bg-primary-950/10 p-4 sm:p-5">
                        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] gap-8">
                            <div className="space-y-8">
                            {/* Theme Mode */}
                                <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                                    <div className="flex items-start justify-between gap-4 pb-5 border-b border-gray-100 dark:border-gray-800">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                <Layout className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                Display Mode
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose how Mindporium should look on this device.</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={resetAppearance}>
                                            Reset
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                                        {DISPLAY_MODES.map(option => {
                                            const Icon = option.icon;
                                            const isSelected = mode === option.id;

                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => setMode(option.id as ThemeMode)}
                                                    className={`text-left p-4 rounded-xl border transition-all ${isSelected
                                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-200 dark:ring-primary-800'
                                                        : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/70'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between gap-3 mb-4">
                                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                                        {isSelected && <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                                                    </div>
                                                    <span className={`block text-sm font-semibold ${isSelected ? 'text-primary-900 dark:text-primary-200' : 'text-gray-900 dark:text-gray-100'}`}>{option.label}</span>
                                                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">{option.description}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>

                            {/* Theme Color */}
                                <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                                    <div className="flex items-start justify-between gap-4 pb-5 border-b border-gray-100 dark:border-gray-800">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                <Palette className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                Accent Color
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set the primary color used across buttons, links, and selected states.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                                        {THEME_COLORS.map(theme => {
                                            const isSelected = themeColor === theme.id;

                                            return (
                                                <button
                                                    key={theme.id}
                                                    type="button"
                                                    onClick={() => setThemeColor(theme.id as ThemeColor)}
                                                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${isSelected
                                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-200 dark:ring-primary-800'
                                                        : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/70'
                                                        }`}
                                                >
                                                    <span className={`w-8 h-8 rounded-full ${theme.className} ring-4 ${isSelected ? theme.ringClassName : 'ring-gray-100 dark:ring-gray-800'} shadow-sm shrink-0`} />
                                                    <span className="min-w-0">
                                                        <span className={`block text-sm font-semibold ${isSelected ? 'text-primary-900 dark:text-primary-200' : 'text-gray-900 dark:text-gray-100'}`}>{theme.name}</span>
                                                        <span className="block text-xs text-gray-500 dark:text-gray-400">Primary theme</span>
                                                    </span>
                                                    {isSelected && <Check className="w-4 h-4 text-primary-600 dark:text-primary-400 ml-auto shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            </div>

                            <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                                <div className="pb-5 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Preview</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">A quick view of your selected appearance.</p>
                                </div>
                                <div className="mt-5 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Workspace</span>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-md bg-primary-600 text-white text-xs font-semibold">Active</span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="h-3 w-1/2 rounded-full bg-gray-200 dark:bg-gray-800" />
                                        <div className="h-20 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
                                            <div className="h-2.5 w-3/4 rounded-full bg-gray-200 dark:bg-gray-800" />
                                            <div className="h-2.5 w-1/2 rounded-full bg-primary-200 dark:bg-primary-900 mt-3" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800" />
                                            <div className="h-10 rounded-lg bg-primary-600" />
                                            <div className="h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800" />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
