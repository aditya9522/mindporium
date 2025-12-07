import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communityService } from '../../services/community.service';
import type { Community, Post } from '../../types/community';
import { PostCard } from '../../components/community/PostCard';
import { Users, MessageSquare, Plus, ArrowLeft, Loader2, Lock, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';

export const CommunityDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [community, setCommunity] = useState<Community | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    // Create Post State
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [creatingPost, setCreatingPost] = useState(false);

    // Edit/Delete Community State
    const { user } = useAuthStore();
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const communityData = await communityService.getCommunity(parseInt(id));
            setCommunity(communityData);
            setEditName(communityData.name);
            setEditDesc(communityData.description || '');

            // Only load posts if public or member (backend handles auth check but good to know)
            // For now, try to load posts and handle error if private
            try {
                const postsData = await communityService.getCommunityPosts(parseInt(id));
                setPosts(postsData);
            } catch (error) {
                // Likely 403 if private and not member
                console.log('Could not load posts (might be private)');
            }
        } catch (error) {
            console.error('Failed to load community:', error);
            toast.error('Failed to load community');
            navigate('/community');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!community) return;
        try {
            setJoining(true);
            await communityService.joinCommunity(community.id);
            toast.success('Joined community successfully');
            loadData(); // Reload to update state/posts
        } catch (error: any) {
            console.error('Failed to join:', error);
            toast.error(error.response?.data?.detail || 'Failed to join community');
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!community) return;
        if (!window.confirm('Are you sure you want to leave this community?')) return;

        try {
            setJoining(true);
            await communityService.leaveCommunity(community.id);
            toast.success('Left community successfully');
            loadData();
        } catch (error) {
            console.error('Failed to leave:', error);
            toast.error('Failed to leave community');
        } finally {
            setJoining(false);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!community || !newPostTitle.trim() || !newPostContent.trim()) return;

        try {
            setCreatingPost(true);
            const post = await communityService.createPost({
                community_id: community.id,
                title: newPostTitle,
                content: newPostContent
            });
            setPosts([post, ...posts]);
            setShowCreatePost(false);
            setNewPostTitle('');
            setNewPostContent('');
            toast.success('Post created successfully');

            // Update post count locally
            setCommunity({
                ...community,
                post_count: community.post_count + 1
            });
        } catch (error) {
            console.error('Failed to create post:', error);
            toast.error('Failed to create post');
        } finally {
            setCreatingPost(false);
        }
    };

    const handlePostUpdate = (updatedPost: Post) => {
        setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
    };

    const handleUpdateCommunity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!community) return;
        try {
            const updated = await communityService.updateCommunity(community.id, {
                name: editName,
                description: editDesc
            });
            setCommunity(updated);
            setShowEditModal(false);
            toast.success('Community updated successfully');
        } catch (error) {
            console.error('Failed to update community:', error);
            toast.error('Failed to update community');
        }
    };

    const handleDeleteCommunity = async () => {
        if (!community) return;
        try {
            await communityService.deleteCommunity(community.id);
            toast.success('Community deleted successfully');
            navigate('/community');
        } catch (error) {
            console.error('Failed to delete community:', error);
            toast.error('Failed to delete community');
        }
    };

    const canManage = user?.role === 'admin' || (community && user?.id === community.created_by);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!community) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/community')}
                    className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Communities
                </button>

                {/* Community Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="bg-white p-1.5 rounded-xl shadow-sm">
                                <div className="w-24 h-24 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                    <Users className="w-10 h-10" />
                                </div>
                            </div>
                            <div className="flex gap-3 mb-2">
                                {/* Since we don't have is_member in response yet (backend TODO), we rely on error handling or assume join button is always there unless error */}
                                {/* For better UX, backend should return is_member. Assuming it might not be there, we show Join. If already member, backend throws error which we catch. 
                                    Ideally, we update backend to return is_member status. For now, let's assume user can try to join.
                                */}
                                <button
                                    onClick={handleJoin}
                                    disabled={joining}
                                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {joining ? 'Processing...' : 'Join Community'}
                                </button>
                                {/* Add Leave button logic if we knew status. For now, let's keep it simple or add a "Leave" button that is always visible for testing */}
                                <button
                                    onClick={handleLeave}
                                    disabled={joining}
                                    className="bg-white text-gray-700 border border-gray-300 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Leave
                                </button>
                                {canManage && (
                                    <>
                                        <button
                                            onClick={() => setShowEditModal(true)}
                                            className="bg-white text-gray-700 border border-gray-300 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                                            title="Edit Community"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="bg-white text-red-600 border border-gray-300 p-2.5 rounded-lg hover:bg-red-50 transition-colors"
                                            title="Delete Community"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{community.name}</h1>
                        <p className="text-gray-600 mb-6 max-w-2xl">{community.description}</p>

                        <div className="flex items-center gap-6 text-sm text-gray-500 border-t border-gray-100 pt-6">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span className="font-medium text-gray-900">{community.member_count}</span> members
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span className="font-medium text-gray-900">{community.post_count}</span> posts
                            </div>
                            {community.is_private && (
                                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                    <Lock className="w-3 h-3" />
                                    <span>Private Community</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Posts Section */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Main Feed */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Discussion</h2>
                            <button
                                onClick={() => setShowCreatePost(true)}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                New Post
                            </button>
                        </div>

                        {posts.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
                                <p className="text-gray-500 mt-2">Be the first to start a conversation!</p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <PostCard key={post.id} post={post} onUpdate={handlePostUpdate} />
                            ))
                        )}
                    </div>

                    {/* Sidebar (Optional - could show rules, related communities, etc) */}
                    <div className="hidden lg:block w-80 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">About</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Welcome to the {community.name} community! Please be respectful and helpful to other members.
                            </p>
                            <div className="text-xs text-gray-400">
                                Created {new Date(community.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            {showCreatePost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Post</h2>
                        <form onSubmit={handleCreatePost}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newPostTitle}
                                        onChange={(e) => setNewPostTitle(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium"
                                        placeholder="Give your post a title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <textarea
                                        required
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none h-64 resize-none font-mono text-sm"
                                        placeholder="Write your post content here... (Markdown supported)"
                                    />
                                    <p className="text-xs text-gray-500 mt-2 text-right">Markdown supported</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowCreatePost(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingPost}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {creatingPost && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Post
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Community Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Community</h2>
                        <form onSubmit={handleUpdateCommunity}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        required
                                        value={editDesc}
                                        onChange={(e) => setEditDesc(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Community</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this community? This action cannot be undone and all posts will be lost.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCommunity}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete Community
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
