import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { instructorService } from '../../services/instructor.service';
import { Mail, Phone, Globe, Linkedin, Twitter, Github, Award, BookOpen, Users, Star, Briefcase, Edit, Calendar, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../lib/utils';
import { PageLoader } from '../../components/common/PageLoader';
import { formatNumber } from '../../lib/format';

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
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
                <div className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
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
                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-10 border border-white/20 dark:border-gray-800 ring-1 ring-black/5 dark:ring-white/10 transition-colors duration-300">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
                            {/* Profile Picture */}
                            <div className="relative -mt-20 md:-mt-0">
                                {instructor.photo ? (
                                    <div className="relative">
                                        <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-40"></div>
                                        <img
                                            src={getImageUrl(instructor.photo)}
                                            alt={instructor.full_name}
                                            className="relative w-40 h-40 rounded-full border-[6px] border-white dark:border-gray-800 shadow-2xl object-cover transition-colors duration-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-40"></div>
                                        <div className="relative w-40 h-40 rounded-full border-[6px] border-white dark:border-gray-800 shadow-2xl bg-linear-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-6xl font-extrabold tracking-tighter transition-colors duration-300">
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
                                            <h1 className="break-words text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">{instructor.full_name}</h1>
                                            {instructor.is_verified && (
                                                <div className="bg-blue-50 dark:bg-blue-900/30 p-1 rounded-full"><CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-blue-500/10 dark:fill-blue-400/10" /></div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 transition-colors">
                                                <Briefcase className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                                Instructor
                                            </span>
                                            {instructor.created_at && (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 transition-colors">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                                    Joined {format(new Date(instructor.created_at), 'MMM yyyy')}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 transition-colors">
                                                <Clock className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                                {instructor.timezone || 'UTC'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        <span className="flex items-center gap-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                            <Mail className="w-4 h-4" />
                                            <span className="break-all">{instructor.email}</span>
                                        </span>
                                        {instructor.phone_number && (
                                            <span className="flex items-center gap-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                                <Phone className="w-4 h-4" />
                                                {instructor.phone_number}
                                            </span>
                                        )}
                                    </div>

                                    {/* Social Links */}
                                    {instructor.social_links && Object.keys(instructor.social_links).length > 0 && (
                                        <div className="flex items-center gap-3 ml-auto">
                                            {instructor.social_links.website && (
                                                <a href={instructor.social_links.website} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:-translate-y-0.5 border border-gray-100 dark:border-gray-700">
                                                    <Globe className="w-5 h-5" />
                                                </a>
                                            )}
                                            {instructor.social_links.linkedin && (
                                                <a href={instructor.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 transition-all hover:-translate-y-0.5 border border-gray-100 dark:border-gray-700">
                                                    <Linkedin className="w-5 h-5" />
                                                </a>
                                            )}
                                            {instructor.social_links.twitter && (
                                                <a href={instructor.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-all hover:-translate-y-0.5 border border-gray-100 dark:border-gray-700">
                                                    <Twitter className="w-5 h-5" />
                                                </a>
                                            )}
                                            {instructor.social_links.github && (
                                                <a href={instructor.social_links.github} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all hover:-translate-y-0.5 border border-gray-100 dark:border-gray-700">
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-primary-50 dark:bg-primary-900/30 rounded-2xl text-primary-600 dark:text-primary-400 shadow-sm">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{stats?.total_courses || 0}</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Courses</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 shadow-sm">
                                <Users className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{stats?.total_students || 0}</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Students</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400 shadow-sm">
                                <Star className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{formatNumber(stats?.average_rating)}</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rating</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-purple-50 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400 shadow-sm">
                                <Award className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{stats?.total_revenue || '$0'}</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Revenue</p>
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
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    About
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{instructor.bio}</p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 text-center transition-colors duration-300">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">No bio added yet.</p>
                                <Link to="/settings" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">Add Bio</Link>
                            </div>
                        )}

                        {/* Experience Section */}
                        {instructor.experience && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    Professional Experience
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{instructor.experience}</p>
                            </div>
                        )}

                        {/* Courses Section */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                                Courses Taught
                            </h2>
                            {stats?.course_stats && stats.course_stats.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.course_stats.map((course: any, index: number) => (
                                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700/50">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{course.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {course.enrollments} students
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No courses available</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Quick Info */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Info</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400">Verification</span>
                                    <span className={`font-semibold ${instructor.is_verified ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                        {instructor.is_verified ? 'Verified' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400">Role</span>
                                    <span className="font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider text-xs">
                                        {instructor.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Performance */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Performance</h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">Rating</span>
                                        <span className="font-bold text-gray-900 dark:text-gray-100">{formatNumber(stats?.average_rating)}/5.0</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-amber-400 h-full rounded-full"
                                            style={{ width: `${(stats?.average_rating || 0) * 20}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">Student Satisfaction</span>
                                        <span className="font-bold text-gray-900 dark:text-gray-100">95%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-green-500 h-full rounded-full" style={{ width: '95%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
