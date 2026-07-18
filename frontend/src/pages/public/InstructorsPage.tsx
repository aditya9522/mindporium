import { useState, useEffect } from 'react';
import { userService } from '../../services/user.service';
import { GraduationCap, Star, Users, BookOpen, ArrowRight, ShieldCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../lib/utils';

export const InstructorsPage = () => {
    const [instructors, setInstructors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInstructors();
    }, []);

    const loadInstructors = async () => {
        try {
            const data = await userService.getPublicInstructors();
            setInstructors(data);
        } catch (error) {
            console.error('Failed to load instructors:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 relative">
            <div className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center space-y-6 flex flex-col items-center">
                    <div className="w-32 h-6 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mb-4" />
                    <div className="w-3/4 h-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="w-1/2 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col h-[400px] animate-pulse">
                            <div className="h-32 bg-gray-200 dark:bg-gray-800 w-full shrink-0" />
                            <div className="px-6 relative flex justify-between items-end -mt-12 mb-4">
                                <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-900 bg-gray-300 dark:bg-gray-700" />
                                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-800 rounded-md" />
                            </div>
                            <div className="px-6 flex-1 flex flex-col">
                                <div className="h-6 bg-gray-200 dark:bg-gray-800 w-1/2 rounded mb-2" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 w-1/3 rounded mb-6" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 w-full rounded mb-2" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 w-4/5 rounded mb-6" />
                                <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100 dark:border-gray-800 mt-auto">
                                    <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
                                    <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 relative selection:bg-primary-100 dark:selection:bg-primary-900 selection:text-primary-900 dark:selection:text-primary-100">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-linear-to-b from-primary-50/50 dark:from-primary-950/20 to-transparent pointer-events-none" />

            {/* Hero Section */}
            <div className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-gray-900 border border-primary-100 dark:border-primary-900/50 shadow-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Award className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span className="text-xs font-semibold text-primary-900 dark:text-primary-100 tracking-wide uppercase">World-Class Mentors</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        Learn from the <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-violet-600 dark:from-primary-400 dark:to-violet-400">Absolute Best</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        Our instructors are industry leaders, passionate educators, and dedicated mentors committed to accelerating your growth.
                    </p>
                </div>
            </div>

            {/* Grid Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
                {instructors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-800 text-center px-4">
                        <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <GraduationCap className="w-10 h-10 text-primary-400 dark:text-primary-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No instructors found yet</h3>
                        <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto">We're currently strictly vetting new instructors to ensure the highest quality education for our students.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                        {instructors.map((instructor, index) => (
                            <Link
                                key={instructor.id}
                                to={`/instructors/${instructor.id}`}
                                className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-primary-900/5 dark:hover:shadow-black/20 transition-all duration-300 flex flex-col h-full animate-in fade-in zoom-in duration-500 fill-mode-backwards"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Card Header / Banner */}
                                <div className="h-32 bg-linear-to-r from-slate-900 to-slate-800 relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <ArrowRight className="w-5 h-5 text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                    </div>
                                </div>

                                {/* Avatar & Badge */}
                                <div className="px-6 relative flex justify-between items-end -mt-12 mb-4">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-md overflow-hidden group-hover:scale-105 transition-transform duration-300 ease-out">
                                            {instructor.photo ? (
                                                <img
                                                    src={getImageUrl(instructor.photo)}
                                                    alt={instructor.full_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 text-3xl font-bold">
                                                    {instructor.full_name?.charAt(0)?.toUpperCase() || 'I'}
                                                </div>
                                            )}
                                        </div>
                                        {instructor.is_verified && (
                                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm">
                                                <ShieldCheck className="w-5 h-5 text-blue-500 fill-current" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="pb-1">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-md text-xs font-bold border border-amber-100 dark:border-amber-900/50">
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                            <span>
                                                {instructor.rating > 0 ? instructor.rating.toFixed(1) : 'New'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-6 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-1">
                                            {instructor.full_name}
                                        </h3>
                                        <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mt-1 flex items-center gap-1.5">
                                            Instructor
                                        </p>
                                    </div>

                                    <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-6 h-10">
                                        {instructor.bio || 'Passionate educator focused on delivering high-quality learning experiences.'}
                                    </p>

                                    {/* Mini Stats */}
                                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100 dark:border-gray-800 mt-auto">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">
                                                <Users className="w-3.5 h-3.5" />
                                                <span>Students</span>
                                            </div>
                                            <p className="text-slate-900 dark:text-white font-bold text-lg">
                                                {(instructor.stats?.total_students || instructor.total_students || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">
                                                <BookOpen className="w-3.5 h-3.5" />
                                                <span>Courses</span>
                                            </div>
                                            <p className="text-slate-900 dark:text-white font-bold text-lg">
                                                {instructor.stats?.total_courses || instructor.total_courses || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
