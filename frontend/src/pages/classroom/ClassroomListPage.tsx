import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classroomService, type Classroom } from '../../services/classroom.service';
import { courseService } from '../../services/course.service';
import { subjectService } from '../../services/subject.service';
import { enrollmentService } from '../../services/enrollment.service';
import { useAuthStore } from '../../store/auth.store';
import { Loader2, Calendar, Clock, Video, Plus, User as UserIcon, Edit, Trash2, BookOpen, Layers, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../../components/common/DeleteConfirmationModal';
import type { Course } from '../../types/course';
import type { Subject } from '../../types/enrollment';

export const ClassroomListPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [pageLoading, setPageLoading] = useState(true);

    // Data filtering states
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);

    const [allClassrooms, setAllClassrooms] = useState<Classroom[]>([]);

    // Loading states
    const [loadingClassrooms, setLoadingClassrooms] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    // Modal & Form States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingClass, setEditingClass] = useState<Classroom | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Create/Edit Form Data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        duration: 60,
        provider: 'custom',
        course_id: '',
        subject_id: ''
    });

    const [createModalSubjects, setCreateModalSubjects] = useState<Subject[]>([]);
    const [loadingCreateSubjects, setLoadingCreateSubjects] = useState(false);

    // Delete Modal
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; classroom: Classroom | null }>({
        isOpen: false,
        classroom: null
    });
    const [deleting, setDeleting] = useState(false);

    const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

    useEffect(() => {
        initializePage();
    }, [user?.role]);

    const initializePage = async () => {
        try {
            setPageLoading(true);
            if (isInstructor) {
                // Instructor: Fetch their courses and ALL classrooms initially
                const [myCourses, allClasses] = await Promise.all([
                    courseService.getMyCourses({}),
                    classroomService.getAllClassrooms()
                ]);
                setCourses(myCourses);
                setClassrooms(allClasses);
                setAllClassrooms(allClasses);
            } else {
                // Student: Fetch enrolled courses
                const enrollments = await enrollmentService.getMyEnrollments();
                const enrolledCourses = enrollments.map(e => e.course!).filter(Boolean);
                setCourses(enrolledCourses);
                // Classrooms are fetched only after selection
            }
        } catch (error) {
            console.error('Failed to initialize page:', error);
            toast.error('Failed to load data');
        } finally {
            setPageLoading(false);
        }
    };

    // --- Filter Logic ---
    useEffect(() => {
        if (selectedCourseId) {
            fetchSubjects(selectedCourseId, false);
        } else {
            setSubjects([]);
            setSelectedSubjectId('');
        }
    }, [selectedCourseId]);

    useEffect(() => {
        if (isInstructor) {
            // Instructor Filtering: Filter the LOCAL allClassrooms list
            let filtered = [...allClassrooms];

            if (selectedCourseId) {
                // We need to check if the class belongs to a subject in this course
                // Assuming classroom.subject contains course info or we filter by subject_id that strictly belongs to course
                // But simplified: If we have subjects loaded, we can filter by them, or rely on classroom.subject.course_id if available

                // Better approach: Since we don't have course_id directly on classroom usually (it's on subject), 
                // and we might filtered subjects just now.
                // However, the easiest is: if subject is selected, filter by it. 
                // If only course is selected, we need to know which classes belong to that course.
                // We can use the 'subjects' list we just fetched for this course.

                if (selectedSubjectId) {
                    filtered = filtered.filter(c => c.subject_id === parseInt(selectedSubjectId));
                } else {
                    // Filter by any subject in the current 'subjects' list (which are for this course)
                    const courseSubjectIds = subjects.map(s => s.id);
                    // Filter classrooms whose subject_id is in this list. 
                    // Note: 'subjects' state might take a tick to update after course selection, 
                    // but fetchSubjects is async. We might need to wait or use a better check.
                    // For robust filtering, we can check c.subject?.course_id if available.
                    filtered = filtered.filter(c => {
                        if (c.subject?.course_id) return c.subject.course_id === parseInt(selectedCourseId);
                        // Fallback if subject populated but course_id missing? verify backend.
                        return c.subject_id && courseSubjectIds.includes(c.subject_id);
                    });
                }
            }
            setClassrooms(filtered);

        } else {
            // Student: Fetch from backend as before
            if (selectedSubjectId) {
                fetchClassroomsForStudent();
            } else {
                setClassrooms([]);
            }
        }
    }, [selectedSubjectId, selectedCourseId, isInstructor, allClassrooms, subjects]);

    const fetchSubjects = async (courseId: string, forModal: boolean) => {
        try {
            if (forModal) setLoadingCreateSubjects(true);
            else setLoadingSubjects(true);

            const data = await subjectService.getCourseSubjects(parseInt(courseId));

            if (forModal) setCreateModalSubjects(data);
            else setSubjects(data);
        } catch (error) {
            console.error('Failed to load subjects', error);
        } finally {
            if (forModal) setLoadingCreateSubjects(false);
            else setLoadingSubjects(false);
        }
    };

    const fetchClassroomsForStudent = async () => {
        if (!selectedCourseId) return;
        setLoadingClassrooms(true);
        try {
            const data = await classroomService.getClassroomsByCourse(parseInt(selectedCourseId));
            if (selectedSubjectId) {
                setClassrooms(data.filter(c => c.subject_id === parseInt(selectedSubjectId)));
            } else {
                setClassrooms(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load classrooms');
        } finally {
            setLoadingClassrooms(false);
        }
    };

    // --- Form Handlers ---

    // Watch for course change in Modal to fetch subjects
    useEffect(() => {
        if (showCreateModal && formData.course_id) {
            fetchSubjects(formData.course_id, true);
        } else {
            setCreateModalSubjects([]);
        }
    }, [formData.course_id, showCreateModal]);

    const openCreateModal = () => {
        setEditingClass(null);
        setFormData({
            title: '',
            description: '',
            start_time: '',
            duration: 60,
            provider: 'custom',
            course_id: '',
            subject_id: ''
        });
        setShowCreateModal(true);
    };

    const openEditModal = (classroom: Classroom) => {
        setEditingClass(classroom);

        // Pre-fill data
        const startTime = new Date(classroom.start_time);
        const endTime = classroom.end_time ? new Date(classroom.end_time) : new Date(startTime.getTime() + 60 * 60000);
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

        setFormData({
            title: classroom.title,
            description: classroom.description || '',
            start_time: startTime.toISOString().slice(0, 16),
            duration: duration,
            provider: classroom.provider,
            course_id: classroom.subject?.course_id ? String(classroom.subject.course_id) : '',
            // Note: If backend doesn't return subject->course_id, this might be tricky. 
            // Assuming classroom.subject contains course info or we can't easily edit the course parent.
            subject_id: classroom.subject_id ? String(classroom.subject_id) : ''
        });
        setShowCreateModal(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const startTime = new Date(formData.start_time);
            const endTime = new Date(startTime.getTime() + formData.duration * 60000);

            const payload = {
                title: formData.title,
                description: formData.description,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                provider: formData.provider as any,
                subject_id: formData.subject_id ? parseInt(formData.subject_id) : undefined
            };

            if (editingClass) {
                await classroomService.updateClassroom(editingClass.id, payload);
                toast.success('Class updated successfully');
            } else {
                await classroomService.createClassroom({
                    ...payload,
                    status: 'not_started'
                });
                toast.success('Class scheduled successfully');
            }

            setShowCreateModal(false);
            // Refresh list
            if (isInstructor) {
                const data = await classroomService.getAllClassrooms();
                setClassrooms(data);
            } else {
                fetchClassroomsForStudent();
            }
        } catch (error) {
            console.error(error);
            toast.error(editingClass ? 'Failed to update class' : 'Failed to schedule class');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.classroom || deleting) return;
        setDeleting(true);
        try {
            await classroomService.deleteClassroom(deleteModal.classroom.id);
            setClassrooms(prev => prev.filter(c => c.id !== deleteModal.classroom!.id));
            toast.success('Class deleted successfully');
            setDeleteModal({ isOpen: false, classroom: null });
        } catch (error) {
            toast.error('Failed to delete class');
        } finally {
            setDeleting(false);
        }
    };


    if (pageLoading) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 space-y-2">
                    <div className="w-64 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="w-96 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden h-[360px] animate-pulse p-6 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-20 h-6 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-800 rounded" />
                            </div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-800 w-3/4 rounded mb-2" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 w-full rounded mb-1" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 w-5/6 rounded mb-4" />
                            
                            <div className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-transparent">
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 w-2/3 rounded" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 w-3/4 rounded" />
                            </div>
                            <div className="mt-auto h-10 bg-gray-200 dark:bg-gray-800 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Classrooms</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {isInstructor
                                ? 'Manage your live sessions and schedules.'
                                : 'Join your enrolled live classes.'}
                        </p>
                    </div>
                    {isInstructor && (
                        <Button onClick={openCreateModal} className="shrink-0">
                            <Plus className="w-5 h-5 mr-2" />
                            Schedule Class
                        </Button>
                    )}
                </div>

                {/* Filters */}
                {(!isInstructor || (isInstructor && courses.length > 0)) && (
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mb-6 flex flex-col md:flex-row gap-4 transition-colors duration-300">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Select Course</label>
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <select
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                >
                                    <option value="">{isInstructor ? 'All Courses' : 'Select an enrolled course...'}</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {(selectedCourseId || selectedSubjectId) && (
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Select Subject</label>
                                <div className="relative">
                                    <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        value={selectedSubjectId}
                                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                                        disabled={!selectedCourseId || loadingSubjects}
                                    >
                                        <option value="">All Subjects</option>
                                        {subjects.map(subject => (
                                            <option key={subject.id} value={subject.id}>{subject.title}</option>
                                        ))}
                                    </select>
                                    {loadingSubjects && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 className="w-4 h-4 animate-spin text-indigo-500" /></div>}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Content */}
                {loadingClassrooms ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>
                ) : (
                    <>
                        {!isInstructor && !selectedSubjectId ? (
                            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 border-dashed transition-colors duration-300">
                                <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-indigo-500" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select a course and subject</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Please select an enrolled course and subject above to view available classes.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classrooms.length > 0 ? classrooms.map((classroom) => (
                                    <div key={classroom.id} className="relative bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md dark:hover:shadow-lg transition-all group">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${classroom.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' :
                                                    classroom.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {classroom.status === 'live' ? '● LIVE NOW' : classroom.status.replace('_', ' ')}
                                                </span>
                                                <Video className={`w-5 h-5 ${classroom.status === 'live' ? 'text-red-500' : 'text-gray-300'}`} />
                                            </div>

                                            {isInstructor && (
                                                <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                                                    <div className="flex bg-white/90 backdrop-blur-sm shadow-sm border border-gray-100 rounded-lg p-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openEditModal(classroom); }}
                                                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                            title="Edit Class"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <div className="w-px bg-gray-200 my-1 mx-1"></div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, classroom }); }}
                                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                            title="Cancel Class"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1" title={classroom.title}>{classroom.title}</h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 h-10">{classroom.description || 'No description provided.'}</p>

                                            <div className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                                    <Calendar className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                                                    {format(new Date(classroom.start_time), 'EEE, MMM d, yyyy')}
                                                </div>
                                                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                                    <Clock className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                                                    {format(new Date(classroom.start_time), 'h:mm a')} - {classroom.end_time ? format(new Date(classroom.end_time), 'h:mm a') : '...'}
                                                </div>
                                                {classroom.instructor && (
                                                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                                        <UserIcon className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                                                        <span className="truncate">Instructor: {classroom.instructor.full_name}</span>
                                                    </div>
                                                )}
                                                {classroom.subject && (
                                                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                                        <Layers className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                                                        <span className="truncate">Subject: {classroom.subject.title}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                                onClick={() => navigate(`/classroom/${classroom.id}`)}
                                                disabled={classroom.status === 'completed' || classroom.status === 'cancelled'}
                                                variant={classroom.status === 'live' ? 'default' : 'outline'}
                                            >
                                                {classroom.status === 'live' ? 'Join Class Now' : 'View Details'}
                                            </Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-dashed transition-colors duration-300">
                                        <p>No classrooms found matching your selection.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingClass ? 'Edit Classroom' : 'Schedule New Class'}</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><span className="text-2xl">&times;</span></button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            {!editingClass && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                            value={formData.course_id}
                                            onChange={e => setFormData({ ...formData, course_id: e.target.value, subject_id: '' })}
                                        >
                                            <option value="">Select Course</option>
                                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                            value={formData.subject_id}
                                            onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                                            disabled={!formData.course_id || loadingCreateSubjects}
                                        >
                                            <option value="">Select Subject</option>
                                            {createModalSubjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="e.g. Introduction to Thermodynamics"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none h-24"
                                    placeholder="What will be covered in this class?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time <span className="text-red-500">*</span></label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.start_time}
                                        onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        required
                                        min="15"
                                        step="15"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" isLoading={isSubmitting}>
                                    {editingClass ? 'Update Class' : 'Schedule Class'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, classroom: null })}
                onConfirm={handleDelete}
                title="Cancel Class"
                message="Are you sure you want to cancel this class? Students will be notified."
                itemName={deleteModal.classroom?.title}
                loading={deleting}
            />
        </div>
    );
};
