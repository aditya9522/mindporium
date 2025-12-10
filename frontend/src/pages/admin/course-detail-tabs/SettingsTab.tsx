import { useState, useEffect } from 'react';
import { Save, Trash2, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { DeleteConfirmationModal } from '../../../components/modals/DeleteConfirmationModal';

interface SettingsTabProps {
    courseData: any;
    refreshData: () => void;
}

export const SettingsTab = ({ courseData, refreshData }: SettingsTabProps) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        level: '',
        category: '',
        is_published: false
    });
    const [loading, setLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (courseData?.course) {
            setFormData({
                title: courseData.course.title || '',
                description: courseData.course.description || '',
                price: courseData.course.price || 0,
                level: courseData.course.level || 'beginner',
                category: courseData.course.category || 'paid',
                is_published: courseData.course.is_published || false
            });
        }
    }, [courseData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleTogglePublish = (checked: boolean) => {
        setFormData(prev => ({ ...prev, is_published: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/courses/${courseData.course.id}`, formData);
            toast.success('Course updated successfully');
            refreshData();
        } catch (error) {
            console.error('Failed to update course:', error);
            toast.error('Failed to update course');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/courses/${courseData.course.id}`);
            toast.success('Course deleted successfully');
            navigate('/admin/courses');
        } catch (error) {
            console.error('Failed to delete course:', error);
            toast.error('Failed to delete course');
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Course Settings</h2>
                        <p className="text-gray-300">Update course details and visibility</p>
                    </div>
                </div>
            </div>

            {/* General Settings Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                    General Information
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="paid">Paid</option>
                                <option value="free">Free</option>
                                <option value="subscription">Subscription</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 pt-6">
                            <div
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.is_published ? 'bg-green-500' : 'bg-gray-300'}`}
                                onClick={() => handleTogglePublish(!formData.is_published)}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${formData.is_published ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                                {formData.is_published ? 'Published (Visible to students)' : 'Draft (Hidden from students)'}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-6">
                <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                </h3>
                <p className="text-red-600 mb-6 text-sm">
                    Once you delete a course, there is no going back. Please be certain.
                </p>

                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Course
                </button>
            </div>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Course"
                message={`Are you sure you want to delete "${courseData?.course?.title}"? This action cannot be undone and will remove all associated data including enrollments, resources, and tests.`}
                loading={isDeleting}
            />
        </div>
    );
};
