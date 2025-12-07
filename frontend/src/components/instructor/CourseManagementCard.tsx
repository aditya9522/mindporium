import { Link } from 'react-router-dom';
import type { Course } from '../../types/course';
import { BookOpen, Users, Edit, Trash2, Eye, MoreVertical, BarChart } from 'lucide-react';
import { useState } from 'react';

interface CourseManagementCardProps {
    course: Course;
    enrollmentCount?: number;
    onDelete?: (courseId: number) => void;
}

export const CourseManagementCard = ({ course, enrollmentCount = 0, onDelete }: CourseManagementCardProps) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
            {/* Thumbnail */}
            <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-teal-500 overflow-hidden rounded-t-xl">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-12 w-12 text-white opacity-50" />
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${course.is_published
                        ? 'bg-green-500 text-white'
                        : 'bg-yellow-500 text-white'
                        }`}>
                        {course.is_published ? 'Published' : 'Draft'}
                    </span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${course.category === 'free'
                        ? 'bg-blue-500 text-white'
                        : 'bg-purple-500 text-white'
                        }`}>
                        {course.category === 'free' ? 'FREE' : 'PAID'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Level Badge */}
                <div className="mb-3">
                    <span className="inline-block px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded">
                        {course.level.toUpperCase()}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description || 'No description available'}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{enrollmentCount} students</span>
                    </div>
                    {course.category === 'paid' && course.price !== undefined && (
                        <div className="flex items-center gap-1 text-indigo-600 font-semibold">
                            <span>${course.price}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Link
                        to={`/courses/${course.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                        <Eye className="w-4 h-4" />
                        View
                    </Link>
                    <Link
                        to={`/instructor/courses/${course.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Link>
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                    <Link
                                        to={`/instructor/courses/${course.id}/view`}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowMenu(false)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4" />
                                            View Overview
                                        </div>
                                    </Link>
                                    <Link
                                        to={`/instructor/courses/${course.id}/analytics`}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowMenu(false)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <BarChart className="w-4 h-4" />
                                            View Analytics
                                        </div>
                                    </Link>
                                    <Link
                                        to={`/instructor/courses/${course.id}/students`}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowMenu(false)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            View Students
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            if (onDelete) {
                                                onDelete(course.id);
                                            }
                                            setShowMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Trash2 className="w-4 h-4" />
                                            Delete Course
                                        </div>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
