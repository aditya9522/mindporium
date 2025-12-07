import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Loader2, Search, UserPlus, Mail, GraduationCap, BarChart3, X, Trash2, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../../components/modals/DeleteConfirmationModal';

export const AdminInstructorsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; instructor: any | null }>({
        isOpen: false,
        instructor: null
    });
    const [deleting, setDeleting] = useState(false);

    // Add Instructor Form State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        fetchInstructors();
    }, []);

    const fetchInstructors = async () => {
        try {
            const data = await adminService.getInstructors();
            setInstructors(data);
        } catch (error) {
            console.error('Failed to fetch instructors:', error);
            toast.error('Failed to load instructors');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInstructor = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.createInstructor(formData);
            toast.success('Instructor created successfully! Welcome email sent.');
            setShowAddModal(false);
            setFormData({ full_name: '', email: '', password: '' });
            fetchInstructors();
        } catch (error: any) {
            console.error('Failed to create instructor:', error);
            toast.error(error.response?.data?.detail || 'Failed to create instructor');
        }
    };

    const handleDeleteInstructor = async () => {
        if (!deleteModal.instructor) return;

        setDeleting(true);
        try {
            await adminService.deleteUser(deleteModal.instructor.id);
            setInstructors(instructors.filter(i => i.id !== deleteModal.instructor.id));
            toast.success('Instructor deleted successfully');
            setDeleteModal({ isOpen: false, instructor: null });
        } catch (error: any) {
            console.error('Failed to delete instructor:', error);
            toast.error(error.response?.data?.detail || 'Failed to delete instructor');
        } finally {
            setDeleting(false);
        }
    };

    const filteredInstructors = instructors.filter(instructor =>
        instructor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Instructor Management</h1>
                        <p className="mt-2 text-gray-600">Monitor and manage platform instructors.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search instructors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
                            />
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <UserPlus className="w-5 h-5" />
                            Add Instructor
                        </button>
                    </div>
                </div>

                {/* Instructors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInstructors.map((instructor) => (
                        <div key={instructor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <Link to={`/admin/instructors/${instructor.id}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                                            {instructor.full_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{instructor.full_name}</h3>
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Mail className="w-3 h-3" />
                                                {instructor.email}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${instructor.is_active
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {instructor.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </Link>
                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                    <span>Joined</span>
                                    <span>{instructor.created_at ? formatDistanceToNow(new Date(instructor.created_at), { addSuffix: true }) : 'N/A'}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => navigate(`/admin/instructors/${instructor.id}`)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm"
                                    >
                                        <Activity className="w-4 h-4" /> Monitoring
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/instructors/${instructor.id}/analytics`)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm"
                                    >
                                        <BarChart3 className="w-4 h-4" /> Performance
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/instructors/${instructor.id}/profile`)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                    >
                                        <GraduationCap className="w-4 h-4" /> Profile
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteModal({ isOpen: true, instructor });
                                        }}
                                        className="flex items-center justify-center gap-2 px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredInstructors.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No instructors found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Add Instructor Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Add New Instructor</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateInstructor} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Dr. Jane Smith"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="instructor@mindporium.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    The instructor will receive an email with login details.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Create Instructor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, instructor: null })}
                onConfirm={handleDeleteInstructor}
                title="Delete Instructor"
                message="Are you sure you want to delete this instructor? All associated courses and data will be affected."
                itemName={deleteModal.instructor?.full_name}
                loading={deleting}
            />
        </div>
    );
};
