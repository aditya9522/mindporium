import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService } from '../../services/course.service';
import { subjectService } from '../../services/subject.service';
import { enrollmentService } from '../../services/enrollment.service';
import type { Course } from '../../types/course';
import type { Subject } from '../../types/enrollment';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/Button';
import {
    Clock, Users, DollarSign, CheckCircle,
    PlayCircle, FileText, ArrowLeft, Star,
    Settings, BarChart, Edit
} from 'lucide-react';
import { AnnouncementsList } from '../../components/course/AnnouncementsList';
import toast from 'react-hot-toast';

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
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
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
        <div className="bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-teal-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Link to="/courses" className="inline-flex items-center gap-2 text-white hover:text-white/90 mb-6">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-medium">Back to Courses</span>
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white">
                                    {course.level.toUpperCase()}
                                </span>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white">
                                    {course.category === 'free' ? 'FREE' : 'PAID'}
                                </span>
                            </div>

                            <h1 className="text-4xl font-bold mb-4 text-white">{course.title}</h1>
                            <p className="text-xl text-white/95 mb-6 leading-relaxed">{course.description}</p>

                            <div className="flex flex-wrap items-center gap-6 text-white/95">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    <span className="font-medium">0 students</span>
                                </div>
                                {course.duration_weeks && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        <span className="font-medium">{course.duration_weeks} weeks</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 fill-current text-yellow-300" />
                                    <span className="font-medium">4.5 (0 reviews)</span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="space-y-6">
                                {/* Instructor Tools */}
                                {(user?.role === 'admin' || (user?.role === 'instructor' && user.id === course.created_by)) && (
                                    <div className="bg-white rounded-xl p-6 shadow-xl border-l-4 border-indigo-600">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Settings className="h-5 w-5 text-indigo-600" />
                                            Instructor Tools
                                        </h3>
                                        <div className="space-y-3">
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit Course
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() => navigate(`/instructor/courses/${course.id}/analytics`)}
                                            >
                                                <BarChart className="h-4 w-4 mr-2" />
                                                Course Analytics
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white rounded-xl p-6 shadow-xl">
                                    {course.category === 'paid' && (
                                        <div className="flex items-center gap-2 text-3xl font-bold text-indigo-600 mb-4">
                                            <DollarSign className="h-8 w-8" />
                                            <span>{course.price || 0}</span>
                                        </div>
                                    )}

                                    {isEnrolled ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-green-600 mb-4">
                                                <CheckCircle className="h-5 w-5" />
                                                <span className="font-semibold">You're enrolled!</span>
                                            </div>
                                            <Link to={`/my-learning/${course.id}`}>
                                                <Button className="w-full" size="lg">
                                                    <PlayCircle className="h-5 w-5 mr-2" />
                                                    Go to Course
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            size="lg"
                                            onClick={handleEnroll}
                                            disabled={enrolling}
                                        >
                                            {enrolling ? 'Enrolling...' : 'Enroll Now'}
                                        </Button>
                                    )}

                                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Lifetime access</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Certificate of completion</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Access on mobile and desktop</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-8">
                    {/* What You'll Learn */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">What you'll learn</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                'Master the fundamentals',
                                'Build real-world projects',
                                'Learn best practices',
                                'Get hands-on experience',
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Course Curriculum */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
                        {subjects.length === 0 ? (
                            <p className="text-gray-500">No curriculum available yet</p>
                        ) : (
                            <div className="space-y-2">
                                {subjects.map((subject, index) => (
                                    <div
                                        key={subject.id}
                                        className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{subject.title}</h3>
                                            {subject.description && (
                                                <p className="text-sm text-gray-600 mt-1">{subject.description}</p>
                                            )}
                                        </div>
                                        <FileText className="h-5 w-5 text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Announcements */}
                    {isEnrolled && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <AnnouncementsList courseId={course.id} />
                        </div>
                    )}

                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {course.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
