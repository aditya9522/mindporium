import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Star, BookOpen, Users, ArrowLeft, Loader2,
    Mail, Globe, Twitter, Linkedin, ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { FeedbackModal } from '../components/feedback/FeedbackModal';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { getImageUrl } from '../lib/utils';

interface InstructorStats {
    total_courses: number;
    total_students: number;
    average_rating: number;
    reviews_count: number;
}

interface Instructor {
    id: number;
    full_name: string;
    email: string;
    photo?: string;
    banner_image?: string;
    bio?: string;
    experience?: string;
    social_links?: {
        website?: string;
        twitter?: string;
        linkedin?: string;
        youtube?: string;
    };
    stats?: InstructorStats;
}

interface Course {
    id: number;
    title: string;
    description: string;
    thumbnail?: string;
    level: string;
    category: string;
    price?: number;
    is_published?: boolean;
}

export const InstructorOverviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [instructor, setInstructor] = useState<Instructor | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        if (id) {
            loadInstructorData();
        }
    }, [id]);

    const loadInstructorData = async () => {
        try {
            const instructorResponse = await api.get(`/users/instructors/${id}`);
            setInstructor(instructorResponse.data);

            const coursesResponse = await api.get(`/courses?instructor_id=${id}`);
            setCourses(coursesResponse.data);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20 bg-gray-50 min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!instructor) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 min-h-screen">
                <h2 className="text-xl font-bold text-gray-900">Instructor not found</h2>
                <Button variant="ghost" className="mt-4" onClick={() => navigate('/instructors')}>
                    Back to Instructors
                </Button>
            </div>
        );
    }

    const publishedCourses = courses.filter(c => c.is_published !== false);
    const stats = instructor.stats || {
        total_courses: 0,
        total_students: 0,
        average_rating: 0,
        reviews_count: 0
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Banner */}
            <div className="h-48 bg-gray-900 relative overflow-hidden">
                {instructor.banner_image ? (
                    <img
                        src={getImageUrl(instructor.banner_image)}
                        alt="Cover"
                        className="w-full h-full object-cover opacity-60"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900" />
                )}
                <div className="absolute top-6 left-6 z-10">
                    <Link
                        to="/instructors"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar - Profile Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 text-center border-b border-gray-100">
                                <div className="relative inline-block mb-4">
                                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 mx-auto">
                                        {instructor.photo ? (
                                            <img
                                                src={getImageUrl(instructor.photo)}
                                                alt={instructor.full_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 text-3xl font-bold">
                                                {instructor.full_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{instructor.full_name}</h1>
                                <p className="text-indigo-600 font-medium text-sm mb-4">Instructor</p>

                                <div className="flex justify-center gap-3 mb-6">
                                    <Button size="sm" onClick={() => setShowFeedback(true)}>
                                        <Star className="w-4 h-4 mr-2" />
                                        Rate
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => window.location.href = `mailto:${instructor.email}`}>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Contact
                                    </Button>
                                </div>

                                {/* Social Links */}
                                {instructor.social_links && (
                                    <div className="flex justify-center gap-3 pt-2">
                                        {instructor.social_links.website && (
                                            <a href={instructor.social_links.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600 transition-colors">
                                                <Globe className="w-5 h-5" />
                                            </a>
                                        )}
                                        {instructor.social_links.twitter && (
                                            <a href={instructor.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                                                <Twitter className="w-5 h-5" />
                                            </a>
                                        )}
                                        {instructor.social_links.linkedin && (
                                            <a href={instructor.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors">
                                                <Linkedin className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-gray-50/50">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">About</h3>
                                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                    {instructor.bio || "No biography available."}
                                </p>
                                {instructor.experience && (
                                    <>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2 mt-4">Experience</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {instructor.experience}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Stats & Courses */}
                    <div className="lg:col-span-8 space-y-8 mt-4 lg:mt-20">
                        {/* Dashboard Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Total Students</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total_students.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Courses</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total_courses}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                                        <Star className="w-6 h-6 fill-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Rating</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-bold text-gray-900">{stats.average_rating}</p>
                                            <span className="text-xs text-gray-500">({stats.reviews_count} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Courses Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">Active Courses</h2>
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                                    {publishedCourses.length} Courses
                                </span>
                            </div>

                            {publishedCourses.length === 0 ? (
                                <div className="p-12 text-center">
                                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-gray-900 font-medium mb-1">No courses published</h3>
                                    <p className="text-gray-500 text-sm">This instructor hasn't published any courses yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {publishedCourses.map((course) => (
                                        <div key={course.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-6 group">
                                            <div className="w-full sm:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                                                {course.thumbnail ? (
                                                    <img src={getImageUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <BookOpen className="w-8 h-8" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2">
                                                    <span className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold shadow-sm uppercase tracking-wide">
                                                        {course.level}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                        {course.category}
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-bold text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                                                    {course.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                                    {course.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-bold text-gray-900">
                                                        ${course.price || 'Free'}
                                                    </span>
                                                    <Link to={`/courses/${course.id}`}>
                                                        <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-0 h-auto font-medium">
                                                            View Course <ExternalLink className="w-3 h-3 ml-1" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <FeedbackModal
                isOpen={showFeedback}
                onClose={() => setShowFeedback(false)}
                type="instructor"
                targetId={instructor ? Number(id) : undefined}
            />
        </div>
    );
};
