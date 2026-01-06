import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Mail, Shield, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { ImageUpload } from '../../components/common/ImageUpload';

const profileSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone_number: z.string().optional(),
    bio: z.string().optional(),
    experience: z.string().optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    photo: z.string().optional(),
    banner_image: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfilePage = () => {
    const { user, setUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: user?.full_name || '',
            email: user?.email || '',
            phone_number: user?.phone_number || '',
            bio: user?.bio || '',
            experience: user?.experience || '',
            timezone: user?.timezone || 'UTC',
            language: user?.language || 'en',
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
                language: user.language || 'en',
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
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };



    const getRoleBadge = (role?: string) => {
        switch (role) {
            case 'admin':
                return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold flex items-center gap-1"><Shield className="w-4 h-4" /> Admin</span>;
            case 'instructor':
                return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-1"><User className="w-4 h-4" /> Instructor</span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold flex items-center gap-1"><User className="w-4 h-4" /> Student</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Profile Settings</h1>
                    <p className="text-lg text-gray-500 font-medium">Manage your personal information and account preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sticky top-8">
                            <div className="text-center">
                                <div className="mb-6 flex justify-center">
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                                        <div className="relative bg-white rounded-full p-1">
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
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.full_name}</h2>
                                <div className="flex items-center justify-center gap-2 mb-4 text-gray-500 font-medium bg-gray-50 py-1 px-3 rounded-full inline-flex mx-auto border border-gray-100">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span className="text-sm">{user?.email}</span>
                                </div>
                                <div className="mt-4 flex justify-center">
                                    {getRoleBadge(user?.role)}
                                </div>
                                <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Account Status</span>
                                        <span className={`font-bold px-2 py-0.5 rounded ${user?.is_active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                            {user?.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Member Since</span>
                                        <span className="font-bold text-gray-900">
                                            {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    {/* Edit Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                                <User className="w-5 h-5 text-indigo-600" />
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

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                                    <Input
                                        {...register('full_name')}
                                        placeholder="John Doe"
                                        className={errors.full_name ? "border-red-500 focus-visible:ring-red-500" : ""}
                                    />
                                    {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                                    <Input
                                        {...register('email')}
                                        type="email"
                                        placeholder="you@example.com"
                                        className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                                    />
                                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                    <Input
                                        {...register('phone_number')}
                                        type="tel"
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>

                                {(user?.role === 'instructor' || user?.role === 'admin') && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Bio</label>
                                            <textarea
                                                {...register('bio')}
                                                rows={4}
                                                placeholder="Tell us about yourself..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Experience</label>
                                            <textarea
                                                {...register('experience')}
                                                rows={3}
                                                placeholder="Your professional experience..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Timezone</label>
                                        <select
                                            {...register('timezone')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        <label className="text-sm font-medium text-gray-700">Language</label>
                                        <select
                                            {...register('language')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                            <option value="hi">Hindi</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Role</label>
                                    <Input
                                        value={user?.role || 'student'}
                                        disabled
                                        className="bg-gray-50 capitalize"
                                    />
                                    <p className="text-xs text-gray-500">Contact an administrator to change your role</p>
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
        </div>
    );
};
