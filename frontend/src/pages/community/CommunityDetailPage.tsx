import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communityService } from '../../services/community.service';
import type { Community, Post } from '../../types/community';
import { DeleteConfirmationModal } from '../../components/common/DeleteConfirmationModal';
import { PostCard } from '../../components/community/PostCard';
import { Users, MessageSquare, ArrowLeft, Loader2, Lock, Edit, Trash2, Globe, X, Save, Send } from 'lucide-react';
import { ImageUpload } from '../../components/common/ImageUpload';
import { getImageUrl } from '../../lib/utils';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/common/PageLoader';

export const CommunityDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [community, setCommunity] = useState<Community | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    // Leave Modal State
    const [showLeaveModal, setShowLeaveModal] = useState(false);

    // Create Post State
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostMedia, setNewPostMedia] = useState('');
    const [creatingPost, setCreatingPost] = useState(false);
    const [draftPostId] = useState(() => `draft_post_${Date.now()}`);

    // Edit/Delete Community State
    const { user } = useAuthStore();
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editIcon, setEditIcon] = useState('');
    const [editBanner, setEditBanner] = useState('');
    const [updating, setUpdating] = useState(false);
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
            setEditIcon(communityData.icon || '');
            setEditBanner(communityData.banner || '');

            try {
                const postsData = await communityService.getCommunityPosts(parseInt(id));
                setPosts(postsData);
            } catch (error) {
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
            loadData();
        } catch (error: any) {
            console.error('Failed to join:', error);
            toast.error(error.response?.data?.detail || 'Failed to join community');
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!community) return;
        // Modal is now handled by UI state, actual API call is here:
        try {
            setJoining(true);
            await communityService.leaveCommunity(community.id);
            toast.success('Left community successfully');
            setShowLeaveModal(false);
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
                content: newPostContent,
                attachments: newPostMedia
            });
            setPosts([post, ...posts]);
            setShowCreatePost(false);
            setNewPostTitle('');
            setNewPostContent('');
            setNewPostMedia('');
            toast.success('Post created successfully');

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
            setUpdating(true);
            const updated = await communityService.updateCommunity(community.id, {
                name: editName,
                description: editDesc,
                icon: editIcon,
                banner: editBanner,
            });
            setCommunity(updated);
            setShowEditModal(false);
            toast.success('Community updated successfully');
        } catch (error) {
            console.error('Failed to update community:', error);
            toast.error('Failed to update community');
        } finally {
            setUpdating(false);
        }
    };

    const [deleting, setDeleting] = useState(false);

    const handleDeleteCommunity = async () => {
        if (!community) return;
        try {
            setDeleting(true);
            await communityService.deleteCommunity(community.id);
            toast.success('Community deleted successfully');
            navigate('/community');
        } catch (error) {
            console.error('Failed to delete community:', error);
            toast.error('Failed to delete community');
            setDeleting(false);
        }
    };

    const canManage = user?.role === 'admin' || (community && user?.id === community.created_by);

    if (loading) {
        return <PageLoader />;
    }

    if (!community) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8 transition-colors duration-300">
            {/* Community Header Banner */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="h-64 md:h-80 bg-zinc-800 relative group overflow-hidden">
                    {community.banner ? (
                        <div className="absolute inset-0">
                            <img
                                src={getImageUrl(community.banner)}
                                alt="Banner"
                                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-in-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-gray-900 to-black" />
                    )}

                    {/* Back Button Overlay */}
                    <div className="absolute top-6 left-6 z-20">
                        <button
                            onClick={() => navigate('/community')}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 border border-white/10"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Communities
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative -mt-16 pb-6 flex flex-col md:flex-row items-end justify-between gap-6">
                        <div className="flex items-end gap-6 w-full md:w-auto">
                            <div className="relative shrink-0">
                                <div className="w-36 h-36 bg-white dark:bg-gray-800 rounded-2xl p-1.5 shadow-2xl relative z-10 -rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <div className="w-full h-full bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
                                        {community.icon ? (
                                            <img
                                                src={getImageUrl(community.icon)}
                                                alt={community.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-primary-600 dark:text-primary-400 font-extrabold text-5xl">
                                                {community.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {community.is_private && (
                                    <div className="absolute bottom-2 -right-2 z-20 bg-amber-100 text-amber-700 p-1.5 rounded-full border-2 border-white shadow-sm" title="Private Group">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                            <div className="w-full pt-16 md:pt-0">
                                <h1 className="flex items-center gap-2 text-3xl font-bold mb-3 truncate text-gray-900 dark:text-gray-100">
                                    {community.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    {community.is_private ? (
                                        <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-gray-700 dark:text-gray-300"><Lock className="w-3.5 h-3.5" /> Private group</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-gray-700 dark:text-gray-300"><Globe className="w-3.5 h-3.5" /> Public group</span>
                                    )}
                                    <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-gray-700 dark:text-gray-300"><Users className="w-3.5 h-3.5" /> {community.member_count} members</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            {canManage ? (
                                <>
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors shadow-sm whitespace-nowrap"
                                        title="Edit Community"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors shadow-sm whitespace-nowrap"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </>
                            ) : null}

                            <button
                                onClick={handleJoin}
                                disabled={joining}
                                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70 whitespace-nowrap flex items-center justify-center gap-2 ${joining ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white'
                                    }`}
                            >
                                {joining && <Loader2 className="w-4 h-4 animate-spin" />}
                                {joining ? 'Processing...' : 'Join Group'}
                            </button>
                            <button
                                onClick={() => setShowLeaveModal(true)}
                                disabled={joining}
                                className="flex-1 md:flex-none bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-6 py-2.5 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-100 dark:hover:border-red-800 transition-all shadow-sm whitespace-nowrap"
                            >
                                Leave Group
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    <div className="lg:col-span-8 space-y-6">
                        {/* About Section (Mobile) - Visible only on small screens if needed, otherwise rely on sidebar */}

                        {/* Feed */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 transition-colors duration-300">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold shrink-0">
                                    {user?.full_name?.charAt(0) || 'U'}
                                </div>
                                <button
                                    onClick={() => setShowCreatePost(true)}
                                    className="flex-1 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 rounded-full px-6 py-3 text-gray-500 dark:text-gray-400 font-medium transition-all text-sm shadow-inner"
                                >
                                    Start a conversation...
                                </button>
                            </div>
                        </div>

                        {/* Feed Posts */}
                        <div className="space-y-4">
                            {posts.length === 0 ? (
                                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center transition-colors duration-300">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No posts yet</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                                        Be the first to share something with the community! Start a conversation or ask a question.
                                    </p>
                                    <button
                                        onClick={() => setShowCreatePost(true)}
                                        className="mt-6 text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300"
                                    >
                                        Create First Post
                                    </button>
                                </div>
                            ) : (
                                posts.map(post => (
                                    <PostCard key={post.id} post={post} onUpdate={handlePostUpdate} />
                                ))
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sticky top-24 transition-colors duration-300">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">About this group</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                                {community.description || "No description provided."}
                            </p>

                            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <Globe className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{community.is_private ? 'Private' : 'Public'}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {community.is_private
                                                ? 'Only members can see posts'
                                                : "Anyone can see who's in the group and what they post."}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <Users className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">General Group</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Created {new Date(community.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {canManage && (
                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Admin Tools</h3>
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" /> Edit Group Details
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Leave Confirmation Modal */}
            {
                showLeaveModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl p-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ArrowLeft className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Leave Community?</h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Are you sure you want to leave <span className="font-semibold text-gray-900 dark:text-gray-100">{community.name}</span>? You won't be able to see private posts anymore.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLeaveModal(false)}
                                    className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLeave}
                                    disabled={joining}
                                    className="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-black dark:hover:bg-white rounded-xl font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Leave Community"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Create Post Modal */}
            {
                showCreatePost && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl p-0 shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 rounded-t-2xl">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create Post</h2>
                                <button onClick={() => setShowCreatePost(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <form id="create-post-form" onSubmit={handleCreatePost} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={newPostTitle}
                                            onChange={(e) => setNewPostTitle(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                            placeholder="What's on your mind?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Content</label>
                                        <textarea
                                            required
                                            value={newPostContent}
                                            onChange={(e) => setNewPostContent(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none h-48 resize-none font-mono text-sm leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                            placeholder="Share your thoughts... (Markdown supported)"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">Markdown supported</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Media (Optional)</label>
                                        <ImageUpload
                                            value={newPostMedia}
                                            onChange={setNewPostMedia}
                                            variant="banner"
                                            entityType="posts"
                                            entityId={draftPostId}
                                            category="media"
                                            placeholder="Upload an image"
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreatePost(false)}
                                    className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    form="create-post-form"
                                    type="submit"
                                    disabled={creatingPost || !newPostTitle.trim() || !newPostContent.trim()}
                                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary-200 dark:shadow-primary-900/30"
                                >
                                    {creatingPost ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Post
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Community Modal */}
            {
                showEditModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 rounded-t-2xl">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Community</h2>
                                <button onClick={() => setShowEditModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <form id="edit-community-form" onSubmit={handleUpdateCommunity} className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5">Community Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5">Description</label>
                                            <textarea
                                                required
                                                value={editDesc}
                                                onChange={(e) => setEditDesc(e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none h-32 resize-none transition-all"
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">Branding & Assets</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="md:col-span-1 space-y-2">
                                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Icon</label>
                                                    <ImageUpload
                                                        value={editIcon}
                                                        onChange={setEditIcon}
                                                        variant="avatar"
                                                        entityType="communities"
                                                        entityId={community.id}
                                                        category="icon"
                                                    />
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Banner</label>
                                                    <ImageUpload
                                                        value={editBanner}
                                                        onChange={setEditBanner}
                                                        variant="banner"
                                                        placeholder="Upload Banner"
                                                        entityType="communities"
                                                        entityId={community.id}
                                                        category="banner"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    form="edit-community-form"
                                    type="submit"
                                    disabled={updating}
                                    className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-primary-200 dark:shadow-primary-900/30 disabled:opacity-70"
                                >
                                    {updating ? (
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
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteCommunity}
                title="Delete Community"
                message="Are you sure you want to delete this community? This action cannot be undone and all posts will be lost."
                itemName={community.name}
                loading={deleting}
                confirmText="Delete Community"
            />
        </div >
    );
};
