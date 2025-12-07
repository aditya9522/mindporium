import { Link } from 'react-router-dom';
import type { Enrollment } from '../../types/enrollment';
import { BookOpen, PlayCircle, Award } from 'lucide-react';

interface EnrolledCourseCardProps {
    enrollment: Enrollment;
}

export const EnrolledCourseCard = ({ enrollment }: EnrolledCourseCardProps) => {
    const { course, progress = 0 } = enrollment;

    if (!course) return null;

    return (
        <Link to={`/courses/${course.id}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
                {/* Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-teal-500 overflow-hidden">
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
                    
                    {/* Overlay Play Button */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <PlayCircle className="w-12 h-12 text-white" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {course.title}
                    </h3>

                    <div className="mt-auto">
                        {/* Progress Bar */}
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <span className="font-medium">{progress}% Complete</span>
                            {progress === 100 && (
                                <span className="flex items-center text-green-600 text-xs font-bold">
                                    <Award className="w-4 h-4 mr-1" />
                                    Completed
                                </span>
                            )}
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                    progress === 100 ? 'bg-green-500' : 'bg-indigo-600'
                                }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        
                        <button className="w-full mt-4 py-2 px-4 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
                            {progress === 0 ? 'Start Learning' : 'Continue Learning'}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};
