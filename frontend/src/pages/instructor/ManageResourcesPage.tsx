import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Subject, Resource, ResourceTypeEnum } from '../../types/enrollment';
import { resourceService, type ResourceCreate } from '../../services/resource.service';
import { subjectService } from '../../services/subject.service';
import { ArrowLeft, Plus, Trash2, Save, Loader2, FileText, Video, Link as LinkIcon, File } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export const ManageResourcesPage = () => {
    const { courseId, subjectId } = useParams<{ courseId: string; subjectId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [subject, setSubject] = useState<Subject | null>(null);
    const [resources, setResources] = useState<Resource[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);

    const [newResource, setNewResource] = useState<ResourceCreate>({
        title: '',
        description: '',
        resource_type: 'video',
        file_url: '',
        external_link: '',
        subject_id: Number(subjectId),
        is_downloadable: true,
        order_index: 0,
    });

    useEffect(() => {
        if (subjectId) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [courseId, subjectId]);

    const fetchData = async () => {
        try {
            const subjectsData = await subjectService.getCourseSubjects(Number(courseId));
            const currentSubject = subjectsData.find(s => s.id === Number(subjectId));

            if (currentSubject) {
                setSubject(currentSubject);
                setResources(currentSubject.resources || []);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    const handleAddResource = async () => {
        if (!newResource.title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        if (newResource.resource_type === 'video' && !newResource.file_url) {
            toast.error('Please enter a video URL');
            return;
        }

        if (newResource.resource_type === 'link' && !newResource.external_link) {
            toast.error('Please enter a link URL');
            return;
        }

        setSaving(true);
        try {
            const created = await resourceService.createResource({
                ...newResource,
                subject_id: Number(subjectId),
                order_index: resources.length,
            });

            setResources([...resources, created]);
            setNewResource({
                title: '',
                description: '',
                resource_type: 'video',
                file_url: '',
                external_link: '',
                subject_id: Number(subjectId),
                is_downloadable: true,
                order_index: 0,
            });
            setShowAddForm(false);
            toast.success('Resource added successfully');
        } catch (error) {
            console.error('Failed to add resource:', error);
            toast.error('Failed to add resource');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteResource = async (resourceId: number) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;

        try {
            await resourceService.deleteResource(resourceId);
            setResources(resources.filter(r => r.id !== resourceId));
            toast.success('Resource deleted');
        } catch (error) {
            console.error('Failed to delete resource:', error);
            toast.error('Failed to delete resource');
        }
    };

    const getResourceIcon = (type: ResourceTypeEnum) => {
        switch (type) {
            case 'video': return <Video className="w-5 h-5" />;
            case 'pdf': return <FileText className="w-5 h-5" />;
            case 'link': return <LinkIcon className="w-5 h-5" />;
            default: return <File className="w-5 h-5" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Subject not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/instructor/courses/${courseId}/edit`)}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Edit Course
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Manage Resources</h1>
                            <p className="mt-2 text-gray-600">Subject: {subject.title}</p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Resource
                        </button>
                    </div>
                </div>

                {/* Add Resource Form */}
                {showAddForm && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Resource</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Resource Type
                                </label>
                                <select
                                    value={newResource.resource_type}
                                    onChange={(e) => setNewResource({ ...newResource, resource_type: e.target.value as ResourceTypeEnum })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="video">Video</option>
                                    <option value="pdf">PDF Document</option>
                                    <option value="ppt">PowerPoint</option>
                                    <option value="doc">Document</option>
                                    <option value="link">External Link</option>
                                    <option value="image">Image</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={newResource.title}
                                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="e.g., Introduction to React"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newResource.description}
                                    onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Brief description of this resource"
                                />
                            </div>

                            {(newResource.resource_type === 'video' || newResource.resource_type === 'pdf' ||
                                newResource.resource_type === 'ppt' || newResource.resource_type === 'doc' ||
                                newResource.resource_type === 'image' || newResource.resource_type === 'other') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            File URL *
                                        </label>
                                        <input
                                            type="url"
                                            value={newResource.file_url}
                                            onChange={(e) => setNewResource({ ...newResource, file_url: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="https://example.com/video.mp4"
                                        />
                                    </div>
                                )}

                            {newResource.resource_type === 'link' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        External Link *
                                    </label>
                                    <input
                                        type="url"
                                        value={newResource.external_link}
                                        onChange={(e) => setNewResource({ ...newResource, external_link: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            )}

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_downloadable"
                                    checked={newResource.is_downloadable}
                                    onChange={(e) => setNewResource({ ...newResource, is_downloadable: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="is_downloadable" className="ml-2 text-sm text-gray-700">
                                    Allow students to download this resource
                                </label>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    onClick={handleAddResource}
                                    disabled={saving}
                                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Add Resource
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resources List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Resources ({resources.length})
                    </h2>

                    {resources.length > 0 ? (
                        <div className="space-y-3">
                            {resources.map((resource, index) => (
                                <div
                                    key={resource.id}
                                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="text-gray-600 mt-1">
                                            {getResourceIcon(resource.resource_type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium text-gray-900">{resource.title}</h3>
                                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                                    {resource.resource_type.toUpperCase()}
                                                </span>
                                            </div>
                                            {resource.description && (
                                                <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>Order: {index + 1}</span>
                                                {resource.is_downloadable && (
                                                    <span className="text-green-600">Downloadable</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteResource(resource.id)}
                                        className="text-red-600 hover:text-red-800 p-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <File className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>No resources added yet.</p>
                            <p className="text-sm mt-1">Click "Add Resource" to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
