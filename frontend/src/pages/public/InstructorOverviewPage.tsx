import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Star, BookOpen, Users, ArrowLeft,
    Mail, Globe, Twitter, Linkedin, ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FeedbackModal } from '../../components/feedback/FeedbackModal';
import { feedbackService } from '../../services/feedback.service';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../lib/utils';
import { PageLoader } from '../../components/common/PageLoader';

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
    tags?: string[];
    rating?: number;
    enrollments_count?: number;
}

export const InstructorOverviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [instructor, setInstructor] = useState<Instructor | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        if (id) {
            loadInstructorData();
            loadInstructorReviews();
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

    const loadInstructorReviews = async () => {
        try {
            setLoadingReviews(true);
            const data = await feedbackService.getSpecificInstructorFeedbacks(Number(id));
            setReviews(data);
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    if (!instructor) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-950 min-h-screen">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Instructor not found</h2>
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12 transition-colors duration-300">
            {/* Banner */}
            <div className="h-64 bg-slate-900 relative overflow-hidden">
                {instructor.banner_image ? (
                    <img
                        src={getImageUrl(instructor.banner_image)}
                        alt="Cover"
                        className="w-full h-full object-cover opacity-60"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black" />
                )}
                <div className="absolute top-6 left-6 z-10">
                    <Link
                        to="/instructors"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold border border-white/10"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Instructors
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar - Profile Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                            <div className="p-8 text-center border-b border-gray-50 dark:border-gray-800">
                                <div className="relative inline-block mb-6">
                                    <div className="w-36 h-36 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mx-auto transform transition-transform hover:scale-105 duration-300">
                                        {instructor.photo ? (
                                            <img
                                                src={getImageUrl(instructor.photo)}
                                                alt={instructor.full_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-4xl font-bold">
                                                {instructor.full_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white dark:border-gray-900 shadow-lg"></div>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">{instructor.full_name}</h1>
                                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-6 tracking-wide uppercase">Expert Instructor</p>

                                <div className="flex justify-center gap-3 mb-8">
                                    <Button size="lg" className="rounded-xl px-6 font-bold shadow-lg shadow-indigo-200 dark:shadow-none bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowFeedback(true)}>
                                        <Star className="w-5 h-5 mr-2" />
                                        Rate Instructor
                                    </Button>
                                    <Button size="lg" variant="outline" className="rounded-xl px-6 font-bold border-gray-200 dark:border-gray-700" onClick={() => window.location.href = `mailto:${instructor.email}`}>
                                        <Mail className="w-5 h-5 mr-2" />
                                        Contact
                                    </Button>
                                </div>

                                {/* Social Links */}
                                {instructor.social_links && (
                                    <div className="flex justify-center gap-5 pt-2">
                                        {instructor.social_links.website && (
                                            <a href={instructor.social_links.website} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all hover:scale-110">
                                                <Globe className="w-6 h-6" />
                                            </a>
                                        )}
                                        {instructor.social_links.twitter && (
                                            <a href={instructor.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-blue-400 rounded-xl transition-all hover:scale-110">
                                                <Twitter className="w-6 h-6" />
                                            </a>
                                        )}
                                        {instructor.social_links.linkedin && (
                                            <a href={instructor.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-blue-700 rounded-xl transition-all hover:scale-110">
                                                <Linkedin className="w-6 h-6" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-gray-50/50 dark:bg-gray-800/30">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-4">Biography</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 font-medium">
                                    {instructor.bio || "No biography available."}
                                </p>
                                {instructor.experience && (
                                    <>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-4 mt-8">Professional Experience</h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                            {instructor.experience}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Stats & Courses */}
                    <div className="lg:col-span-8 space-y-8 mt-4 lg:mt-24">
                        {/* Dashboard Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 group hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Students</p>
                                        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.total_students.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 group hover:border-purple-100 dark:hover:border-purple-900 transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Courses</p>
                                        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.total_courses}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 group hover:border-amber-100 dark:hover:border-amber-900 transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Star className="w-8 h-8 fill-current" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Rating</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.average_rating}</p>
                                            <span className="text-[10px] text-gray-400 font-bold">({stats.reviews_count} REVIEWS)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Courses Section */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                            <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Active Courses</h2>
                                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                                    {publishedCourses.length} Courses
                                </span>
                            </div>

                            {publishedCourses.length === 0 ? (
                                <div className="p-16 text-center bg-gray-50 dark:bg-gray-800/20">
                                    <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-sm inline-block mb-4 border border-gray-100 dark:border-gray-800">
                                        <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-700" />
                                    </div>
                                    <h3 className="text-gray-900 dark:text-white font-black text-lg mb-1 uppercase tracking-tight">Focusing on Quality</h3>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">This instructor hasn't published any courses yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {publishedCourses.map((course) => (
                                        <div key={course.id} className="p-8 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all flex flex-col sm:flex-row gap-8 group">
                                            <div className="w-full sm:w-64 aspect-video rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 relative shadow-lg group-hover:scale-[1.02] transition-transform duration-300">
                                                {course.thumbnail ? (
                                                    <img src={getImageUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                                                        <BookOpen className="w-12 h-12" />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3">
                                                    <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black shadow-xl uppercase tracking-widest border border-white/20 dark:border-gray-800">
                                                        {course.level}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase tracking-widest">
                                                        {course.category}
                                                    </span>
                                                    {course.rating && (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{course.rating.toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                                                    {course.title}
                                                </h3>
                                                {course.tags && course.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {course.tags.slice(0, 3).map((tag, idx) => (
                                                            <span key={idx} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md font-bold uppercase">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-6 font-medium leading-relaxed">
                                                    {course.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                                                            {course.price ? `$${course.price}` : 'Free'}
                                                        </span>
                                                        {course.price && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">USD</span>}
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        {course.enrollments_count !== undefined && (
                                                            <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                                                <Users className="w-4 h-4" />
                                                                <span className="text-xs font-bold">{course.enrollments_count}</span>
                                                            </div>
                                                        )}
                                                        <Link to={`/courses/${course.id}`}>
                                                            <Button size="sm" variant="outline" className="rounded-xl border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-5">
                                                                View <ExternalLink className="w-4 h-4 ml-2" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Instructor Reviews Section */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                            <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Instructor Reviews</h2>
                                <Button size="sm" variant="ghost" onClick={loadInstructorReviews} className="text-gray-400 hover:text-indigo-600 transition-colors">
                                    Refresh
                                </Button>
                            </div>

                            <div className="p-8">
                                {loadingReviews ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[...Array(2)].map((_, i) => (
                                            <div key={i} className="h-44 bg-gray-50 dark:bg-gray-800/50 rounded-3xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/10 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                                        <p className="text-gray-500 dark:text-gray-400 font-bold">No reviews yet for this instructor.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="p-6 bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-colors group">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-black text-sm border border-indigo-100 dark:border-indigo-800">
                                                            {review.user_name?.charAt(0) || review.user?.full_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{review.user_name || review.user?.full_name || 'Anonymous'}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <span className="absolute -top-4 -left-2 text-4xl text-indigo-100 dark:text-indigo-900/30 font-serif opacity-50">"</span>
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-medium italic relative z-10 pt-2">
                                                        {review.comments || review.message || "No comment provided."}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FeedbackModal
                isOpen={showFeedback}
                onClose={() => {
                    setShowFeedback(false);
                    loadInstructorReviews();
                }}
                type="instructor"
                targetId={instructor ? Number(id) : undefined}
            />
        </div>
    );
};
