import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { communityService } from '../../services/community.service';
import type { Community } from '../../types/community';
import { Users, MessageSquare, Plus, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const CommunityPage = () => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create Modal State
    const [newCommunityName, setNewCommunityName] = useState('');
    const [newCommunityDesc, setNewCommunityDesc] = useState('');
    const [creating, setCreating] = useState(false);

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

    const handleCreateCommunity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCommunityName.trim()) return;

        try {
            setCreating(true);
            await communityService.createCommunity({
                name: newCommunityName,
                description: newCommunityDesc
            });
            toast.success('Community created successfully!');
            setShowCreateModal(false);
            setNewCommunityName('');
            setNewCommunityDesc('');
            loadCommunities();
        } catch (error) {
            console.error('Failed to create community:', error);
            toast.error('Failed to create community');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
                        <p className="mt-2 text-gray-600">Connect with other learners and instructors</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create Community
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search communities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                    </form>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : communities.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No communities found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or create a new one.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {communities.map((community) => (
                            <Link
                                key={community.id}
                                to={`/community/${community.id}`}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all p-6 group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                        {community.member_count} members
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                    {community.name}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">
                                    {community.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{community.post_count} posts</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Community</h2>
                        <form onSubmit={handleCreateCommunity}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCommunityName}
                                        onChange={(e) => setNewCommunityName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="e.g. Python Enthusiasts"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        required
                                        value={newCommunityDesc}
                                        onChange={(e) => setNewCommunityDesc(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none h-32 resize-none"
                                        placeholder="What is this community about?"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
