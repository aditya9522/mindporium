import { useState } from 'react';
import type { Post, Comment } from '../../types/community';
import { communityService } from '../../services/community.service';
import { MessageSquare, Heart, MoreHorizontal, Send, Loader2, Pin, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { getImageUrl } from '../../lib/utils';

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
        <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border ${post.is_pinned ? 'border-amber-200 dark:border-amber-800 ring-1 ring-amber-100 dark:ring-amber-900' : 'border-gray-200 dark:border-gray-800'} overflow-hidden mb-6 transition-colors duration-300`}>
            <div className="p-6">
                {/* Author Info */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                            {post.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                {post.user?.full_name || 'Unknown User'}
                                {post.is_pinned && <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-normal"><Pin className="w-3 h-3 fill-current" /> Pinned</span>}
                                {post.is_locked && <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-normal"><Lock className="w-3 h-3" /> Locked</span>}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{post.title}</h3>
                <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-400 mb-4 cursor-text select-text">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>

                {post.attachments && (
                    <div className="-mx-6 mt-4 mb-4 bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
                        <img
                            src={getImageUrl(post.attachments)}
                            alt="Post content"
                            className="w-full h-auto max-h-[600px] object-contain mx-auto"
                            loading="lazy"
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.is_liked ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                            }`}
                    >
                        <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                        <span>{post.like_count}</span>
                    </button>
                    <button
                        onClick={toggleComments}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span>{post.comment_count}</span>
                    </button>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 ml-auto">
                        <span className="flex items-center gap-1.5" title="Views">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {post.view_count}
                        </span>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    {/* Add Comment */}
                    <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                        <button
                            type="submit"
                            disabled={submittingComment || !newComment.trim()}
                            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
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
                        <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">No comments yet. Be the first!</p>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-bold flex-shrink-0">
                                        {comment.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{comment.user?.full_name}</span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
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
