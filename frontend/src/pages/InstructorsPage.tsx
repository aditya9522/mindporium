import { useState, useEffect } from 'react';
import { userService } from '../services/user.service';
import { Loader2, GraduationCap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Expert Instructors</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Learn from industry professionals and experienced educators dedicated to your success.
                    </p>
                </div>

                {instructors.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No instructors found</h3>
                        <p className="text-gray-500 mt-2">Check back later for updates.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {instructors.map((instructor) => (
                            <Link
                                key={instructor.id}
                                to={`/instructors/${instructor.id}`}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group block"
                            >
                                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative group-hover:from-indigo-600 group-hover:to-purple-700 transition-all">
                                    <div className="absolute -bottom-12 left-6">
                                        <div className="w-24 h-24 rounded-xl bg-white p-1 shadow-lg group-hover:shadow-xl transition-shadow">
                                            {instructor.photo ? (
                                                <img
                                                    src={instructor.photo}
                                                    alt={instructor.full_name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 text-2xl font-bold">
                                                    {instructor.full_name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-14 px-6 pb-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{instructor.full_name}</h3>
                                    <p className="text-indigo-600 font-medium text-sm mb-4">Instructor</p>

                                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 min-h-[60px]">
                                        {instructor.bio || 'Experienced educator passionate about teaching and student success.'}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-medium text-gray-900">{instructor.rating || '4.8'}</span>
                                            <span className="text-xs text-gray-400">({instructor.total_reviews || '120'} reviews)</span>
                                        </div>
                                        <span className="text-indigo-600 font-medium text-sm group-hover:text-indigo-700 flex items-center gap-1">
                                            View Profile
                                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
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
