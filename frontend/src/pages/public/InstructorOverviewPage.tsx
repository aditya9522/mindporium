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
            <div className="h-48 bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                {instructor.banner_image && (
                    <img
                        src={getImageUrl(instructor.banner_image)}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute top-6 left-6 z-10">
                    <Link
                        to="/instructors"
                        className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 dark:hover:bg-black/10"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Instructors
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                            <div className="p-6 text-center">
                                <div className="relative inline-block mb-4">
                                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 shadow-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mx-auto">
                                        {instructor.photo ? (
                                            <img
                                                src={getImageUrl(instructor.photo)}
                                                alt={instructor.full_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-3xl font-bold">
                                                {instructor.full_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{instructor.full_name}</h1>
                                <p className="text-primary-600 dark:text-primary-400 font-medium text-sm mb-6">Instructor</p>

                                <div className="flex flex-col gap-2 mb-6">
                                    <Button size="sm" className="w-full" onClick={() => setShowFeedback(true)}>
                                        <Star className="w-4 h-4 mr-2" />
                                        Rate Instructor
                                    </Button>
                                    <Button size="sm" variant="outline" className="w-full" onClick={() => window.location.href = `mailto:${instructor.email}`}>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Contact
                                    </Button>
                                </div>

                                {/* Social Links */}
                                {instructor.social_links && (
                                    <div className="flex justify-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        {instructor.social_links.website && (
                                            <a href={instructor.social_links.website} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                                <Globe className="w-5 h-5" />
                                            </a>
                                        )}
                                        {instructor.social_links.twitter && (
                                            <a href={instructor.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                                                <Twitter className="w-5 h-5" />
                                            </a>
                                        )}
                                        {instructor.social_links.linkedin && (
                                            <a href={instructor.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                <Linkedin className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">About</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {instructor.bio || "No biography available."}
                                </p>
                                {instructor.experience && (
                                    <>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">Experience</h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            {instructor.experience}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Stats & Courses */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Students</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_students.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Courses</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_courses}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                        <Star className="w-6 h-6 fill-current" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Rating</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.average_rating.toFixed(1)}</p>
                                            <span className="text-xs text-gray-400">({stats.reviews_count})</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Courses Section */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Courses</h2>
                                <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-semibold">
                                    {publishedCourses.length} {publishedCourses.length === 1 ? 'Course' : 'Courses'}
                                </span>
                            </div>

                            {publishedCourses.length === 0 ? (
                                <div className="p-12 text-center">
                                    <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                    <h3 className="text-gray-900 dark:text-white font-semibold mb-1">No courses yet</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">This instructor hasn't published any courses.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {publishedCourses.map((course) => (
                                        <div key={course.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <div className="flex gap-6">
                                                <div className="w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                                                    {course.thumbnail ? (
                                                        <img src={getImageUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                                                            <BookOpen className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded">
                                                            {course.category}
                                                        </span>
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                            {course.level}
                                                        </span>
                                                        {course.rating && (
                                                            <div className="flex items-center gap-1">
                                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{course.rating.toFixed(1)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                                                        {course.description}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                                                {course.price ? `$${course.price}` : 'Free'}
                                                            </span>
                                                            {course.enrollments_count !== undefined && (
                                                                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                                    <Users className="w-4 h-4" />
                                                                    <span className="text-sm">{course.enrollments_count}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Link to={`/courses/${course.id}`}>
                                                            <Button size="sm" variant="outline">
                                                                View Course
                                                                <ExternalLink className="w-4 h-4 ml-2" />
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

                        {/* Reviews Section */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reviews</h2>
                            </div>

                            <div className="p-6">
                                {loadingReviews ? (
                                    <div className="space-y-4">
                                        {[...Array(2)].map((_, i) => (
                                            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                                        ))}
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 dark:text-gray-400">No reviews yet for this instructor.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-semibold">
                                                            {review.user_name?.charAt(0) || review.user?.full_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.user_name || review.user?.full_name || 'Anonymous'}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                    {review.comments || review.message || "No comment provided."}
                                                </p>
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
