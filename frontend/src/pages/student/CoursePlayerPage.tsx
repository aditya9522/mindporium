import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { courseService } from '../../services/course.service';
import { subjectService } from '../../services/subject.service';
import { enrollmentService } from '../../services/enrollment.service';
import type { Course } from '../../types/course';
import type { Subject, Resource } from '../../types/enrollment';
import { CoursePlayerSidebar } from '../../components/student/CoursePlayerSidebar';
import { CoursePlayerContent } from '../../components/student/CoursePlayerContent';
import { PageLoader } from '../../components/common/PageLoader';
import { ArrowLeft, MessageSquare, CheckCircle, Sparkles, Menu, X, ChevronRight } from 'lucide-react';
import { AIStudyBuddy } from '../../components/student/AIStudyBuddy';
import toast from 'react-hot-toast';

export const CoursePlayerPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const resourceIdParam = searchParams.get('resource');

    const [course, setCourse] = useState<Course | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [activeResource, setActiveResource] = useState<Resource | null>(null);
    const [loading, setLoading] = useState(true);
    const [markingComplete, setMarkingComplete] = useState(false);
    const [completedResources, setCompletedResources] = useState<number[]>([]);
    const [showStudyBuddy, setShowStudyBuddy] = useState(false);
    const [showMobileLessons, setShowMobileLessons] = useState(false);

    // Fetch course data
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [courseData, subjectsData, progressData] = await Promise.all([
                    courseService.getCourse(Number(id)),
                    subjectService.getCourseSubjects(Number(id)),
                    enrollmentService.getCourseProgress(Number(id)).catch(() => ({ completed_resource_ids: [] }))
                ]);

                const isEnrolled = await enrollmentService.checkEnrollment(Number(id));
                if (!isEnrolled) {
                    toast.error('Please enroll in this course to start learning');
                    navigate(`/courses/${id}`, { replace: true });
                    return;
                }

                setCourse(courseData);
                setSubjects(sortSubjects(subjectsData));

                if (progressData?.completed_resource_ids) {
                    setCompletedResources(progressData.completed_resource_ids);
                }
            } catch (error) {
                console.error('Failed to load course content:', error);
                toast.error('Failed to load course content');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    // Handle Active Resource Selection based on URL or defaults
    useEffect(() => {
        if (loading || subjects.length === 0) return;

        if (resourceIdParam) {
            // Find requested resource
            let foundResource: Resource | undefined;
            for (const subject of subjects) {
                foundResource = subject.resources?.find(r => r.id === Number(resourceIdParam));
                if (foundResource) break;
            }

            if (foundResource) {
                setActiveResource(foundResource);
            } else {
                // If ID invalid, default to first
                const firstResource = getFirstIncompleteResource(subjects, completedResources) || getFlattenedResources(subjects)[0];
                if (firstResource) {
                    setActiveResource(firstResource);
                    // Optionally replace URL to correct one, but avoiding continuous redirect loop is key
                }
            }
        } else {
            // No param, default to first resource
            const firstResource = getFirstIncompleteResource(subjects, completedResources) || getFlattenedResources(subjects)[0];
            if (firstResource) {
                setActiveResource(firstResource);
            }
        }
    }, [loading, subjects, resourceIdParam, completedResources]);

    const handleSelectResource = (resource: Resource) => {
        setSearchParams({ resource: resource.id.toString() });
        setShowMobileLessons(false);
        // State update will happen via useEffect when URL param changes
    };

    const resources = getFlattenedResources(subjects);
    const activeIndex = activeResource ? resources.findIndex(resource => resource.id === activeResource.id) : -1;
    const nextResource = activeIndex >= 0 ? resources[activeIndex + 1] : undefined;

    const handleMarkComplete = async () => {
        if (!activeResource || markingComplete) return;
        setMarkingComplete(true);
        try {
            await enrollmentService.completeResource(activeResource.id);
            setCompletedResources(prev => prev.includes(activeResource.id) ? prev : [...prev, activeResource.id]);
            toast.success('Lesson marked as complete');
        } catch (error) {
            toast.error('Failed to mark complete');
        } finally {
            setMarkingComplete(false);
        }
    };

    const handleNextLesson = () => {
        if (nextResource) {
            handleSelectResource(nextResource);
        }
    };

    const isCompleted = activeResource ? completedResources.includes(activeResource.id) : false;

    const totalResources = subjects.reduce((acc, subject) => acc + (subject.resources?.length || 0), 0);
    const progressPercentage = totalResources > 0 ? Math.round((completedResources.length / totalResources) * 100) : 0;

    if (loading) {
        return <PageLoader />;
    }

    if (!course) return null;

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            {/* Sidebar */}
            <div className={`${showMobileLessons ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden'} w-[min(20rem,calc(100vw-1rem))] flex-shrink-0 border-r border-gray-800 bg-gray-900 flex-col shadow-2xl lg:relative lg:inset-auto lg:z-auto lg:flex lg:w-80 lg:shadow-none`}>
                <div className="p-4 border-b border-gray-800">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <button
                            onClick={() => navigate('/my-learning')}
                            className="flex items-center text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to My Learning
                        </button>
                        <button
                            onClick={() => setShowMobileLessons(false)}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white lg:hidden"
                            aria-label="Close lessons"
                            title="Close lessons"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <h2 className="font-bold text-lg line-clamp-2 mb-3">{course.title}</h2>

                    <div className="mb-6">
                        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                            <span>{progressPercentage}% Complete</span>
                            <span>{completedResources.length}/{totalResources} Lessons</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2.5 shadow-inner">
                            <div
                                className="bg-linear-to-r from-green-400 to-emerald-600 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                    <a
                        href={`/community/course/${course.id}/qa`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-indigo-300 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm font-semibold border border-gray-700 hover:border-indigo-500/30"
                    >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Course Community
                    </a>
                    <button
                        onClick={() => setShowStudyBuddy(!showStudyBuddy)}
                        className={`flex items-center justify-center w-full mt-2 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm font-semibold border ${
                            showStudyBuddy 
                                ? 'bg-indigo-650 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' 
                                : 'bg-gray-800 hover:bg-gray-700 text-indigo-300 border-gray-700 hover:border-indigo-500/30'
                        }`}
                    >
                        <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                        AI Study Buddy
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <CoursePlayerSidebar
                        subjects={subjects}
                        activeResource={activeResource}
                        onSelectResource={handleSelectResource}
                        completedResourceIds={completedResources}
                    />
                </div>
            </div>
            {showMobileLessons && (
                <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setShowMobileLessons(false)} />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/95 px-4 py-3 lg:hidden">
                    <button
                        onClick={() => setShowMobileLessons(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-bold text-gray-100"
                    >
                        <Menu className="h-4 w-4" />
                        Lessons
                    </button>
                    <span className="truncate pl-3 text-sm font-semibold text-gray-400">{activeResource?.title || course.title}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    {activeResource ? (
                        <>
                            <CoursePlayerContent resource={activeResource} />
                            <div className="max-w-4xl mx-auto mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
                                <button
                                    onClick={handleNextLesson}
                                    disabled={!nextResource}
                                    className="flex items-center justify-center px-6 py-4 rounded-xl font-bold text-lg border border-gray-700 text-gray-200 transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next Lesson
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </button>
                                <button
                                    onClick={handleMarkComplete}
                                    disabled={isCompleted || markingComplete}
                                    className={`flex items-center px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${isCompleted
                                        ? 'bg-emerald-500/20 text-emerald-400 cursor-default border border-emerald-500/30'
                                        : markingComplete ? 'bg-gray-700 text-gray-300 cursor-wait'
                                        : 'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20 hover:shadow-indigo-500/30 ring-1 ring-white/10'
                                        }`}
                                >
                                    <CheckCircle className="w-6 h-6 mr-3" />
                                    {isCompleted ? 'Completed' : markingComplete ? 'Saving...' : 'Mark as Complete'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select a lesson to start learning
                        </div>
                    )}
                </div>
            </div>

            {/* AI Study Buddy Sidebar */}
            {showStudyBuddy && activeResource && (
                <AIStudyBuddy
                    courseTitle={course.title}
                    lessonTitle={activeResource.title}
                    lessonDescription={activeResource.description || ''}
                    onClose={() => setShowStudyBuddy(false)}
                />
            )}
        </div>
    );
};

const sortSubjects = (subjects: Subject[]) => subjects
    .slice()
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    .map(subject => ({
        ...subject,
        resources: (subject.resources || []).slice().sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    }));

const getFlattenedResources = (subjects: Subject[]) => subjects.flatMap(subject => subject.resources || []);

const getFirstIncompleteResource = (subjects: Subject[], completedResourceIds: number[]) =>
    getFlattenedResources(subjects).find(resource => !completedResourceIds.includes(resource.id));
