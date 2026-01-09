import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService } from '../../services/course.service';
import { subjectService } from '../../services/subject.service';
import { enrollmentService } from '../../services/enrollment.service';
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
import toast from 'react-hot-toast';
import { getImageUrl } from '../../lib/utils';
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

    useEffect(() => {
        if (id) {
            loadCourseData();
        }
    }, [id]);

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
            await enrollmentService.enroll({ course_id: Number(id) });
            setIsEnrolled(true);
            toast.success('Successfully enrolled in course!');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        if (loading) {
            return <PageLoader />;
        }
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
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 relative pb-20 transition-colors duration-300 text-gray-900 dark:text-gray-100">
            {/* Hero Section */}
            <div className="relative h-[500px] w-full bg-slate-900 overflow-hidden group">
                {course.thumbnail ? (
                    <div className="absolute inset-0">
                        <img
                            src={getImageUrl(course.thumbnail)}
                            alt={course.title}
                            className="w-full h-full object-cover opacity-50 blur-sm scale-105 group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-transparent to-transparent" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black" />
                )}

                <div className="absolute inset-0 flex flex-col justify-end pb-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
                        <Link to="/courses" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors hover:-translate-x-1 duration-200">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Courses</span>
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                            <span className="px-4 py-1.5 bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-indigo-200 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                {course.level}
                            </span>
                            <span className={`px-4 py-1.5 backdrop-blur-md border rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${course.category === 'free'
                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
                                : 'bg-amber-500/20 border-amber-500/30 text-amber-200'
                                }`}>
                                {course.category}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 max-w-4xl leading-tight tracking-tight drop-shadow-lg animate-in fade-in slide-in-from-bottom-6 duration-500 delay-200">
                            {course.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-8 text-slate-300 font-medium animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <Users className="h-5 w-5 text-indigo-400" />
                                </div>
                                <span className="text-lg">{(course.enrollments_count || 0).toLocaleString()} <span className="text-slate-400 text-base">students</span></span>
                            </div>
                            {course.duration_weeks && (
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                        <Clock className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <span className="text-lg">{course.duration_weeks} <span className="text-slate-400 text-base">weeks</span></span>
                                </div>
                            )}
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                </div>
                                <span className="text-lg">{course.rating ? course.rating.toFixed(1) : 'New'} <span className="text-slate-400 text-base">rating</span></span>
                            </div>
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
                            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Topics Covered</h2>
                                <div className="flex flex-wrap gap-2">
                                    {course.tags.map((tag, index) => (
                                        <span key={index} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
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
                                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No content uploaded yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {subjects.map((subject, index) => (
                                        <div key={subject.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                            <div className="flex items-center gap-5 p-5 bg-white">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xl shadow-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 text-lg mb-1">{subject.title}</h3>
                                                            {subject.description && (
                                                                <p className="text-sm text-gray-500 leading-relaxed">{subject.description}</p>
                                                            )}
                                                        </div>
                                                        {(user?.role === 'instructor' && user.id === course.created_by) && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
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
                                                <div className="bg-gray-50/80 p-5 border-t border-gray-100 space-y-3">
                                                    {subject.classrooms.map((cls: any) => (
                                                        <div key={cls.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors shadow-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-3 h-3 rounded-full ${cls.status === 'live' ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : 'bg-gray-400'}`}></div>
                                                                <span className="font-medium text-gray-700">{cls.title}</span>
                                                            </div>
                                                            <Link to={`/classrooms/${cls.id}`}>
                                                                <Button size="sm" variant={cls.status === 'live' ? 'default' : 'outline'} className={cls.status === 'live' ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white shadow-md shadow-red-200' : 'hover:bg-gray-50'}>
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

                        {/* Announcements */}
                        {isEnrolled && (
                            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Announcements</h2>
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
                                <div className="mb-8 pb-8 border-b border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                        Instructor Controls
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                                            className="w-full h-10 hover:bg-gray-50 border-gray-200"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate(`/instructor/courses/${course.id}/analytics`)}
                                            className="w-full h-10 hover:bg-gray-50 border-gray-200"
                                        >
                                            <BarChart className="h-4 w-4 mr-2" />
                                            Stats
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="mb-8">
                                <span className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Course Price</span>
                                <div className="flex items-center gap-2 mt-2">
                                    {course.category === 'free' ? (
                                        <span className="text-4xl font-extrabold text-emerald-600 tracking-tight">Free</span>
                                    ) : (
                                        <div className="flex items-baseline gap-1 text-gray-900">
                                            <span className="text-4xl font-extrabold tracking-tight">${course.price}</span>
                                            <span className="text-lg text-gray-400 font-medium">USD</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isEnrolled ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700 flex items-center gap-4">
                                        <div className="bg-emerald-100 p-2.5 rounded-full flex-shrink-0">
                                            <CheckCircle className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">Enrolled</p>
                                            <p className="text-sm opacity-90 font-medium">You're ready to learn!</p>
                                        </div>
                                    </div>
                                    <Link to={`/my-learning/${course.id}`} className="block">
                                        <Button className="w-full h-14 text-lg font-bold shadow-xl shadow-indigo-200 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 transition-all transform hover:-translate-y-0.5" size="lg">
                                            <PlayCircle className="h-6 w-6 mr-2.5 fill-current" />
                                            Continue Learning
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {user?.role === 'instructor' ? (
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 text-center font-medium">
                                            Instructor Account (Preview Mode)
                                        </div>
                                    ) : (
                                        <Button
                                            className="w-full h-14 text-lg font-bold shadow-xl shadow-indigo-200 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 relative overflow-hidden group"
                                            size="lg"
                                            onClick={handleEnroll}
                                            isLoading={enrolling}
                                            disabled={enrolling}
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {enrolling ? 'Enrolling...' : 'Enroll Now'}
                                                {!enrolling && <ChevronRight className="w-5 h-5 opacity-80" />}
                                            </span>
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        </Button>
                                    )}
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        30-day money-back guarantee
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-8 border-t border-gray-100 space-y-5">
                                <h4 className="font-bold text-gray-900 text-sm">This course includes:</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3.5 text-sm text-gray-600 font-medium">
                                        <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600"><PlayCircle className="w-4 h-4" /></div>
                                        <span>Full lifetime access</span>
                                    </div>
                                    <div className="flex items-center gap-3.5 text-sm text-gray-600 font-medium">
                                        <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600"><CheckCircle className="w-4 h-4" /></div>
                                        <span>Access on mobile and TV</span>
                                    </div>
                                    <div className="flex items-center gap-3.5 text-sm text-gray-600 font-medium">
                                        <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600"><FileText className="w-4 h-4" /></div>
                                        <span>Certificate of completion</span>
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
