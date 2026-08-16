import { Link } from 'react-router-dom';
import type { Enrollment } from '../../types/enrollment';
import { BookOpen, PlayCircle, Award } from 'lucide-react';
import { getImageUrl } from '../../lib/utils';
import { formatPercent } from '../../lib/format';

interface EnrolledCourseCardProps {
    enrollment: Enrollment;
}

export const EnrolledCourseCard = ({ enrollment }: EnrolledCourseCardProps) => {
    const { course, progress = 0 } = enrollment;

    if (!course) return null;

    return (
        <Link to={`/my-learning/${course.id}`} className="relative group">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-primary-900/10 transition-all duration-300 group flex flex-col h-full transform hover:-translate-y-1">
                {/* Thumbnail */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                    {course.thumbnail ? (
                        <img
                            src={getImageUrl(course.thumbnail)}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-90 group-hover:opacity-100"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-linear-to-br from-primary-500 to-primary-700">
                            <BookOpen className="h-12 w-12 text-white/50" />
                        </div>
                    )}

                    {/* Overlay Play Button */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 transform scale-50 group-hover:scale-100 transition-transform duration-300">
                            <PlayCircle className="w-8 h-8 text-white fill-white/20" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {course.title}
                    </h3>

                    <div className="mt-auto pt-4">
                        {/* Progress Bar */}
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                            <span>{formatPercent(progress)} Complete</span>
                            {progress === 100 && (
                                <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                                    <Award className="w-4 h-4 mr-1" />
                                    Done
                                </span>
                            )}
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden mb-5">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${progress === 100
                                    ? 'bg-linear-to-r from-emerald-500 to-teal-500'
                                    : 'bg-linear-to-r from-primary-500 to-primary-700'
                                    }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="w-full py-2.5 px-4 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold text-center border border-gray-100 dark:border-gray-700 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 dark:group-hover:bg-primary-500 dark:group-hover:border-primary-500 group-hover:shadow-lg dark:group-hover:shadow-none transition-all duration-300">
                            {progress === 0 ? 'Start Learning' : progress >= 100 ? 'Review Course' : 'Continue Learning'}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};
