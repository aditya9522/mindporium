import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { instructorService } from '../../services/instructor.service';
import { Mail, Phone, Globe, Linkedin, Twitter, Github, Award, BookOpen, Users, Star, Briefcase, Edit, Calendar, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../lib/utils';
import { PageLoader } from '../../components/common/PageLoader';

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
        return <PageLoader />;
    }

    if (!user) return null;

    // Use user data from store, augment with anything else if needed
    const instructor = user;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Banner Section */}
            {/* Banner Section */}
            <div className="relative h-80 bg-slate-900 group overflow-hidden">
                {instructor.banner_image ? (
                    <div className="absolute inset-0">
                        <img
                            src={getImageUrl(instructor.banner_image)}
                            alt="Banner"
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black opacity-90"></div>
                )}
                <div className="absolute bottom-6 right-6 z-10">
                    <Link
                        to="/settings"
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all font-semibold border border-white/20 hover:border-white/40 shadow-lg"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="relative -mt-32 mb-10 z-20">
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-10 border border-white/20 ring-1 ring-black/5">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
                            {/* Profile Picture */}
                            <div className="relative -mt-20 md:-mt-0">
                                {instructor.photo ? (
                                    <div className="relative">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-40"></div>
                                        <img
                                            src={getImageUrl(instructor.photo)}
                                            alt={instructor.full_name}
                                            className="relative w-40 h-40 rounded-full border-[6px] border-white shadow-2xl object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-40"></div>
                                        <div className="relative w-40 h-40 rounded-full border-[6px] border-white shadow-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-6xl font-extrabold tracking-tighter">
                                            {instructor.full_name?.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 text-center md:text-left w-full">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
                                    <div>
                                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{instructor.full_name}</h1>
                                            {instructor.is_verified && (
                                                <div className="bg-blue-50 p-1 rounded-full"><CheckCircle className="w-6 h-6 text-blue-500 fill-blue-500/10" /></div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-gray-500">
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full border border-gray-200">
                                                <Briefcase className="w-3.5 h-3.5 text-gray-600" />
                                                Instructor
                                            </span>
                                            {instructor.created_at && (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full border border-gray-200">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-600" />
                                                    Joined {format(new Date(instructor.created_at), 'MMM yyyy')}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full border border-gray-200">
                                                <Clock className="w-3.5 h-3.5 text-gray-600" />
                                                {instructor.timezone || 'UTC'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-6 mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 font-medium">
                                        <span className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                                            <Mail className="w-4 h-4" />
                                            {instructor.email}
                                        </span>
                                        {instructor.phone_number && (
                                            <span className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                                                <Phone className="w-4 h-4" />
                                                {instructor.phone_number}
                                            </span>
                                        )}
                                    </div>

                                    {/* Social Links */}
                                    {instructor.social_links && Object.keys(instructor.social_links).length > 0 && (
                                        <div className="flex items-center gap-3 ml-auto">
                                            {instructor.social_links.website && (
                                                <a href={instructor.social_links.website} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-indigo-600 transition-all hover:-translate-y-0.5 border border-gray-100">
                                                    <Globe className="w-5 h-5" />
                                                </a>
                                            )}
                                            {instructor.social_links.linkedin && (
                                                <a href={instructor.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-blue-700 transition-all hover:-translate-y-0.5 border border-gray-100">
                                                    <Linkedin className="w-5 h-5" />
                                                </a>
                                            )}
                                            {instructor.social_links.twitter && (
                                                <a href={instructor.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-blue-400 transition-all hover:-translate-y-0.5 border border-gray-100">
                                                    <Twitter className="w-5 h-5" />
                                                </a>
                                            )}
                                            {instructor.social_links.github && (
                                                <a href={instructor.social_links.github} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all hover:-translate-y-0.5 border border-gray-100">
                                                    <Github className="w-5 h-5" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 tracking-tight">{stats?.total_courses || 0}</p>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Courses</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-blue-50 rounded-2xl text-blue-600 shadow-sm">
                                <Users className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 tracking-tight">{stats?.total_students || 0}</p>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Students</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-amber-50 rounded-2xl text-amber-600 shadow-sm">
                                <Star className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 tracking-tight">{stats?.average_rating?.toFixed(1) || '0.0'}</p>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Rating</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-purple-50 rounded-2xl text-purple-600 shadow-sm">
                                <Award className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 tracking-tight">{stats?.total_revenue || '$0'}</p>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Revenue</p>
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
