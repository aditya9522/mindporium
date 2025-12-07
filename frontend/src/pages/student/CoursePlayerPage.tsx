import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { courseService } from '../../services/course.service';
import { subjectService } from '../../services/subject.service';
import type { Course } from '../../types/course';
import type { Subject, Resource } from '../../types/enrollment';
import { CoursePlayerSidebar } from '../../components/student/CoursePlayerSidebar';
import { CoursePlayerContent } from '../../components/student/CoursePlayerContent';
import { Loader2, ArrowLeft, MessageSquare, CheckCircle } from 'lucide-react';
import api from '../../lib/axios';
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
    const [completedResources, setCompletedResources] = useState<number[]>([]);

    // Fetch course data
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [courseData, subjectsData, progressData] = await Promise.all([
                    courseService.getCourse(Number(id)),
                    subjectService.getCourseSubjects(Number(id)),
                    api.get(`/enrollments/progress/${id}`).catch(() => ({ data: { completed_resource_ids: [] } }))
                ]);

                setCourse(courseData);
                setSubjects(subjectsData);

                if (progressData.data?.completed_resource_ids) {
                    setCompletedResources(progressData.data.completed_resource_ids);
                }
            } catch (error) {
                console.error('Failed to load course content:', error);
                toast.error('Failed to load course content');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

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
                const firstResource = subjects[0].resources?.[0];
                if (firstResource) {
                    setActiveResource(firstResource);
                    // Optionally replace URL to correct one, but avoiding continuous redirect loop is key
                }
            }
        } else {
            // No param, default to first resource
            const firstResource = subjects[0].resources?.[0];
            if (firstResource) {
                setActiveResource(firstResource);
            }
        }
    }, [loading, subjects, resourceIdParam]);

    const handleSelectResource = (resource: Resource) => {
        setSearchParams({ resource: resource.id.toString() });
        // State update will happen via useEffect when URL param changes
    };

    const handleMarkComplete = async () => {
        if (!activeResource) return;
        try {
            await api.post(`/enrollments/resource/${activeResource.id}/complete`);
            setCompletedResources(prev => [...prev, activeResource.id]);
            toast.success('Lesson marked as complete');
            // Optional: Auto-advance to next lesson?
        } catch (error) {
            toast.error('Failed to mark complete');
        }
    };

    const isCompleted = activeResource ? completedResources.includes(activeResource.id) : false;

    const totalResources = subjects.reduce((acc, subject) => acc + (subject.resources?.length || 0), 0);
    const progressPercentage = totalResources > 0 ? Math.round((completedResources.length / totalResources) * 100) : 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    if (!course) return null;

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                    <button
                        onClick={() => navigate('/my-learning')}
                        className="flex items-center text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </button>
                    <h2 className="font-bold text-lg line-clamp-2 mb-3">{course.title}</h2>

                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>{progressPercentage}% Complete</span>
                            <span>{completedResources.length}/{totalResources} Lessons</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                    <a
                        href={`/community/course/${course.id}/qa`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors text-sm"
                    >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Course Community
                    </a>
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8">
                    {activeResource ? (
                        <>
                            <CoursePlayerContent resource={activeResource} />
                            <div className="max-w-4xl mx-auto mt-8 flex justify-end">
                                <button
                                    onClick={handleMarkComplete}
                                    disabled={isCompleted || false}
                                    className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${isCompleted
                                        ? 'bg-green-600 text-white cursor-default'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        }`}
                                >
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    {isCompleted ? 'Completed' : 'Mark as Complete'}
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
        </div>
    );
};
