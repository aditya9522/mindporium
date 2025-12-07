import { useState } from 'react';
import type { Post, Comment } from '../../types/community';
import { communityService } from '../../services/community.service';
import { MessageSquare, Heart, Share2, MoreHorizontal, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

interface PostCardProps {
    post: Post;
    onUpdate?: (updatedPost: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [liking, setLiking] = useState(false);

    const handleLike = async () => {
        if (liking) return;
        try {
            setLiking(true);
            const result = await communityService.likePost(post.id);
            if (onUpdate) {
                onUpdate({
                    ...post,
                    like_count: result.like_count,
                    is_liked: !post.is_liked // Toggle local state helper
                });
            }
        } catch (error) {
            console.error('Failed to like post:', error);
            toast.error('Failed to update like');
        } finally {
            setLiking(false);
        }
    };

    const toggleComments = async () => {
        if (!showComments) {
            setShowComments(true);
            if (comments.length === 0) {
                await loadComments();
            }
        } else {
            setShowComments(false);
        }
    };

    const loadComments = async () => {
        try {
            setLoadingComments(true);
            const data = await communityService.getComments(post.id);
            setComments(data);
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setSubmittingComment(true);
            const comment = await communityService.createComment(post.id, newComment);
            setComments([comment, ...comments]);
            setNewComment('');
            if (onUpdate) {
                onUpdate({
                    ...post,
                    comment_count: post.comment_count + 1
                });
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
            toast.error('Failed to add comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-6">
                {/* Author Info */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                            {post.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{post.user?.full_name || 'Unknown User'}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                <div className="prose prose-sm max-w-none text-gray-600 mb-4">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                            }`}
                    >
                        <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                        <span>{post.like_count}</span>
                    </button>
                    <button
                        onClick={toggleComments}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span>{post.comment_count}</span>
                    </button>
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors ml-auto">
                        <Share2 className="w-5 h-5" />
                        <span className="hidden sm:inline">Share</span>
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="bg-gray-50 p-6 border-t border-gray-100">
                    {/* Add Comment */}
                    <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                        <button
                            type="submit"
                            disabled={submittingComment || !newComment.trim()}
                            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            {submittingComment ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>

                    {/* Comments List */}
                    {loadingComments ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : comments.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm py-2">No comments yet. Be the first!</p>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0">
                                        {comment.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-sm text-gray-900">{comment.user?.full_name}</span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
