import { Link } from 'react-router-dom';
import { getImageUrl } from '../../lib/utils';
import type { Course } from '../../types/course';
import { BookOpen, Clock, DollarSign, Users } from 'lucide-react';

interface CourseCardProps {
    course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
    return (
        <Link to={`/courses/${course.id}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-teal-500 overflow-hidden">
                    {course.thumbnail ? (
                        <img
                            src={getImageUrl(course.thumbnail)}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <BookOpen className="h-16 w-16 text-white opacity-50" />
                        </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${course.category === 'free'
                            ? 'bg-green-500 text-white'
                            : 'bg-yellow-500 text-white'
                            }`}>
                            {course.category === 'free' ? 'FREE' : 'PAID'}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Level Badge */}
                    <div className="mb-3">
                        <span className="inline-block px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded">
                            {course.level.toUpperCase()}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {course.description || 'No description available'}
                    </p>

                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {course.tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            {course.duration_weeks && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{course.duration_weeks}w</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>0</span>
                            </div>
                        </div>

                        {course.category === 'paid' && course.price !== undefined && (
                            <div className="flex items-center gap-1 text-lg font-bold text-indigo-600">
                                <DollarSign className="h-5 w-5" />
                                <span>{course.price}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};
