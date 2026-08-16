import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService } from '../../services/course.service';
import { subjectService } from '../../services/subject.service';
import { enrollmentService } from '../../services/enrollment.service';
import { feedbackService } from '../../services/feedback.service';
import { couponService } from '../../services/coupon.service';
import type { Course } from '../../types/course';
import type { Subject } from '../../types/enrollment';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/Button';
import { SpeakerButton } from '../../components/ui/SpeakerButton';
import {
    Clock, Users, CheckCircle,
    PlayCircle, FileText, ArrowLeft, Star,
    BarChart, Edit, Plus, ChevronRight
} from 'lucide-react';
import { AnnouncementsList } from '../../components/course/AnnouncementsList';
import { FeedbackModal } from '../../components/feedback/FeedbackModal';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../lib/utils';
import { formatNumber, formatPercent } from '../../lib/format';
import { PageLoader } from '../../components/common/PageLoader';

export const CourseDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();

    const [course, setCourse] = useState<Course | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [courseReviews, setCourseReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [couponDiscount, setCouponDiscount] = useState(0);

    const handleApplyCoupon = async () => {
        const normalizedCode = couponCode.trim().toUpperCase();
        if (!normalizedCode) return;
        setValidatingCoupon(true);
        try {
            const data = await couponService.validate(normalizedCode);
            if (data.valid) {
                setCouponCode(data.code);
                setCouponDiscount(data.discount_percent);
                toast.success(`Coupon applied! ${formatPercent(data.discount_percent)} off`);
            } else {
                toast.error('Invalid coupon code');
                setCouponDiscount(0);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Invalid coupon code');
            setCouponDiscount(0);
        } finally {
            setValidatingCoupon(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadCourseData();
            loadCourseReviews();
        }
    }, [id]);

    const loadCourseReviews = async () => {
        try {
            setLoadingReviews(true);
            const reviews = await feedbackService.getCourseFeedbacks(Number(id));
            setCourseReviews(reviews);
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const loadCourseData = async () => {
        try {
            setLoading(true);
            const courseData = await courseService.getCourse(Number(id));
            setCourse(courseData);

            const subjectsData = await subjectService.getCourseSubjects(Number(id));
            setSubjects(subjectsData);

            if (isAuthenticated) {
                const enrolled = await enrollmentService.checkEnrollment(Number(id));
                setIsEnrolled(enrolled);
            }
        } catch (error: any) {
            console.error('Failed to load course:', error);
            toast.error('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to enroll');
            navigate('/login');
            return;
        }

        try {
            setEnrolling(true);
            await enrollmentService.enroll({ 
                course_id: Number(id),
                ...(couponCode && couponDiscount > 0 ? { coupon_code: couponCode } : {})
            });
            setIsEnrolled(true);
            toast.success('Successfully enrolled in course!');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    if (!course) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
                    <Link to="/courses">
                        <Button>Browse Courses</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative pb-20 transition-colors duration-300 text-gray-900 dark:text-gray-100">
            {/* Hero Section */}
            <div className="relative h-80 w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                {course.thumbnail && (
                    <div className="absolute inset-0">
                        <img
                            src={getImageUrl(course.thumbnail)}
                            alt={course.title}
                            className="w-full h-full object-cover opacity-40 dark:opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                    </div>
                )}

                <div className="absolute inset-0 flex flex-col justify-end pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
                        <Link to="/courses" className="inline-flex items-center gap-2 text-white hover:text-white/80 mb-6 transition-colors text-sm font-medium">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Courses</span>
                        </Link>

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 rounded-md text-xs font-semibold">
                                {course.level}
                            </span>
                            <span className={`px-3 py-1 rounded-md text-xs font-semibold ${course.category === 'free'
                                ? 'bg-emerald-500/90 text-white'
                                : 'bg-amber-500/90 text-white'
                                }`}>
                                {course.category}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 max-w-4xl leading-tight">
                            {course.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                <span>{(course.enrollments_count || 0).toLocaleString()} students</span>
                            </div>
                            {course.duration_weeks && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    <span>{course.duration_weeks} weeks</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                <span>{course.rating ? formatNumber(course.rating) : 'New'} rating</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/10 hover:bg-white/20 text-white border-white/20 ml-auto"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: course.title,
                                            text: `Check out this course: ${course.title} on Mindporium!`,
                                            url: window.location.href,
                                        }).catch(console.error);
                                    } else {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast.success("Link copied to clipboard!");
                                    }
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                                Share Course
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Course */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    About this course
                                </h2>
                                <SpeakerButton text={course.description || ""} />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg whitespace-pre-line">
                                {course.description || "No description provided."}
                            </p>
                        </div>

                        {/* Tags if available */}
                        {course.tags && course.tags.length > 0 && (
                            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-widest text-sm">
                                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                    Topics Covered
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {course.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/50 hover:scale-105 transition-transform cursor-default"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Course Curriculum */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Course Curriculum</h2>
                            {subjects.length === 0 ? (
                                <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">No content uploaded yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {subjects.map((subject, index) => (
                                        <div key={subject.id} className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                            <div className="flex items-center gap-5 p-5 bg-white dark:bg-gray-900">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xl shadow-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1">{subject.title}</h3>
                                                            {subject.description && (
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{subject.description}</p>
                                                            )}
                                                        </div>
                                                        {(user?.role === 'instructor' && user.id === course.created_by) && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    navigate(`/instructor/tests/create?subject_id=${subject.id}`);
                                                                }}
                                                            >
                                                                <Plus className="w-4 h-4 mr-1.5" />
                                                                Add Test
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Sub-items (Classrooms) */}
                                            {subject.classrooms && subject.classrooms.length > 0 && (
                                                <div className="bg-gray-50/80 dark:bg-gray-800/50 p-5 border-t border-gray-100 dark:border-gray-800 space-y-3">
                                                    {subject.classrooms.map((cls: any) => (
                                                        <div key={cls.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-colors shadow-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-3 h-3 rounded-full ${cls.status === 'live' ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : 'bg-gray-400'}`}></div>
                                                                <span className="font-medium text-gray-700 dark:text-gray-300">{cls.title}</span>
                                                            </div>
                                                            <Link to={`/classroom/${cls.id}`}>
                                                                <Button size="sm" variant={cls.status === 'live' ? 'default' : 'outline'} className={cls.status === 'live' ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white shadow-md shadow-red-200' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}>
                                                                    {cls.status === 'live' ? 'Join Live' : 'View Class'}
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
                                        <Star className="w-6 h-6 fill-current" />
                                    </div>
                                    Course Reviews
                                </h2>
                                {isEnrolled && (
                                    <Button onClick={() => setShowFeedbackModal(true)} variant="outline" className="rounded-xl font-bold">
                                        Rate this Course
                                    </Button>
                                )}
                            </div>

                            {loadingReviews ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-32 bg-gray-50 dark:bg-gray-800 animate-pulse rounded-2xl" />
                                    ))}
                                </div>
                            ) : courseReviews.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">No reviews yet. Be the first to review!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {courseReviews.map((review) => (
                                        <div key={review.id} className="p-6 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                                                        {review.user_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-gray-100">{review.user_name || 'Anonymous'}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                                "{review.review_text || review.message || "No comment provided."}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Announcements */}
                        {isEnrolled && (
                            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Course Announcements</h2>
                                <AnnouncementsList courseId={course.id} />
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Card for Enroll/Price */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white dark:border-gray-800 sticky top-24 z-20 transition-colors duration-300">
                            {/* Instructor Actions */}
                            {(user?.role === 'admin' || (user?.role === 'instructor' && user.id === course.created_by)) && (
                                <div className="mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                        Instructor Controls
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                                            className="w-full h-10 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate(`/instructor/courses/${course.id}/analytics`)}
                                            className="w-full h-10 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                                        >
                                            <BarChart className="h-4 w-4 mr-2" />
                                            Stats
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="mb-8">
                                <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Course Price</span>
                                <div className="flex items-center gap-2 mt-2">
                                    {course.category === 'free' ? (
                                        <span className="text-4xl font-extrabold text-emerald-600 tracking-tight">Free</span>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-baseline gap-1 text-gray-900 dark:text-gray-100">
                                                {couponDiscount > 0 && (
                                                    <span className="text-xl text-gray-400 line-through mr-2 font-bold">${course.price}</span>
                                                )}
                                                <span className="text-4xl font-extrabold tracking-tight">
                                                    ${couponDiscount > 0 ? ((course.price || 0) * (1 - couponDiscount / 100)).toFixed(2) : course.price}
                                                </span>
                                                <span className="text-lg text-gray-400 font-medium tracking-tight">USD</span>
                                            </div>
                                            {couponDiscount > 0 && (
                                                <span className="text-sm font-bold text-emerald-500">Coupon applied: {formatPercent(couponDiscount)} off!</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isEnrolled ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 flex items-center gap-4">
                                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-full flex-shrink-0">
                                            <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">Enrolled</p>
                                            <p className="text-sm opacity-90 font-medium">You're ready to learn!</p>
                                        </div>
                                    </div>
                                    <Link to={`/my-learning/${course.id}`} className="block">
                                        <Button className="w-full h-14 text-lg font-bold shadow-xl shadow-indigo-200 dark:shadow-none rounded-xl bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 transition-all transform hover:-translate-y-0.5" size="lg">
                                            <PlayCircle className="h-6 w-6 mr-2.5 fill-current" />
                                            Continue Learning
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {user?.role === 'instructor' ? (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-center font-medium">
                                            Instructor Account (Preview Mode)
                                        </div>
                                    ) : (
                                        <>
                                            {course.category !== 'free' && (
                                                <div className="flex gap-2">
                                                    <input 
                type="text" 
                placeholder="Coupon code" 
                value={couponCode}
                onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponDiscount(0);
                }}
                                                        className="flex-1 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
                                                    />
                                                    <Button 
                                                        variant="outline" 
                                                        onClick={handleApplyCoupon}
                                                        disabled={validatingCoupon || !couponCode}
                                                        className="rounded-xl border-gray-200 dark:border-gray-700"
                                                    >
                                                        {validatingCoupon ? 'Validating...' : 'Apply'}
                                                    </Button>
                                                </div>
                                            )}
                                            <Button
                                                className="w-full h-14 text-lg font-bold shadow-xl shadow-indigo-200 dark:shadow-none rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group"
                                                size="lg"
                                                onClick={handleEnroll}
                                                isLoading={enrolling}
                                                disabled={enrolling}
                                            >
                                                <span className="relative z-10 flex items-center justify-center gap-2">
                                                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                                                    {!enrolling && <ChevronRight className="w-5 h-5 opacity-80" />}
                                                </span>
                                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                            </Button>
                                        </>
                                    )}
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        30-day money-back guarantee
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 space-y-5">
                                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">This course includes:</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3.5 text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400"><PlayCircle className="w-4 h-4" /></div>
                                        <span>Full lifetime access</span>
                                    </div>
                                    <div className="flex items-center gap-3.5 text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400"><CheckCircle className="w-4 h-4" /></div>
                                        <span>Access on mobile and TV</span>
                                    </div>
                                    <div className="flex items-center gap-3.5 text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400"><FileText className="w-4 h-4" /></div>
                                        <span>Certificate of completion</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => {
                    setShowFeedbackModal(false);
                    loadCourseReviews(); // Refresh reviews
                }}
                type="course"
                targetId={Number(id)}
            />
        </div>
    );
};
