import { useState, useEffect } from 'react';
import { Video, Calendar, Clock, CheckCircle, Users, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../../../lib/axios';
import { classroomService } from '../../../services/classroom.service';
import { subjectService } from '../../../services/subject.service';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../../../components/modals/DeleteConfirmationModal';
import { format } from 'date-fns';

interface ClassroomsTabProps {
    courseData: any;
}

export const ClassroomsTab = ({ courseData }: ClassroomsTabProps) => {
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; classroomId: number | null; title: string }>({
        isOpen: false,
        classroomId: null,
        title: ''
    });
    const [deleting, setDeleting] = useState(false);

    // Classroom Modal State
    const [classroomModal, setClassroomModal] = useState({
        isOpen: false,
        isEditing: false,
        id: null as number | null,
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
        subjectId: '' as string | number
    });
    const [saving, setSaving] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);

    useEffect(() => {
        if (courseData?.course?.id) {
            fetchClassrooms();
            // Fetch subjects for the dropdown
            fetchSubjects();
        }
    }, [courseData]);

    const fetchSubjects = async () => {
        try {
            const data = await subjectService.getCourseSubjects(courseData.course.id);
            setSubjects(data);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
        }
    };

    const fetchClassrooms = async () => {
        try {
            const response = await api.get(`/classrooms/course/${courseData.course.id}`);
            setClassrooms(response.data);
        } catch (error) {
            console.error('Failed to fetch classrooms:', error);
            toast.error('Failed to load classrooms');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live': return 'text-green-600 bg-green-50 border-green-100';
            case 'not_started': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'completed': return 'text-gray-600 bg-gray-50 border-gray-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    const handleSaveClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!classroomModal.title || !classroomModal.date || !classroomModal.time) return;

        setSaving(true);
        try {
            const startDateTime = new Date(`${classroomModal.date}T${classroomModal.time}`);
            const endDateTime = new Date(startDateTime.getTime() + classroomModal.duration * 60000);

            const payload: any = {
                title: classroomModal.title,
                description: classroomModal.description,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                subject_id: classroomModal.subjectId ? Number(classroomModal.subjectId) : undefined
            };

            if (classroomModal.isEditing && classroomModal.id) {
                await classroomService.updateClassroom(classroomModal.id, payload);
                toast.success('Class updated successfully');
            } else {
                payload.provider = 'custom';
                payload.status = 'not_started';
                await classroomService.createClassroom(payload);
                toast.success('Class scheduled successfully');
            }

            fetchClassrooms();
            setClassroomModal({
                isOpen: false,
                isEditing: false,
                id: null,
                title: '',
                description: '',
                date: '',
                time: '',
                duration: 60,
                subjectId: ''
            });
        } catch (error) {
            console.error('Failed to save class:', error);
            toast.error(classroomModal.isEditing ? 'Failed to update class' : 'Failed to schedule class');
        } finally {
            setSaving(false);
        }
    };

    const openCreateModal = () => {
        setClassroomModal({
            isOpen: true,
            isEditing: false,
            id: null,
            title: '',
            description: '',
            date: '',
            time: '',
            duration: 60,
            subjectId: ''
        });
    };

    const openEditModal = (c: any) => {
        const dateObj = new Date(c.start_time);
        const dateStr = format(dateObj, 'yyyy-MM-dd');
        const timeStr = format(dateObj, 'HH:mm');

        const endObj = c.end_time ? new Date(c.end_time) : new Date(dateObj.getTime() + 60 * 60000);
        const duration = Math.round((endObj.getTime() - dateObj.getTime()) / 60000);

        setClassroomModal({
            isOpen: true,
            isEditing: true,
            id: c.id,
            title: c.title,
            description: c.description || '',
            date: dateStr,
            time: timeStr,
            duration: duration,
            subjectId: c.subject_id || ''
        });
    };

    const handleDelete = async () => {
        if (!deleteModal.classroomId) return;
        setDeleting(true);
        try {
            await classroomService.deleteClassroom(deleteModal.classroomId);
            setClassrooms(classrooms.filter(c => c.id !== deleteModal.classroomId));
            toast.success('Class deleted successfully');
            setDeleteModal({ isOpen: false, classroomId: null, title: '' });
        } catch (error) {
            console.error('Failed to delete class:', error);
            toast.error('Failed to delete class');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const liveClasses = classrooms.filter(c => c.status === 'live').length;
    const upcomingClasses = classrooms.filter(c => c.status === 'not_started').length;
    const completedClasses = classrooms.filter(c => c.status === 'completed').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Course Classrooms</h2>
                        <p className="text-blue-100">Manage live sessions and scheduled classes</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold">{classrooms.length}</div>
                        <div className="text-blue-100">Total Classes</div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Video className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{liveClasses}</div>
                            <div className="text-sm text-gray-600">Live Now</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Calendar className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{upcomingClasses}</div>
                            <div className="text-sm text-gray-600">Upcoming</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="w-8 h-8 text-gray-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{completedClasses}</div>
                            <div className="text-sm text-gray-600">Completed</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Classrooms List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">All Classes</h3>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Schedule Class
                    </button>
                </div>

                {classrooms.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Video className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No classes scheduled for this course</p>
                        <button
                            onClick={openCreateModal}
                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Schedule your first class
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {classrooms.map((classroom) => (
                            <div
                                key={classroom.id}
                                className="p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${classroom.status === 'live' ? 'bg-green-100 text-green-600' :
                                            classroom.status === 'not_started' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            <Video className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-lg font-bold text-gray-900">
                                                    {classroom.title}
                                                </h4>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(classroom.status)}`}>
                                                    {classroom.status === 'not_started' ? 'SCHEDULED' : classroom.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-3 line-clamp-2">
                                                {classroom.description || 'No description provided'}
                                            </p>
                                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{format(new Date(classroom.start_time), 'MMM d, yyyy')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{format(new Date(classroom.start_time), 'h:mm a')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    <span>Instructor: {classroom.instructor?.full_name || 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditModal(classroom)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit Class"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, classroomId: classroom.id, title: classroom.title })}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Class"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, classroomId: null, title: '' })}
                onConfirm={handleDelete}
                title="Delete Class"
                message="Are you sure you want to delete this class? This action cannot be undone."
                itemName={deleteModal.title}
                loading={deleting}
            />

            {/* Classroom Modal */}
            {classroomModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {classroomModal.isEditing ? 'Edit Class' : 'Schedule New Class'}
                            </h3>
                            <button
                                onClick={() => setClassroomModal({ ...classroomModal, isOpen: false })}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveClass}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Class Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={classroomModal.title}
                                        onChange={(e) => setClassroomModal({ ...classroomModal, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g. Weekly Q&A Session"
                                        required
                                    />
                                </div>

                                {subjects.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Subject (Optional)
                                        </label>
                                        <select
                                            value={classroomModal.subjectId}
                                            onChange={(e) => setClassroomModal({ ...classroomModal, subjectId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select a subject</option>
                                            {subjects.map((s) => (
                                                <option key={s.id} value={s.id}>{s.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={classroomModal.description}
                                        onChange={(e) => setClassroomModal({ ...classroomModal, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Brief description of what will be covered..."
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={classroomModal.date}
                                            onChange={(e) => setClassroomModal({ ...classroomModal, date: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Time <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            value={classroomModal.time}
                                            onChange={(e) => setClassroomModal({ ...classroomModal, time: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={classroomModal.duration}
                                        onChange={(e) => setClassroomModal({ ...classroomModal, duration: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="15"
                                        step="15"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setClassroomModal({ ...classroomModal, isOpen: false })}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !classroomModal.title || !classroomModal.date || !classroomModal.time}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {saving ? 'Saving...' : (classroomModal.isEditing ? 'Save Changes' : 'Schedule Class')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
