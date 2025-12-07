import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../../services/course.service';
import { subjectService } from '../../services/subject.service';
import type { CourseCreate, LevelEnum, CategoryEnum } from '../../types/course';
import type { SubjectCreate } from '../../types/enrollment';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminCreateCoursePage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Basic Info
    const [basicInfo, setBasicInfo] = useState({
        title: '',
        description: '',
        level: 'beginner' as LevelEnum,
        category: 'paid' as CategoryEnum,
        price: 0,
        tags: [] as string[],
        thumbnail: '',
        duration_weeks: 0,
    });

    // Step 2: Curriculum
    const [subjects, setSubjects] = useState<Array<{ title: string; description: string; order_index: number }>>([]);

    // Step 3: Tag input
    const [tagInput, setTagInput] = useState('');

    const steps = [
        { number: 1, title: 'Basic Information' },
        { number: 2, title: 'Curriculum' },
        { number: 3, title: 'Review & Publish' },
    ];

    const handleAddTag = () => {
        if (tagInput.trim() && !basicInfo.tags.includes(tagInput.trim())) {
            setBasicInfo({ ...basicInfo, tags: [...basicInfo.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setBasicInfo({ ...basicInfo, tags: basicInfo.tags.filter(t => t !== tag) });
    };

    const handleAddSubject = () => {
        setSubjects([...subjects, { title: '', description: '', order_index: subjects.length }]);
    };

    const handleRemoveSubject = (index: number) => {
        setSubjects(subjects.filter((_, i) => i !== index));
    };

    const handleSubjectChange = (index: number, field: string, value: string) => {
        const updated = [...subjects];
        updated[index] = { ...updated[index], [field]: value };
        setSubjects(updated);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Create course
            const courseData: CourseCreate = {
                title: basicInfo.title,
                description: basicInfo.description,
                level: basicInfo.level,
                category: basicInfo.category,
                price: basicInfo.category === 'paid' ? basicInfo.price : undefined,
                tags: basicInfo.tags,
                thumbnail: basicInfo.thumbnail || undefined,
            };

            const course = await courseService.createCourse(courseData);

            // Create subjects
            for (const subject of subjects) {
                if (subject.title.trim()) {
                    const subjectData: SubjectCreate = {
                        title: subject.title,
                        description: subject.description,
                        course_id: course.id,
                        order_index: subject.order_index,
                    };
                    await subjectService.createSubject(subjectData);
                }
            }

            toast.success('Course created successfully!');
            navigate('/admin/courses');
        } catch (error) {
            console.error('Failed to create course:', error);
            toast.error('Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    const canProceed = () => {
        if (currentStep === 1) {
            return basicInfo.title.trim() && basicInfo.description.trim();
        }
        if (currentStep === 2) {
            return subjects.length > 0 && subjects.every(s => s.title.trim());
        }
        return true;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/courses')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Courses
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
                    <p className="mt-2 text-gray-600">Follow the steps to create a new course as an administrator.</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep > step.number
                                        ? 'bg-green-500 text-white'
                                        : currentStep === step.number
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                                    </div>
                                    <span className={`ml-3 text-sm font-medium ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                                        }`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-1 mx-4 ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Title *
                                </label>
                                <input
                                    type="text"
                                    value={basicInfo.title}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="e.g., Complete Web Development Bootcamp"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={basicInfo.description}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Describe what students will learn in this course..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Level
                                    </label>
                                    <select
                                        value={basicInfo.level}
                                        onChange={(e) => setBasicInfo({ ...basicInfo, level: e.target.value as LevelEnum })}
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
                                        value={basicInfo.category}
                                        onChange={(e) => setBasicInfo({ ...basicInfo, category: e.target.value as CategoryEnum })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="free">Free</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                            </div>

                            {basicInfo.category === 'paid' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={basicInfo.price}
                                        onChange={(e) => setBasicInfo({ ...basicInfo, price: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration (weeks)
                                </label>
                                <input
                                    type="number"
                                    value={basicInfo.duration_weeks}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, duration_weeks: Number(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    min="0"
                                />
                            </div>

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
                                    {basicInfo.tags.map((tag) => (
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
                                    Thumbnail URL (optional)
                                </label>
                                <input
                                    type="url"
                                    value={basicInfo.thumbnail}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, thumbnail: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Curriculum */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Course Curriculum</h3>
                                <button
                                    onClick={handleAddSubject}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Add Subject
                                </button>
                            </div>

                            {subjects.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No subjects added yet. Click "Add Subject" to get started.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {subjects.map((subject, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <h4 className="font-medium text-gray-900">Subject {index + 1}</h4>
                                                <button
                                                    onClick={() => handleRemoveSubject(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    value={subject.title}
                                                    onChange={(e) => handleSubjectChange(index, 'title', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Subject title"
                                                />
                                                <textarea
                                                    value={subject.description}
                                                    onChange={(e) => handleSubjectChange(index, 'description', e.target.value)}
                                                    rows={2}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Subject description (optional)"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Course</h3>

                            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Title</h4>
                                    <p className="text-gray-900">{basicInfo.title}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                                    <p className="text-gray-900">{basicInfo.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-1">Level</h4>
                                        <p className="text-gray-900 capitalize">{basicInfo.level}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-1">Category</h4>
                                        <p className="text-gray-900 capitalize">{basicInfo.category}</p>
                                    </div>
                                </div>
                                {basicInfo.category === 'paid' && (
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-1">Price</h4>
                                        <p className="text-gray-900">${basicInfo.price}</p>
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Subjects ({subjects.length})</h4>
                                    <ul className="list-disc list-inside text-gray-900">
                                        {subjects.map((subject, index) => (
                                            <li key={index}>{subject.title}</li>
                                        ))}
                                    </ul>
                                </div>
                                {basicInfo.tags.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-1">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {basicInfo.tags.map((tag) => (
                                                <span key={tag} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-8 flex items-center justify-between">
                    <button
                        onClick={() => setCurrentStep(currentStep - 1)}
                        disabled={currentStep === 1}
                        className="flex items-center px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                    </button>

                    {currentStep < 3 ? (
                        <button
                            onClick={() => setCurrentStep(currentStep + 1)}
                            disabled={!canProceed()}
                            className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Create Course
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
