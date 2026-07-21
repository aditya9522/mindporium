import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentService } from '../../services/enrollment.service';
import type { Enrollment } from '../../types/enrollment';
import { CardGridSkeleton } from '../../components/ui/CardGridSkeleton';
import { EnrolledCourseCard } from '../../components/student/EnrolledCourseCard';
import { BookOpen, RefreshCw } from 'lucide-react';

export const MyLearningPage = () => {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

    const loadEnrollments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await enrollmentService.getMyEnrollments();
            setEnrollments(data);
        } catch (error) {
            console.error('Failed to fetch enrollments:', error);
            setError('Failed to load your learning progress.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEnrollments();
    }, [loadEnrollments]);

    const filterCounts = useMemo(
        () => ({
            all: enrollments.length,
            'in-progress': enrollments.filter(enrollment => (enrollment.progress || 0) < 100).length,
            completed: enrollments.filter(enrollment => (enrollment.progress || 0) >= 100).length,
        }),
        [enrollments],
    );

    const filteredEnrollments = useMemo(() => enrollments.filter(enrollment => {
        const progress = enrollment.progress || 0;
        if (filter === 'completed') return progress >= 100;
        if (filter === 'in-progress') return progress < 100;
        return true;
    }), [enrollments, filter]);



    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-5 sm:py-8 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative bg-linear-to-r from-primary-600 to-primary-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 text-white shadow-2xl shadow-primary-200 dark:shadow-none lg:mb-12 mb-6 sm:mb-8 overflow-hidden transition-all">
                    <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-10 transform translate-x-12 -translate-y-12 pointer-events-none">
                        <BookOpen className="w-44 h-44 sm:w-64 sm:h-64 text-white" />
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-8">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">My Learning</h1>
                            <p className="text-primary-100 text-sm sm:text-lg font-medium opacity-90 max-w-xl leading-relaxed">
                                Track your progress and continue learning. You're building your future one course at a time.
                            </p>
                        </div>

                        <div className="flex max-w-full items-center gap-2">
                            <button
                                onClick={loadEnrollments}
                                disabled={loading}
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-primary-700 shadow-md transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-white/70"
                                aria-label="Refresh learning progress"
                                title="Refresh learning progress"
                            >
                                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>

                            {/* Filters */}
                            <div className="flex max-w-full overflow-x-auto bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
                                {(['all', 'in-progress', 'completed'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`shrink-0 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 ${filter === f
                                            ? 'bg-white text-primary-900 shadow-md transform scale-105'
                                            : 'text-primary-100 hover:bg-white/10'
                                            }`}
                                    >
                                        {f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        <span className="ml-2 rounded-full bg-white/15 px-1.5 py-0.5 text-[10px]">
                                            {filterCounts[f]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <CardGridSkeleton count={4} />
                ) : error ? (
                    <div className="text-center py-16 sm:py-20 px-5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 transition-colors">
                        <div className="bg-red-50 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                            <BookOpen className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{error}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto font-medium">
                            Please try again. Your courses may just need a quick refresh.
                        </p>
                        <button
                            onClick={loadEnrollments}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
                            aria-label="Refresh learning progress"
                            title="Refresh learning progress"
                        >
                            <RefreshCw className="h-5 w-5" />
                        </button>
                    </div>
                ) : filteredEnrollments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredEnrollments.map((enrollment) => (
                            <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 sm:py-24 px-5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 transition-colors">
                        <div className="bg-primary-50 dark:bg-primary-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <BookOpen className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                            {filter === 'all'
                                ? "You haven't enrolled in any courses yet"
                                : `No ${filter.replace('-', ' ')} courses found`}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto font-medium">
                            {filter === 'all'
                                ? "Explore our catalog to find your next learning adventure."
                                : "Keep learning to see courses here!"}
                        </p>
                        {filter === 'all' && (
                            <Link
                                to="/courses"
                                className="inline-flex items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl shadow-lg shadow-primary-200 dark:shadow-none text-white bg-primary-600 hover:bg-primary-700 transition-all transform hover:-translate-y-0.5"
                            >
                                Browse Courses
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
