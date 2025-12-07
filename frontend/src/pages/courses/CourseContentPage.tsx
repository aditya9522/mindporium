import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronDown,
    ChevronRight,
    PlayCircle,
    FileText,
    HelpCircle,
    Loader2,
    CheckCircle,
    Circle
} from 'lucide-react';
import api from '../../lib/axios';

import type { Subject, Resource } from '../../types/enrollment';

export const CourseContentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSubjects, setExpandedSubjects] = useState<number[]>([]);
    const [completedResources, setCompletedResources] = useState<number[]>([]);

    useEffect(() => {
        if (id) {
            loadSubjects();
        }
    }, [id]);

    const loadSubjects = async () => {
        try {
            const [subjectsRes, progressRes] = await Promise.all([
                api.get(`/subjects/course/${id}`),
                api.get(`/enrollments/progress/${id}`).catch(() => ({ data: { completed_resource_ids: [] } }))
            ]);

            const data = subjectsRes.data;
            setSubjects(data);

            if (progressRes.data && progressRes.data.completed_resource_ids) {
                setCompletedResources(progressRes.data.completed_resource_ids);
            }

            // Expand first subject by default
            if (data.length > 0) {
                setExpandedSubjects([data[0].id]);
            }
        } catch (error) {
            console.error('Failed to load subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSubject = (subjectId: number) => {
        setExpandedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    const handleResourceClick = (resource: Resource) => {
        // Navigate to player or open resource
        if (resource.resource_type === 'video') {
            navigate(`/my-learning/${id}?resource=${resource.id}`);
        } else {
            // For now, open content view on player page
            navigate(`/my-learning/${id}?resource=${resource.id}`);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <PlayCircle className="w-5 h-5 text-indigo-600" />;
            case 'pdf': return <FileText className="w-5 h-5 text-orange-600" />;
            case 'quiz': return <HelpCircle className="w-5 h-5 text-purple-600" />;
            default: return <FileText className="w-5 h-5 text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (subjects.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <h3 className="text-lg font-medium text-gray-900">No content available</h3>
                <p className="text-gray-500 mt-2">This course has no published content yet.</p>
            </div>
        );
    }

    const totalResources = subjects.reduce((acc, s) => acc + (s.resources?.length || 0), 0);
    const progressPercentage = totalResources > 0 ? Math.round((completedResources.length / totalResources) * 100) : 0;

    return (
        <div className="max-w-4xl mx-auto space-y-6 py-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Course Content</h1>
                <p className="text-gray-500 mt-1">
                    {subjects.length} sections • {totalResources} lectures
                </p>
                {/* Overall Progress Bar */}
                {totalResources > 0 && (
                    <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                            {progressPercentage}% Complete
                        </span>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {subjects.map((subject) => (
                    <div key={subject.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <button
                            onClick={() => toggleSubject(subject.id)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {expandedSubjects.includes(subject.id)
                                    ? <ChevronDown className="w-5 h-5 text-gray-500" />
                                    : <ChevronRight className="w-5 h-5 text-gray-500" />
                                }
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-900">{subject.title}</h3>
                                    <p className="text-sm text-gray-500">{subject.resources?.length || 0} resources</p>
                                </div>
                            </div>
                        </button>

                        {expandedSubjects.includes(subject.id) && (
                            <div className="divide-y divide-gray-100">
                                {subject.resources?.map((resource) => {
                                    const isCompleted = completedResources.includes(resource.id);
                                    return (
                                        <button
                                            key={resource.id}
                                            onClick={() => handleResourceClick(resource)}
                                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-indigo-50 transition-colors group text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 pt-0.5">
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-gray-300" />
                                                    )}
                                                </div>
                                                {getIcon(resource.resource_type)}
                                                <div>
                                                    <div className={`font-medium group-hover:text-indigo-700 ${isCompleted ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {resource.title}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{resource.resource_type.charAt(0).toUpperCase() + resource.resource_type.slice(1)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                                {(!subject.resources || subject.resources.length === 0) && (
                                    <div className="p-4 text-sm text-gray-500 text-center italic">
                                        No resources in this section.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
