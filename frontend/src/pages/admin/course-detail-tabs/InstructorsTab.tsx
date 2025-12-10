
import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import api from '../../../lib/axios';
import { getImageUrl } from '../../../lib/utils';

interface InstructorsTabProps {
    courseData: any;
    refreshData?: () => void;
}

export const InstructorsTab = ({ courseData, refreshData }: InstructorsTabProps) => {
    const course = courseData.course;
    const [instructors, setInstructors] = useState<any[]>(course.instructors || []);
    const [allInstructors, setAllInstructors] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (showAddModal) {
            fetchAllInstructors();
        }
    }, [showAddModal]);

    const fetchAllInstructors = async () => {
        try {
            const response = await api.get('/admin/instructors');
            setAllInstructors(response.data);
        } catch (error) {
            toast.error('Failed to fetch instructors');
        }
    };

    const handleAddInstructor = async (instructor: any) => {
        if (instructors.some(i => i.id === instructor.id)) {
            toast.error('Instructor already assigned');
            return;
        }

        const newInstructors = [...instructors, instructor];
        setInstructors(newInstructors);
        await saveInstructors(newInstructors);
        setShowAddModal(false);
    };

    const handleRemoveInstructor = async (instructorId: number) => {
        if (instructors.length <= 1) {
            // Optional: prevent removing the last instructor if needed. 
            // For now allowing it but maybe show warning.
        }
        const newInstructors = instructors.filter(i => i.id !== instructorId);
        setInstructors(newInstructors);
        await saveInstructors(newInstructors);
    };

    const saveInstructors = async (newInstructors: any[]) => {
        setIsSaving(true);
        try {
            await api.put(`/courses/${course.id}`, {
                instructors: newInstructors.map(i => i.id)
            });
            toast.success('Instructors updated successfully');
            if (refreshData) refreshData();
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to update instructors');
            // Revert on error
            setInstructors(course.instructors || []);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredInstructors = allInstructors.filter(instructor =>
        !instructors.some(i => i.id === instructor.id) &&
        (instructor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            instructor.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Course Instructors</h2>
                    <p className="text-gray-500">Manage instructors assigned to this course.</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Assign Instructor
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {instructors.map((instructor) => (
                    <div key={instructor.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center overflow-hidden">
                                {instructor.photo ? (
                                    <img src={getImageUrl(instructor.photo)} alt={instructor.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-indigo-600 font-semibold">{instructor.full_name?.charAt(0)}</span>
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{instructor.full_name}</p>
                                <p className="text-xs text-gray-500">{instructor.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleRemoveInstructor(instructor.id)}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove Instructor"
                            disabled={isSaving}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {instructors.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No instructors assigned yet.</p>
                        <Button variant="link" onClick={() => setShowAddModal(true)}>Assign one now</Button>
                    </div>
                )}
            </div>

            {/* Add Instructor Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Assign Instructor</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
                        </div>

                        <div className="mb-4 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search instructors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {filteredInstructors.length > 0 ? (
                                filteredInstructors.map((instructor) => (
                                    <button
                                        key={instructor.id}
                                        onClick={() => handleAddInstructor(instructor)}
                                        className="w-full flex items-center gap-4 p-3 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all duration-200 group text-left"
                                    >
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
                                                {instructor.photo ? (
                                                    <img src={getImageUrl(instructor.photo)} alt={instructor.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-gray-600 font-semibold">{instructor.full_name?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                                                {instructor.full_name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                {instructor.email}
                                            </p>
                                        </div>

                                        <div className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            Assign
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Search className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-gray-900 font-medium">No instructors found</p>
                                    <p className="text-sm text-gray-500 mt-1">Try searching for a different name or email</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
