import { useState, useEffect } from 'react';
import { feedbackService } from '../../services/feedback.service';
import { courseService } from '../../services/course.service';
import type { FeedbackResponse } from '../../types/feedback';
import type { Course } from '../../types/course';
import { Loader2, Star, User as UserIcon, MessageSquare } from 'lucide-react';
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                        <UserIcon className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{feedback.user?.full_name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">{new Date(feedback.created_at || '').toLocaleDateString()}</p>
                    </div>
                </div>
                {renderStars(feedback.rating)}
            </div>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                {feedback.comments || feedback.review_text || feedback.message || 'No written feedback provided.'}
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Feedback & Reviews</h1>
                        <p className="mt-2 text-gray-600">See what your students are saying about you and your courses.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit mb-6">
                    <button
                        onClick={() => setActiveTab('instructor')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'instructor'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        Instructor Feedback
                    </button>
                    <button
                        onClick={() => setActiveTab('course')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'course'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        Course Feedback
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'course' && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                        <select
                            value={selectedCourseId || ''}
                            onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                            className="block w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
                        >
                            <option value="" disabled>Select a course</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
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
