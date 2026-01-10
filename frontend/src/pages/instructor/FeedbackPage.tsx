import { useState, useEffect } from 'react';
import { feedbackService } from '../../services/feedback.service';
import { courseService } from '../../services/course.service';
import type { FeedbackResponse } from '../../types/feedback';
import type { Course } from '../../types/course';
import { Star, User as UserIcon, MessageSquare } from 'lucide-react';
import { PageLoader } from '../../components/common/PageLoader';
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
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    const FeedbackCard = ({ feedback }: { feedback: FeedbackResponse }) => (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-full">
                        <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{feedback.user?.full_name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{new Date(feedback.created_at || '').toLocaleDateString()}</p>
                    </div>
                </div>
                {renderStars(feedback.rating || 0)}
            </div>
            <div className="relative">
                <p className="text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-xl text-sm leading-relaxed italic border border-gray-100 dark:border-gray-800">
                    "{feedback.comments || feedback.review_text || feedback.message || 'No written feedback provided.'}"
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Feedback & Reviews</h1>
                        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 font-medium">See what your students are saying about you and your courses.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white dark:bg-gray-900 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 w-fit mb-8">
                    <button
                        onClick={() => setActiveTab('instructor')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'instructor'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        Instructor Feedback
                    </button>
                    <button
                        onClick={() => setActiveTab('course')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'course'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        Course Feedback
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'course' && (
                    <div className="mb-10 animate-in fade-in slide-in-from-left-4 duration-300">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Select Course</label>
                        <div className="relative max-w-sm">
                            <select
                                value={selectedCourseId || ''}
                                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                                className="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm dark:text-gray-100 font-medium appearance-none transition-all"
                            >
                                <option value="" disabled className="dark:bg-gray-900">Select a course</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id} className="dark:bg-gray-900">{course.title}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <PageLoader />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTab === 'instructor' ? (
                            instructorFeedbacks.length > 0 ? (
                                instructorFeedbacks.map(feedback => (
                                    <FeedbackCard key={feedback.id} feedback={feedback} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No instructor feedback yet.</p>
                                </div>
                            )
                        ) : (
                            courseFeedbacks.length > 0 ? (
                                courseFeedbacks.map(feedback => (
                                    <FeedbackCard key={feedback.id} feedback={feedback} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No feedback for this course yet.</p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
