import { useEffect, useState } from 'react';
import { enrollmentService } from '../../services/enrollment.service';
import type { Enrollment } from '../../types/enrollment';
import { PageLoader } from '../../components/common/PageLoader';
import { EnrolledCourseCard } from '../../components/student/EnrolledCourseCard';
import { BookOpen } from 'lucide-react';

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
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative bg-gradient-to-r from-indigo-700 to-purple-800 rounded-3xl p-10 text-white shadow-2xl shadow-indigo-200 lg:mb-12 mb-8 overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-12 -translate-y-12 pointer-events-none">
                        <BookOpen className="w-64 h-64 text-white" />
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div>
                            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">My Learning</h1>
                            <p className="text-indigo-100 text-lg font-medium opacity-90 max-w-xl leading-relaxed">
                                Track your progress and continue learning. You're building your future one course at a time.
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
                            {(['all', 'in-progress', 'completed'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${filter === f
                                        ? 'bg-white text-indigo-900 shadow-md transform scale-105'
                                        : 'text-indigo-100 hover:bg-white/10'
                                        }`}
                                >
                                    {f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {filteredEnrollments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredEnrollments.map((enrollment) => (
                            <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
                        <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <BookOpen className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {filter === 'all'
                                ? "You haven't enrolled in any courses yet"
                                : `No ${filter.replace('-', ' ')} courses found`}
                        </h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">
                            {filter === 'all'
                                ? "Explore our catalog to find your next learning adventure."
                                : "Keep learning to see courses here!"}
                        </p>
                        {filter === 'all' && (
                            <a
                                href="/courses"
                                className="inline-flex items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl shadow-lg shadow-indigo-200 text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-all transform hover:-translate-y-0.5"
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
