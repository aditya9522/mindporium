import { useEffect, useState } from 'react';
import { enrollmentService } from '../../services/enrollment.service';
import type { Enrollment } from '../../types/enrollment';
import { EnrolledCourseCard } from '../../components/student/EnrolledCourseCard';
import { BookOpen, Loader2 } from 'lucide-react';

export const MyLearningPage = () => {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const data = await enrollmentService.getMyEnrollments();
                setEnrollments(data);
            } catch (error) {
                console.error('Failed to fetch enrollments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, []);

    const filteredEnrollments = enrollments.filter(enrollment => {
        const progress = enrollment.progress || 0;
        if (filter === 'completed') return progress === 100;
        if (filter === 'in-progress') return progress < 100;
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
                        <p className="mt-2 text-gray-600">Track your progress and continue learning.</p>
                    </div>

                    {/* Filters */}
                    <div className="mt-4 md:mt-0 flex bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                        {(['all', 'in-progress', 'completed'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === f
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredEnrollments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEnrollments.map((enrollment) => (
                            <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {filter === 'all'
                                ? "You haven't enrolled in any courses yet"
                                : `No ${filter.replace('-', ' ')} courses found`}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {filter === 'all'
                                ? "Explore our catalog to find your next learning adventure."
                                : "Keep learning to see courses here!"}
                        </p>
                        {filter === 'all' && (
                            <a
                                href="/courses"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Browse Courses
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
