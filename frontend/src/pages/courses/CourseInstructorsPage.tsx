import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { PageLoader } from '../../components/common/PageLoader';
import api from '../../lib/axios';
import { getImageUrl } from '../../lib/utils';

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
        return <PageLoader />;
    }

    if (!course) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 py-8 px-4 sm:px-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
                    <p className="text-gray-500 mt-1">
                        Meet the experts teaching {course.title}
                    </p>
                </div>
            </div>

            {(!course.instructors || course.instructors.length === 0) ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No instructors assigned</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        This course currently has no assigned instructors.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {course.instructors.map((instructor) => (
                        <div
                            key={instructor.id}
                            className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 flex flex-col items-center text-center group"
                        >
                            <div className="relative mb-4">
                                <div className="w-24 h-24 rounded-full p-1 bg-white shadow-md ring-1 ring-gray-100 group-hover:ring-indigo-100 transition-all">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                                        {instructor.photo ? (
                                            <img
                                                src={getImageUrl(instructor.photo)}
                                                alt={instructor.full_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold text-2xl">
                                                {instructor.full_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                {instructor.full_name}
                            </h3>

                            <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-1">
                                {instructor.bio || "No bio available for this instructor."}
                            </p>

                            <Link
                                to={`/instructors/${instructor.id}`}
                                className="w-full py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                View Profile
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
