import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testService } from '../../services/test.service';
import type { Test } from '../../types/test';
import { Plus, FileText, Users, Clock, CheckCircle, Eye, Edit, Trash2, Search, X } from 'lucide-react';
import { CardGridSkeleton } from '../../components/ui/CardGridSkeleton';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../../components/common/DeleteConfirmationModal';
import { MicButton } from '../../components/common/MicButton';
import { courseService } from '../../services/course.service';
import { subjectService } from '../../services/subject.service';
import type { Subject } from '../../types/enrollment';

export const TestsManagementPage = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; testId: number | null }>({
        isOpen: false,
        testId: null
    });
    const [deleting, setDeleting] = useState(false);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

    // Data Sources for Filters
    const [courses, setCourses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [testsData, coursesData, subjectsData] = await Promise.all([
                testService.getInstructorTests(),
                courseService.getMyCourses(),
                subjectService.getMySubjects()
            ]);
            setTests(testsData);
            setCourses(coursesData);
            setSubjects(subjectsData);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredTests = tests.filter(test => {
        // Search Filter
        const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());

        // Subject Filter
        let matchesSubject = true;
        if (selectedSubjectId) {
            matchesSubject = String(test.subject_id) === selectedSubjectId;
        }

        // Course Filter
        let matchesCourse = true;
        if (selectedCourseId && !selectedSubjectId) { // If subject is selected, course is implicitly matched
            // Find subject for this test
            const testSubject = subjects.find(s => s.id === test.subject_id);
            if (testSubject) {
                matchesCourse = String(testSubject.course_id) === selectedCourseId;
            } else {
                matchesCourse = false; // Or true if we want to show orphans, but safer false
            }
        }

        return matchesSearch && matchesSubject && matchesCourse;
    });

    // Available Subjects based on Course Selection
    const filteredSubjects = selectedCourseId
        ? subjects.filter(s => String(s.course_id) === selectedCourseId)
        : subjects;

    const handleDelete = async () => {
        if (!deleteModal.testId) return;
        setDeleting(true);
        try {
            await testService.deleteTest(deleteModal.testId);
            setTests(tests.filter(t => t.id !== deleteModal.testId));
            toast.success('Test deleted successfully');
            setDeleteModal({ isOpen: false, testId: null });
        } catch (error) {
            console.error('Failed to delete test:', error);
            toast.error('Failed to delete test');
        } finally {
            setDeleting(false);
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tests Management</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Create and manage tests for your courses</p>
                    </div>
                    <Link
                        to="/instructor/tests/create"
                        className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Test
                    </Link>
                </div>


                {/* Filters Section */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-8 transition-colors duration-300">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <div className="relative flex items-center">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search tests..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-12 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm dark:text-gray-100"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-400"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                    <MicButton onTranscript={(text) => setSearchQuery(text)} className="h-7 w-7" />
                                </div>
                            </div>
                        </div>

                        {/* Course Filter */}
                        <div className="min-w-[200px]">
                            <select
                                value={selectedCourseId}
                                onChange={(e) => {
                                    setSelectedCourseId(e.target.value);
                                    setSelectedSubjectId(''); // Reset subject when course changes
                                }}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Courses</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Subject Filter */}
                        <div className="min-w-[200px]">
                            <select
                                value={selectedSubjectId}
                                onChange={(e) => setSelectedSubjectId(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                                disabled={!selectedCourseId && subjects.length > 50} // Optional optimization
                            >
                                <option value="">All Subjects</option>
                                {filteredSubjects.map(subject => (
                                    <option key={subject.id} value={subject.id}>{subject.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tests Grid */}
                {loading ? (
                    <CardGridSkeleton count={6} />
                ) : filteredTests.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {searchQuery || selectedCourseId || selectedSubjectId ? 'No matching tests found' : 'No tests yet'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {searchQuery || selectedCourseId || selectedSubjectId ? 'Try adjusting your filters' : 'Create your first test to assess student learning'}
                        </p>
                        {!searchQuery && !selectedCourseId && !selectedSubjectId && (
                            <Link
                                to="/instructor/tests/create"
                                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Create Test
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTests.map((test) => (
                            <div key={test.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{test.title}</h3>
                                        {test.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{test.description}</p>
                                        )}
                                    </div>
                                    {test.status === 'published' ? (
                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                                            Published
                                        </span>
                                    ) : test.status === 'archived' ? (
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium rounded-full">
                                            Archived
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full">
                                            Draft
                                        </span>
                                    )}
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/instructor/tests/${test.id}/edit`}
                                            className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, testId: test.id })}
                                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <FileText className="w-4 h-4 mr-2 text-primary-500 dark:text-primary-400" />
                                        <span className="font-medium dark:text-gray-300">{test.questions?.length || 0}</span>
                                        <span className="ml-1">Questions</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Clock className="w-4 h-4 mr-2 text-amber-500" />
                                        <span className="font-medium dark:text-gray-300">{test.duration_minutes}</span>
                                        <span className="ml-1">minutes</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <CheckCircle className="w-4 h-4 mr-2 text-purple-500" />
                                        <span className="font-medium dark:text-gray-300">{test.total_marks}</span>
                                        <span className="ml-1">marks (Pass: {test.passing_marks})</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <Link
                                        to={`/test/${test.id}/submissions`}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors text-sm font-medium"
                                    >
                                        <Users className="w-4 h-4" />
                                        Submissions
                                    </Link>
                                    <Link
                                        to={`/instructor/tests/${test.id}/preview`}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Preview
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, testId: null })}
                onConfirm={handleDelete}
                title="Delete Test"
                message="Are you sure you want to delete this test? This action cannot be undone."
                isDeleting={deleting}
            />
        </div >
    );
};
