import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Loader2, Search, UserPlus, Mail, GraduationCap, BarChart3, X, Trash2, Activity, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../../components/common/DeleteConfirmationModal';
import { CardGridSkeleton } from '../../components/ui/CardGridSkeleton';

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
    const [submitting, setSubmitting] = useState(false);

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
        setSubmitting(true);
        try {
            await adminService.createInstructor(formData);
            toast.success('Instructor created successfully! Welcome email sent.');
            setShowAddModal(false);
            setFormData({ full_name: '', email: '', password: '' });
            fetchInstructors();
        } catch (error: any) {
            console.error('Failed to create instructor:', error);
            toast.error(error.response?.data?.detail || 'Failed to create instructor');
        } finally {
            setSubmitting(false);
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



    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Instructor Management</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Monitor and manage platform instructors.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search instructors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64 shadow-sm"
                            />
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            <UserPlus className="w-5 h-5" />
                            Add Instructor
                        </button>
                    </div>
                </div>

                {/* Instructors Grid */}
                {loading ? (
                    <CardGridSkeleton count={6} />
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInstructors.map((instructor) => (
                        <div key={instructor.id} className="group bg-white dark:bg-gray-900 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300 overflow-hidden flex flex-col pt-0">
                            {/* Banner Section */}
                            <div className="h-24 bg-linear-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative">
                                {instructor.banner_image && (
                                    <img
                                        src={instructor.banner_image}
                                        alt="Cover"
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    />
                                )}
                                <div className="absolute top-2 right-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${instructor.is_active
                                        ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-800 dark:text-red-400 border border-red-500/20'
                                        }`}>
                                        <span className={`flex w-1.5 h-1.5 rounded-full ${instructor.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                        {instructor.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <div className="px-6 relative flex-1 pb-4">
                                {/* Avatar */}
                                <div className="-mt-10 mb-3 flex justify-between items-end">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-900 p-1 shadow-md ring-1 ring-gray-100 dark:ring-gray-800">
                                            <div className="w-full h-full rounded-full bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl overflow-hidden relative">
                                                {instructor.photo ? (
                                                    <img
                                                        src={instructor.photo}
                                                        alt={instructor.full_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    instructor.full_name?.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                        </div>
                                        {instructor.is_verified && (
                                            <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1 rounded-full shadow-sm border-2 border-white dark:border-gray-900" title="Verified Instructor">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right mb-1">
                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Joined {instructor.created_at ? formatDistanceToNow(new Date(instructor.created_at)) : ''} ago</p>
                                    </div>
                                </div>

                                {/* Main Info */}
                                <div className="mb-4">
                                    <Link to={`/admin/instructors/${instructor.id}`} className="group/link">
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition-colors flex items-center gap-2">
                                            {instructor.full_name}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span className="truncate opacity-80">{instructor.email}</span>
                                    </div>
                                </div>

                                {/* Bio & Stats */}
                                <div className="space-y-3">
                                    {instructor.bio && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed h-10">
                                            {instructor.bio}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {instructor.location && (
                                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-md border border-gray-200 dark:border-gray-700">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {instructor.location}
                                            </span>
                                        )}
                                        {instructor.language && (
                                            <span className="inline-flex items-center px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs rounded-md border border-orange-100 dark:border-orange-900/40 uppercase">
                                                {instructor.language}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions Toolbar */}
                            <div className="grid grid-cols-4 border-t border-gray-100 dark:border-gray-800 divide-x divide-gray-100 dark:divide-gray-800 bg-gray-50/50 dark:bg-gray-800/50 mt-auto">
                                <button
                                    onClick={() => navigate(`/admin/instructors/${instructor.id}/profile`)}
                                    className="flex flex-col items-center justify-center py-3 hover:bg-white dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group/btn"
                                    title="View Profile"
                                >
                                    <GraduationCap className="w-4 h-4 text-gray-400 group-hover/btn:text-indigo-600 dark:group-hover/btn:text-indigo-400 mb-1 transition-colors" />
                                    <span className="text-[10px] font-medium opacity-70 group-hover/btn:opacity-100 text-gray-600 dark:text-gray-400">Profile</span>
                                </button>

                                <button
                                    onClick={() => navigate(`/admin/instructors/${instructor.id}/analytics`)}
                                    className="flex flex-col items-center justify-center py-3 hover:bg-white dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 transition-all group/btn"
                                    title="View Analytics"
                                >
                                    <BarChart3 className="w-4 h-4 text-gray-400 group-hover/btn:text-purple-600 dark:group-hover/btn:text-purple-400 mb-1 transition-colors" />
                                    <span className="text-[10px] font-medium opacity-70 group-hover/btn:opacity-100 text-gray-600 dark:text-gray-400">Stats</span>
                                </button>

                                <button
                                    onClick={() => navigate(`/admin/instructors/${instructor.id}`)}
                                    className="flex flex-col items-center justify-center py-3 hover:bg-white dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all group/btn"
                                    title="Monitor Activity"
                                >
                                    <Activity className="w-4 h-4 text-gray-400 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400 mb-1 transition-colors" />
                                    <span className="text-[10px] font-medium opacity-70 group-hover/btn:opacity-100 text-gray-600 dark:text-gray-400">Monitor</span>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteModal({ isOpen: true, instructor });
                                    }}
                                    className="flex flex-col items-center justify-center py-3 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all group/btn"
                                    title="Delete Instructor"
                                >
                                    <Trash2 className="w-4 h-4 text-gray-400 group-hover/btn:text-red-500 mb-1 transition-colors" />
                                    <span className="text-[10px] font-medium opacity-70 group-hover/btn:opacity-100 text-gray-600 dark:text-gray-400">Delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                )}

                {filteredInstructors.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                        <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                        <p>No instructors found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Add Instructor Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add New Instructor</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateInstructor} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. Dr. Jane Smith"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="instructor@mindporium.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temporary Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    The instructor will receive an email with login details.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Instructor'
                                    )}
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
