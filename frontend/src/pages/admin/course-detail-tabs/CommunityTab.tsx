import { useState, useEffect } from 'react';
import { Users, MessageSquare, Search, ExternalLink, Plus } from 'lucide-react';
import api from '../../../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface CommunityTabProps {
    courseData: any;
}

export const CommunityTab = ({ courseData }: CommunityTabProps) => {
    const navigate = useNavigate();
    const [communities, setCommunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCommunities();
    }, []);

    const fetchCommunities = async () => {
        try {
            const response = await api.get('/communities/');
            setCommunities(response.data);
        } catch (error) {
            console.error('Failed to fetch communities:', error);
            toast.error('Failed to load communities');
        } finally {
            setLoading(false);
        }
    };

    const filteredCommunities = communities.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (courseData?.course?.title && c.name.toLowerCase().includes(courseData.course.title.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Course Community</h2>
                        <p className="text-pink-100">Connect students and instructors</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold">{communities.length}</div>
                        <div className="text-pink-100">Total Communities</div>
                    </div>
                </div>
            </div>

            {/* Search & Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1 w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search communities..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors w-full md:w-auto justify-center">
                    <Plus className="w-4 h-4" />
                    Create Community
                </button>
            </div>

            {/* Communities List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No communities found matching your search</p>
                    </div>
                ) : (
                    filteredCommunities.map((community) => (
                        <div key={community.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group">
                            <div className="h-24 bg-gradient-to-r from-pink-100 to-rose-100 relative">
                                {community.banner && (
                                    <img src={community.banner} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="p-6 pt-0 relative">
                                <div className="w-16 h-16 rounded-xl bg-white p-1 absolute -top-18 left-6 shadow-sm">
                                    {community.icon ? (
                                        <img src={community.icon} alt="" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <div className="w-full h-full bg-pink-100 rounded-lg flex items-center justify-center text-pink-600">
                                            <Users className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-10">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">
                                        {community.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {community.description || 'No description provided'}
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            <span>{community.member_count} members</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            <span>{community.post_count || 0} posts</span>
                                        </div>
                                    </div>
                                    <button className="mt-4 w-full py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium" onClick={() => navigate(`/community/${community.id}`)}>
                                        View Community <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
