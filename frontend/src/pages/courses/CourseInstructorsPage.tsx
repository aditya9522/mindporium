import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Users, ArrowRight } from 'lucide-react';
import api from '../../lib/axios';

interface Instructor {
    id: number;
    full_name: string;
    photo?: string;
    bio?: string;
}

interface Course {
    id: number;
    title: string;
    instructors: Instructor[];
}

export const CourseInstructorsPage = () => {
    const { id } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadCourseInstructors();
        }
    }, [id]);

    const loadCourseInstructors = async () => {
        try {
            const response = await api.get(`/courses/${id}`);
            setCourse(response.data);
        } catch (error) {
            console.error('Failed to load course instructors:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
                    <p className="text-gray-500 mt-1">
                        Meet the experts teaching {course.title}
                    </p>
                </div>
            </div>

            {(!course.instructors || course.instructors.length === 0) ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No instructors assigned</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        This course currently has no assigned instructors.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {course.instructors.map((instructor) => (
                        <div
                            key={instructor.id}
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Photo */}
                                <div className="flex-shrink-0">
                                    {instructor.photo ? (
                                        <img
                                            src={instructor.photo}
                                            alt={instructor.full_name}
                                            className="w-24 h-24 rounded-full object-cover border-4 border-indigo-50"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-indigo-50">
                                            <span className="text-2xl font-bold text-indigo-600">
                                                {instructor.full_name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                                            {instructor.full_name}
                                        </h3>
                                        <p className="text-gray-500 line-clamp-2">
                                            {instructor.bio || "No bio available."}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 pt-2">
                                        <Link
                                            to={`/instructors/${instructor.id}`}
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                                        >
                                            View Full Profile
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
