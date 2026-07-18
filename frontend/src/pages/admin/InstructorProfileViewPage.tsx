import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { ArrowLeft, Mail, Phone, Globe, Linkedin, Twitter, Github, Calendar, Award, BookOpen, Users, Star, Briefcase } from 'lucide-react';
import { PageLoader } from '../../components/common/PageLoader';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../lib/utils';

export const InstructorProfileViewPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [instructor, setInstructor] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        if (id) {
            loadInstructorProfile();
        }
    }, [id]);

    const loadInstructorProfile = async () => {
        try {
            const users = await adminService.getInstructors();
            const currentInstructor = users.find((u: any) => u.id === parseInt(id!));
            setInstructor(currentInstructor);

            // Fetch basic stats
            const performance = await adminService.getInstructorPerformance(parseInt(id!));
            setStats(performance);
        } catch (error) {
            console.error('Failed to load instructor profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    if (!instructor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Instructor not found</h2>
                <button
                    onClick={() => navigate('/admin/instructors')}
                    className="mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                    Back to Instructors
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            {/* Banner Section */}
            <div className="relative h-80 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500">
                {instructor.banner_image ? (
                    <img
                        src={getImageUrl(instructor.banner_image)}
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90"></div>
                )}
                <button
                    onClick={() => navigate('/admin/instructors')}
                    className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="relative -mt-32 mb-8">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-none p-8 dark:border dark:border-gray-800">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Profile Picture */}
                            <div className="relative">
                                {instructor.photo ? (
                                    <img
                                        src={getImageUrl(instructor.photo)}
                                        alt={instructor.full_name}
                                        className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 shadow-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 shadow-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">
                                        {instructor.full_name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white dark:border-gray-900"></div>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{instructor.full_name}</h1>
                                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">Professional Instructor</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Joined {instructor.created_at ? formatDistanceToNow(new Date(instructor.created_at), { addSuffix: true }) : 'recently'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${instructor.is_active
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {instructor.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {/* Social Links */}
                                {instructor.social_links && Object.keys(instructor.social_links).length > 0 && (
                                    <div className="flex items-center gap-3">
                                        {instructor.social_links.website && (
                                            <a href={instructor.social_links.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            </a>
                                        )}
                                        {instructor.social_links.linkedin && (
                                            <a href={instructor.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                                <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            </a>
                                        )}
                                        {instructor.social_links.twitter && (
                                            <a href={instructor.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                                <Twitter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            </a>
                                        )}
                                        {instructor.social_links.github && (
                                            <a href={instructor.social_links.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                                <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:shadow-indigo-900/10 transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_courses || 0}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Courses</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:shadow-indigo-900/10 transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_students || 0}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:shadow-indigo-900/10 transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.average_rating?.toFixed(1) || '0.0'}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:shadow-indigo-900/10 transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_classes || 0}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Classes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Left Column - About & Experience */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About Section */}
                        {instructor.bio && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    About
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{instructor.bio}</p>
                            </div>
                        )}

                        {/* Experience Section */}
                        {instructor.experience && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    Professional Experience
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{instructor.experience}</p>
                            </div>
                        )}

                        {/* Courses Section */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                                Courses Taught
                            </h2>
                            {stats?.course_stats && stats.course_stats.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.course_stats.map((course: any, index: number) => (
                                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{course.title}</h3>
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

                    {/* Right Column - Additional Info */}
                    <div className="space-y-6">
                        {/* Quick Info */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Info</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                                    <span className={`font-semibold ${instructor.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {instructor.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400">Verified</span>
                                    <span className={`font-semibold ${instructor.is_verified ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                        {instructor.is_verified ? 'Yes' : 'Pending'}
                                    </span>
                                </div>
                                {instructor.timezone && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-gray-600 dark:text-gray-400">Timezone</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{instructor.timezone}</span>
                                    </div>
                                )}
                                {instructor.language && (
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-gray-600 dark:text-gray-400">Language</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{instructor.language}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Actions</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate(`/admin/instructors/${id}/analytics`)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                                >
                                    <Award className="w-5 h-5" />
                                    View Analytics
                                </button>
                                <button
                                    onClick={() => navigate(`/admin/instructors/${id}`)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <BookOpen className="w-5 h-5" />
                                    View Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
