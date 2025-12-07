import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classroomService, type Classroom } from '../../services/classroom.service';
import { useAuthStore } from '../../store/auth.store';
import { Loader2, Calendar, Clock, Video, Plus, User as UserIcon, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../../components/modals/DeleteConfirmationModal';

export const ClassroomListPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingClass, setEditingClass] = useState<Classroom | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; classroom: Classroom | null }>({
        isOpen: false,
        classroom: null
    });
    const [deleting, setDeleting] = useState(false);

    // Form state
    const [newClass, setNewClass] = useState({
        title: '',
        description: '',
        start_time: '',
        duration: 60,
        provider: 'custom'
    });

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            const data = await classroomService.getAllClassrooms();
            setClassrooms(data);
        } catch (error) {
            console.error('Failed to fetch classrooms:', error);
            toast.error('Failed to load classrooms');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const startTime = new Date(newClass.start_time);
            const endTime = new Date(startTime.getTime() + newClass.duration * 60000);

            await classroomService.createClassroom({
                title: newClass.title,
                description: newClass.description,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                provider: newClass.provider as any, // Type assertion as enum might be strict
                status: 'not_started'
            } as any);

            toast.success('Class scheduled successfully');
            setShowCreateModal(false);
            fetchClassrooms();
        } catch (error) {
            console.error(error);
            toast.error('Failed to schedule class');
        }
    };

    const handleUpdateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClass) return;
        try {
            const startTime = new Date(newClass.start_time);
            const endTime = new Date(startTime.getTime() + newClass.duration * 60000);

            await classroomService.updateClassroom(editingClass.id, {
                title: newClass.title,
                description: newClass.description,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                provider: newClass.provider as any,
            });

            toast.success('Class updated successfully');
            setShowCreateModal(false);
            setEditingClass(null);
            resetForm();
            fetchClassrooms();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update class');
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.classroom) return;
        setDeleting(true);
        try {
            await classroomService.deleteClassroom(deleteModal.classroom.id);
            setClassrooms(classrooms.filter(c => c.id !== deleteModal.classroom!.id));
            toast.success('Class deleted successfully');
            setDeleteModal({ isOpen: false, classroom: null });
        } catch (error) {
            console.error('Failed to delete class:', error);
            toast.error('Failed to delete class');
        } finally {
            setDeleting(false);
        }
    };

    const resetForm = () => {
        setNewClass({
            title: '',
            description: '',
            start_time: '',
            duration: 60,
            provider: 'custom'
        });
    };

    const openEditModal = (classroom: Classroom) => {
        setEditingClass(classroom);
        const startTime = new Date(classroom.start_time);
        const endTime = classroom.end_time ? new Date(classroom.end_time) : new Date(startTime.getTime() + 60 * 60000);
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

        setNewClass({
            title: classroom.title,
            description: classroom.description || '',
            start_time: startTime.toISOString().slice(0, 16), // Format for datetime-local
            duration: duration,
            provider: classroom.provider
        });
        setShowCreateModal(true);
    };

    const handleJoin = async (id: number) => {
        navigate(`/classroom/${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Live Classrooms</h1>
                        <p className="mt-2 text-gray-600">Join live sessions and interact with instructors.</p>
                    </div>
                    {user?.role === 'instructor' && (
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="w-5 h-5 mr-2" />
                            Schedule Class
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classrooms.map((classroom) => (
                        <div key={classroom.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${classroom.status === 'live'
                                        ? 'bg-red-100 text-red-700 animate-pulse'
                                        : classroom.status === 'completed'
                                            ? 'bg-gray-100 text-gray-700'
                                            : 'bg-green-100 text-green-700'
                                        }`}>
                                        {classroom.status === 'live' ? '● LIVE NOW' : classroom.status.toUpperCase()}
                                    </span>
                                    <Video className="w-5 h-5 text-gray-400" />
                                </div>
                                {user?.role === 'instructor' && classroom.instructor_id === user.id && (
                                    <div className="absolute top-4 right-12 flex gap-2 bg-white/80 p-1 rounded-lg">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openEditModal(classroom); }}
                                            className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, classroom }); }}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{classroom.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{classroom.description}</p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {format(new Date(classroom.start_time), 'PPP')}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {format(new Date(classroom.start_time), 'p')}
                                    </div>
                                    {classroom.instructor && (
                                        <div className="flex items-center text-sm text-gray-500">
                                            <UserIcon className="w-4 h-4 mr-2" />
                                            {classroom.instructor.full_name}
                                        </div>
                                    )}
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={() => handleJoin(classroom.id)}
                                    disabled={classroom.status === 'completed' || classroom.status === 'cancelled'}
                                >
                                    {classroom.status === 'live' ? 'Join Now' : 'View Details'}
                                </Button>
                            </div>
                        </div>
                    ))}

                    {classrooms.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            <Video className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>No scheduled classes found.</p>
                        </div>
                    )}
                </div>

                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <h2 className="text-xl font-bold mb-4">{editingClass ? 'Edit Class' : 'Schedule New Class'}</h2>
                            <form onSubmit={editingClass ? handleUpdateClass : handleCreateClass}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={newClass.title}
                                            onChange={e => setNewClass({ ...newClass, title: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={newClass.description}
                                            onChange={e => setNewClass({ ...newClass, description: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={newClass.start_time}
                                            onChange={e => setNewClass({ ...newClass, start_time: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <Button type="button" variant="ghost" onClick={() => { setShowCreateModal(false); setEditingClass(null); resetForm(); }}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {editingClass ? 'Update' : 'Schedule'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, classroom: null })}
                onConfirm={handleDelete}
                title="Delete Class"
                message="Are you sure you want to delete this class? This action cannot be undone."
                itemName={deleteModal.classroom?.title}
                loading={deleting}
            />
        </div>
    );
};
