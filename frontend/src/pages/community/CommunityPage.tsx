import { useState, useEffect } from 'react';
import { getImageUrl } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { communityService } from '../../services/community.service';
import type { Community } from '../../types/community';
import { Users, MessageSquare, Plus, Search, Loader2, X, Lock, Globe, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ImageUpload } from '../../components/common/ImageUpload';
import { useAuthStore } from '../../store/auth.store';
import { DeleteConfirmationModal } from '../../components/common/DeleteConfirmationModal';
import { VoiceInput } from '../../components/ui/VoiceInput';
import { SpeakerButton } from '../../components/ui/SpeakerButton';

export const CommunityPage = () => {
    const { user } = useAuthStore();
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [newCommunityName, setNewCommunityName] = useState('');
    const [newCommunityDesc, setNewCommunityDesc] = useState('');
    const [newCommunityIcon, setNewCommunityIcon] = useState('');
    const [newCommunityBanner, setNewCommunityBanner] = useState('');
    const [newCommunityIsPrivate, setNewCommunityIsPrivate] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [draftId] = useState(() => `draft_${Date.now()}`);

    useEffect(() => {
        loadCommunities();
    }, []);

    const loadCommunities = async () => {
        try {
            setLoading(true);
            const data = await communityService.getCommunities(searchTerm);
            setCommunities(data);
        } catch (error) {
            console.error('Failed to load communities:', error);
            toast.error('Failed to load communities');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadCommunities();
    };

    const resetForm = () => {
        setEditingId(null);
        setNewCommunityName('');
        setNewCommunityDesc('');
        setNewCommunityIcon('');
        setNewCommunityBanner('');
        setNewCommunityIsPrivate(false);
        setShowCreateModal(false);
    };

    const handleEditClick = (e: React.MouseEvent, community: Community) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingId(community.id);
        setNewCommunityName(community.name);
        setNewCommunityDesc(community.description);
        setNewCommunityIcon(community.icon || '');
        setNewCommunityBanner(community.banner || '');
        setNewCommunityIsPrivate(community.is_private);
        setShowCreateModal(true);
    };

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [communityToDelete, setCommunityToDelete] = useState<Community | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, community: Community) => {
        e.preventDefault();
        e.stopPropagation();
        setCommunityToDelete(community);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!communityToDelete) return;

        try {
            setLoading(true);
            await communityService.deleteCommunity(communityToDelete.id);
            setCommunities(communities.filter(c => c.id !== communityToDelete.id));
            toast.success('Community deleted successfully');
            setDeleteModalOpen(false);
        } catch (error) {
            console.error('Failed to delete community:', error);
            toast.error('Failed to delete community');
        } finally {
            setLoading(false);
            setCommunityToDelete(null);
        }
    };

    const handleSubmitCommunity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCommunityName.trim()) return;

        try {
            setProcessing(true);
            const payload = {
                name: newCommunityName,
                description: newCommunityDesc,
                icon: newCommunityIcon,
                banner: newCommunityBanner,
                is_private: newCommunityIsPrivate,
            };

            if (editingId) {
                await communityService.updateCommunity(editingId, payload);
                toast.success('Community updated successfully!');
            } else {
                await communityService.createCommunity(payload);
                toast.success('Community created successfully!');
            }

            resetForm();
            loadCommunities();
        } catch (error: any) {
            console.error('Failed to save community:', error);
            toast.error(error.response?.data?.detail || 'Failed to save community');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-400 tracking-tight">Communities</h1>
                        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 font-medium">Connect, learn, and grow together</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowCreateModal(true); }}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg dark:hover:shadow-indigo-900/20 transition-all transform hover:-translate-y-0.5 font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Create Community
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-2 rounded-2xl shadow-sm border border-white/50 dark:border-gray-800 mb-10 sticky top-20 z-20 flex items-center transition-colors">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Find your tribe..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 font-medium text-lg outline-none"
                        />
                    </form>
                    <div className="pr-4">
                        <VoiceInput onResult={(text) => {
                            setSearchTerm(text);
                            // Optionally trigger search immediately
                            communityService.getCommunities(text).then(setCommunities);
                        }} />
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl h-[330px] animate-pulse border border-gray-100 dark:border-gray-800 flex flex-col p-0 overflow-hidden">
                                <div className="h-32 bg-gray-200 dark:bg-gray-800 w-full shrink-0" />
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-800 w-3/4 rounded mt-2 mb-4" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 w-full rounded mb-2" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 w-5/6 rounded" />
                                    <div className="mt-auto pt-4 flex gap-4">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-800 w-12 rounded" />
                                        <div className="h-4 bg-gray-200 dark:bg-gray-800 w-12 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : communities.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <Users className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No communities found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or create a new one.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {communities.map((community) => (
                            <div
                                key={community.id}
                                className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-indigo-900/10 border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300 group overflow-hidden flex flex-col h-full relative"
                            >
                                {/* Edit/Delete Overlay */}
                                {(user?.role === 'admin' || user?.id == community.created_by) && (
                                    <div className="absolute top-3 right-12 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-30 pointer-events-none">
                                        <div className="flex bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm border border-gray-100 dark:border-gray-700 rounded-lg p-1 pointer-events-auto">
                                            <button
                                                onClick={(e) => handleEditClick(e, community)}
                                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                                                title="Edit Community"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <div className="w-px bg-gray-200 dark:bg-gray-700 my-1 mx-1"></div>
                                            <button
                                                onClick={(e) => handleDeleteClick(e, community)}
                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                                                title="Delete Community"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <SpeakerButton text={`${community.name}. ${community.description}`} />
                                </div>

                                <Link
                                    to={`/community/${community.id}`}
                                    className="flex flex-col h-full"
                                >
                                    <div className="h-32 bg-gray-100 relative">
                                        {community.banner ? (
                                            <img
                                                src={getImageUrl(community.banner)}
                                                alt={community.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                                                <Users className="w-12 h-12 text-indigo-200" />
                                            </div>
                                        )}
                                        {community.is_private && (
                                            <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md text-white p-1.5 rounded-lg" title="Private Group">
                                                <Lock className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 pt-12 relative flex-1 flex flex-col">
                                        <div className="absolute -top-10 left-6">
                                            <div className="w-20 h-20 bg-white rounded-xl p-1 shadow-md">
                                                <div className="w-full h-full bg-indigo-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-50">
                                                    {community.icon ? (
                                                        <img
                                                            src={getImageUrl(community.icon)}
                                                            alt={community.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-2xl font-bold text-indigo-600">
                                                            {community.name?.charAt(0)?.toUpperCase() || 'C'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2 mt-2">
                                                {community.name}
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 min-h-[40px]">
                                                {community.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-50 dark:border-gray-800 mt-auto">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                    <span>{community.member_count}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                    <span>{community.post_count}</span>
                                                </div>
                                            </div>
                                            {community.is_private ? (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded text-xs font-medium">
                                                    <Lock className="w-3 h-3" /> Private
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                                                    <Globe className="w-3 h-3" /> Public
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center rounded-t-2xl">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{editingId ? 'Edit Community' : 'Create Community'}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start a new space for learning and connection</p>
                            </div>
                            <button
                                onClick={resetForm}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-8 overflow-y-auto bg-white dark:bg-gray-950 transition-colors">
                            <form id="create-community-form" onSubmit={handleSubmitCommunity} className="space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Community Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={newCommunityName}
                                            onChange={(e) => setNewCommunityName(e.target.value)}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 dark:text-gray-100"
                                            placeholder="e.g. Data Science Enthusiasts"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">Description <span className="text-red-500">*</span></label>
                                            <VoiceInput onResult={(text) => setNewCommunityDesc(prev => prev + ' ' + text)} />
                                        </div>
                                        <textarea
                                            required
                                            value={newCommunityDesc}
                                            onChange={(e) => setNewCommunityDesc(e.target.value)}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none h-32 resize-none transition-all placeholder:text-gray-400 dark:text-gray-100"
                                            placeholder="What is this community all about?"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <div className="flex items-center h-5">
                                            <input
                                                type="checkbox"
                                                checked={newCommunityIsPrivate}
                                                onChange={(e) => setNewCommunityIsPrivate(e.target.checked)}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="flex-1 text-sm">
                                            <span className="font-semibold text-gray-900 dark:text-gray-100 block mb-1">Private Community</span>
                                            <span className="text-gray-500 dark:text-gray-400">Only approved members can see posts and join this community.</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
                                        Branding & Appearance
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="md:col-span-1 space-y-3">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Icon</label>
                                            <ImageUpload
                                                value={newCommunityIcon}
                                                onChange={setNewCommunityIcon}
                                                variant="avatar"
                                                entityType="communities"
                                                entityId={draftId}
                                                category="icon"
                                            />
                                            <p className="text-xs text-gray-400">Recommended: Square format</p>
                                        </div>
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Banner Image</label>
                                            <ImageUpload
                                                value={newCommunityBanner}
                                                onChange={setNewCommunityBanner}
                                                variant="banner"
                                                placeholder="Upload Banner"
                                                entityType="communities"
                                                entityId={draftId}
                                                category="banner"
                                            />
                                            <p className="text-xs text-gray-400">Recommended: 16:9 landscape</p>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-b-2xl flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                form="create-community-form"
                                type="submit"
                                disabled={processing || !newCommunityName.trim()}
                                className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg dark:shadow-none shadow-indigo-200"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {editingId ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    editingId ? 'Update Community' : 'Create Community'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Community"
                message="Are you sure you want to delete this community? This action cannot be undone."
                itemName={communityToDelete?.name}
                isDeleting={loading && !!communityToDelete}
            />
        </div>
    );
};
