import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseService } from '../../services/course.service';
import { subjectService } from '../../services/subject.service';
import type { Course, CourseUpdate, LevelEnum, CategoryEnum } from '../../types/course';
import type { Subject, SubjectCreate } from '../../types/enrollment';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export const EditCoursePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [course, setCourse] = useState<Course | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [newSubjects, setNewSubjects] = useState<Array<{ title: string; description: string; order_index: number }>>([]);
    const [tagInput, setTagInput] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        level: 'beginner' as LevelEnum,
        category: 'paid' as CategoryEnum,
        price: 0,
        tags: [] as string[],
        thumbnail: '',
        is_published: false,
    });

    useEffect(() => {
        if (id) {
            fetchCourseData();
        }
    }, [id]);

    const fetchCourseData = async () => {
        try {
            const [courseData, subjectsData] = await Promise.all([
                courseService.getCourse(Number(id)),
                subjectService.getCourseSubjects(Number(id))
            ]);

            setCourse(courseData);
            setSubjects(subjectsData);
            setFormData({
                title: courseData.title,
                description: courseData.description || '',
                level: courseData.level,
                category: courseData.category,
                price: courseData.price || 0,
                tags: courseData.tags || [],
                thumbnail: courseData.thumbnail || '',
                is_published: courseData.is_published,
            });
        } catch (error) {
            console.error('Failed to fetch course:', error);
            toast.error('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    const handleAddNewSubject = () => {
        setNewSubjects([...newSubjects, {
            title: '',
            description: '',
            order_index: subjects.length + newSubjects.length
        }]);
    };

    const handleRemoveNewSubject = (index: number) => {
        setNewSubjects(newSubjects.filter((_, i) => i !== index));
    };

    const handleNewSubjectChange = (index: number, field: string, value: string) => {
        const updated = [...newSubjects];
        updated[index] = { ...updated[index], [field]: value };
        setNewSubjects(updated);
    };

    const handleDeleteSubject = async (subjectId: number) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) return;

        try {
            await subjectService.deleteSubject(subjectId);
            setSubjects(subjects.filter(s => s.id !== subjectId));
            toast.success('Subject deleted');
        } catch (error) {
            console.error('Failed to delete subject:', error);
            toast.error('Failed to delete subject');
        }
    };

    const handleSave = async () => {
        if (!id) return;

        setSaving(true);
        try {
            // Update course
            const updateData: CourseUpdate = {
                title: formData.title,
                description: formData.description,
                level: formData.level,
                category: formData.category,
                price: formData.category === 'paid' ? formData.price : undefined,
                tags: formData.tags,
                thumbnail: formData.thumbnail || undefined,
                is_published: formData.is_published,
            };

            await courseService.updateCourse(Number(id), updateData);

            // Create new subjects
            for (const subject of newSubjects) {
                if (subject.title.trim()) {
                    const subjectData: SubjectCreate = {
                        title: subject.title,
                        description: subject.description,
                        course_id: Number(id),
                        order_index: subject.order_index,
                    };
                    await subjectService.createSubject(subjectData);
                }
            }

            toast.success('Course updated successfully!');
            navigate('/instructor/courses');
        } catch (error) {
            console.error('Failed to update course:', error);
            toast.error('Failed to update course');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Course not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/instructor/courses')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to My Courses
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
                            <p className="mt-2 text-gray-600">Update your course details and curriculum.</p>
                        </div>
                        <a
                            href={`/courses/${id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                        </a>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Course Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Level
                                </label>
                                <select
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value as LevelEnum })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryEnum })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="free">Free</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                        </div>

                        {formData.category === 'paid' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price ($)
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Add a tag and press Enter"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-2 text-indigo-600 hover:text-indigo-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Thumbnail URL
                            </label>
                            <input
                                type="url"
                                value={formData.thumbnail}
                                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_published"
                                checked={formData.is_published}
                                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="is_published" className="ml-2 text-sm font-medium text-gray-700">
                                Publish this course (make it visible to students)
                            </label>
                        </div>
                    </div>
                </div>

                {/* Curriculum */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Curriculum</h2>
                        <button
                            onClick={handleAddNewSubject}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Subject
                        </button>
                    </div>

                    {/* Existing Subjects */}
                    {subjects.length > 0 && (
                        <div className="space-y-4 mb-6">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase">Existing Subjects</h3>
                            {subjects.map((subject) => (
                                <div key={subject.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className="font-medium text-gray-900">{subject.title}</h4>
                                        <button
                                            onClick={() => handleDeleteSubject(subject.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600">{subject.description || 'No description'}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <p className="text-xs text-gray-500">
                                            {subject.resources?.length || 0} resource(s)
                                        </p>
                                        <button
                                            onClick={() => navigate(`/instructor/courses/${id}/subjects/${subject.id}/resources`)}
                                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                        >
                                            Manage Resources →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New Subjects */}
                    {newSubjects.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase">New Subjects</h3>
                            {newSubjects.map((subject, index) => (
                                <div key={index} className="border border-indigo-200 bg-indigo-50 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className="font-medium text-gray-900">New Subject {index + 1}</h4>
                                        <button
                                            onClick={() => handleRemoveNewSubject(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={subject.title}
                                            onChange={(e) => handleNewSubjectChange(index, 'title', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Subject title"
                                        />
                                        <textarea
                                            value={subject.description}
                                            onChange={(e) => handleNewSubjectChange(index, 'description', e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Subject description (optional)"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {subjects.length === 0 && newSubjects.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No subjects yet. Click "Add Subject" to get started.
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-4">
                    <button
                        onClick={() => navigate('/instructor/courses')}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !formData.title || !formData.description}
                        className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
