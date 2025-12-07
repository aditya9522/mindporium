import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { instructorService } from '../../services/instructor.service';
import { Loader2, Mail, Phone, Globe, Linkedin, Twitter, Github, Award, BookOpen, Users, Star, Briefcase, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage = () => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadProfileStats();
    }, []);

    const loadProfileStats = async () => {
        try {
            // Reusing getPerformance which returns similar stats structure
            const performance = await instructorService.getPerformance();
            setStats(performance);
        } catch (error) {
            console.error('Failed to load stats:', error);
            // Don't block UI if stats fail
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!user) return null;

    // Use user data from store, augment with anything else if needed
    const instructor = user;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Banner Section */}
            <div className="relative h-64 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
                {instructor.banner_image ? (
                    <img
                        src={instructor.banner_image}
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90"></div>
                )}
                <div className="absolute bottom-4 right-4">
                    <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-all font-medium"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="relative -mt-24 mb-8">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Profile Picture */}
                            <div className="relative">
                                {instructor.photo ? (
                                    <img
                                        src={instructor.photo}
                                        alt={instructor.full_name}
                                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">
                                        {instructor.full_name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{instructor.full_name}</h1>
                                        <p className="text-lg text-gray-600 mb-3">Instructor</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-4 h-4" />
                                                {instructor.email}
                                            </span>
                                            {instructor.phone_number && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-4 h-4" />
                                                    {instructor.phone_number}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Social Links */}
                                {instructor.social_links && Object.keys(instructor.social_links).length > 0 && (
                                    <div className="flex items-center gap-3">
                                        {instructor.social_links.website && (
                                            <a href={instructor.social_links.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                                <Globe className="w-5 h-5 text-gray-600" />
                                            </a>
                                        )}
                                        {instructor.social_links.linkedin && (
                                            <a href={instructor.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                                <Linkedin className="w-5 h-5 text-gray-600" />
                                            </a>
                                        )}
                                        {instructor.social_links.twitter && (
                                            <a href={instructor.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                                <Twitter className="w-5 h-5 text-gray-600" />
                                            </a>
                                        )}
                                        {instructor.social_links.github && (
                                            <a href={instructor.social_links.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                                <Github className="w-5 h-5 text-gray-600" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 rounded-lg">
                                <BookOpen className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats?.total_courses || 0}</p>
                                <p className="text-sm text-gray-600">Courses</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats?.total_students || 0}</p>
                                <p className="text-sm text-gray-600">Students</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 rounded-lg">
                                <Star className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats?.average_rating?.toFixed(1) || '0.0'}</p>
                                <p className="text-sm text-gray-600">Rating</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats?.total_revenue || '$0'}</p>
                                <p className="text-sm text-gray-600">Revenue</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Left Column - About & Experience */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About Section */}
                        {instructor.bio ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-indigo-600" />
                                    About
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{instructor.bio}</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                                <p className="text-gray-500 mb-4">No bio added yet.</p>
                                <Link to="/settings" className="text-indigo-600 hover:text-indigo-700 font-medium">Add Bio</Link>
                            </div>
                        )}

                        {/* Experience Section */}
                        {instructor.experience && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-purple-600" />
                                    Professional Experience
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{instructor.experience}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
