import { useState, useEffect } from 'react';
import { feedbackService } from '../../services/feedback.service';
import { courseService } from '../../services/course.service';
import type { FeedbackResponse } from '../../types/feedback';
import type { Course } from '../../types/course';
import { Star, User as UserIcon, MessageSquare, ChevronDown } from 'lucide-react';
import { CardGridSkeleton } from '../../components/ui/CardGridSkeleton';
import toast from 'react-hot-toast';

export const FeedbackPage = () => {
    const [activeTab, setActiveTab] = useState<'instructor' | 'course'>('instructor');
    const [loading, setLoading] = useState(true);
    const [instructorFeedbacks, setInstructorFeedbacks] = useState<FeedbackResponse[]>([]);
    const [courseFeedbacks, setCourseFeedbacks] = useState<FeedbackResponse[]>([]);

    // For Course Feedback selection
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'course' && selectedCourseId) {
            fetchCourseFeedbacks(selectedCourseId);
        }
    }, [selectedCourseId, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'instructor') {
                const data = await feedbackService.getInstructorFeedbacks();
                setInstructorFeedbacks(data);
            } else {
                // Fetch courses first if not already loaded
                if (courses.length === 0) {
                    const coursesData = await courseService.getCourses({});
                    setCourses(coursesData);
                    if (coursesData.length > 0) {
                        setSelectedCourseId(coursesData[0].id);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load feedback data');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseFeedbacks = async (courseId: number) => {
        setLoading(true);
        try {
            const data = await feedbackService.getCourseFeedbacks(courseId);
            setCourseFeedbacks(data);
        } catch (error) {
            console.error('Failed to fetch course feedbacks:', error);
            toast.error('Failed to load course feedbacks');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'}`}
                    />
                ))}
            </div>
        );
    };

    const FeedbackCard = ({ feedback }: { feedback: FeedbackResponse }) => (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 group flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{feedback.user?.full_name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{new Date(feedback.created_at || '').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-lg">
                    {renderStars(feedback.rating || 0)}
                </div>
            </div>
            <div className="relative flex-1">
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {feedback.comments || feedback.review_text || feedback.message || <span className="italic text-gray-400 dark:text-gray-500">No written feedback provided.</span>}
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Feedback & Reviews</h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">See what your students are saying about you and your courses.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white dark:bg-gray-900 p-1.5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 w-fit mb-8">
                    <button
                        onClick={() => setActiveTab('instructor')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'instructor'
                            ? 'bg-gray-900 dark:bg-gray-800 text-white shadow-lg shadow-gray-200 dark:shadow-gray-900/50'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        Instructor Feedback
                    </button>
                    <button
                        onClick={() => setActiveTab('course')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'course'
                            ? 'bg-gray-900 dark:bg-gray-800 text-white shadow-lg shadow-gray-200 dark:shadow-gray-900/50'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        Course Feedback
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'course' && (
                    <div className="mb-10 animate-in fade-in slide-in-from-left-4 duration-300">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Select Course to View Reviews</label>
                        <div className="relative max-w-sm">
                            <select
                                value={selectedCourseId || ''}
                                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                                className="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none shadow-sm text-gray-900 dark:text-gray-100 font-medium appearance-none transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-700"
                            >
                                <option value="" disabled className="dark:bg-gray-900 text-gray-500">Select a course</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id} className="dark:bg-gray-900 text-gray-900 dark:text-gray-100">{course.title}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <CardGridSkeleton count={6} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                        {activeTab === 'instructor' ? (
                            instructorFeedbacks.length > 0 ? (
                                instructorFeedbacks.map(feedback => (
                                    <FeedbackCard key={feedback.id} feedback={feedback} />
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
                                        <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">No feedback yet</h3>
                                    <p className="text-gray-500 dark:text-gray-400">You haven't received any instructor feedback yet.</p>
                                </div>
                            )
                        ) : (
                            courseFeedbacks.length > 0 ? (
                                courseFeedbacks.map(feedback => (
                                    <FeedbackCard key={feedback.id} feedback={feedback} />
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
                                        <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">No course feedback</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Select another course or wait for students to leave reviews.</p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
