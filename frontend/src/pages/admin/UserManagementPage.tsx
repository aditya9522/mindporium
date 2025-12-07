import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Loader2, Search, User, Shield, GraduationCap, MoreVertical, Plus, Trash2, X } from 'lucide-react';
import { DeleteConfirmationModal } from '../../components/modals/DeleteConfirmationModal';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export const UserManagementPage = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({ role: '', is_active: true });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'admin',
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ isOpen: boolean; user: any | null }>({
        isOpen: false,
        user: null
    });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await adminService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user: any) => {
        setEditingUser(user);
        setEditForm({ role: user.role, is_active: user.is_active });
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        try {
            const updated = await adminService.updateUser(editingUser.id, editForm);
            setUsers(users.map(u => u.id === updated.id ? updated : u));
            setEditingUser(null);
            toast.success('User updated successfully');
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error('Failed to update user');
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.createAdmin(newUser);
            toast.success('User created successfully');
            setShowCreateModal(false);
            setNewUser({ full_name: '', email: '', password: '', role: 'admin' });
            fetchUsers();
        } catch (error: any) {
            console.error('Failed to create user:', error);
            toast.error(error.response?.data?.detail || 'Failed to create user');
        }
    };

    const filteredUsers = users
        .filter(user => ['admin', 'instructor'].includes(user.role))
        .filter(user =>
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</span>;
            case 'instructor':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Instructor</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold flex items-center gap-1"><User className="w-3 h-3" /> Student</span>;
        }
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
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="mt-2 text-gray-600">Manage platform users and roles.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
                            />
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create User
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                                                    {user.full_name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.full_name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="flex px-6 py-4 justify-start">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="text-gray-400 hover:text-indigo-600 p-2"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm({ isOpen: true, user })}
                                                className="text-gray-400 hover:text-red-600 p-2"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>No users found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                >
                                    <option value="instructor">Instructor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={editForm.is_active ? 'active' : 'inactive'}
                                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'active' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateUser}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.full_name}
                                        onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="user@mindporium.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Minimum 6 characters required.
                                    </p>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Create User
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteConfirm.isOpen}
                onClose={() => setShowDeleteConfirm({ isOpen: false, user: null })}
                onConfirm={async () => {
                    if (!showDeleteConfirm.user) return;

                    setDeleting(true);
                    try {
                        await adminService.deleteUser(showDeleteConfirm.user.id);
                        setUsers(users.filter(u => u.id !== showDeleteConfirm.user.id));
                        setShowDeleteConfirm({ isOpen: false, user: null });
                        toast.success('User deleted successfully');
                    } catch (error) {
                        console.error('Failed to delete user:', error);
                        toast.error('Failed to delete user');
                    } finally {
                        setDeleting(false);
                    }
                }}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                itemName={showDeleteConfirm.user?.full_name}
                loading={deleting}
            />
        </div>
    );
};
