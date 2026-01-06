import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronDown,
    ChevronRight,
    PlayCircle,
    FileText,
    HelpCircle,
    CheckCircle,
    Circle
} from 'lucide-react';
import api from '../../lib/axios';
import { PageLoader } from '../../components/common/PageLoader';

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
        return <PageLoader />;
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
        <div className="max-w-7xl mx-auto space-y-8 py-8 px-4 sm:px-6">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-10 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-700/50 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Course Content</h1>
                        <p className="text-gray-400 text-lg font-medium">
                            {subjects.length} sections • {totalResources} lectures
                        </p>
                    </div>
                </div>
                {/* Overall Progress Bar */}
                {totalResources > 0 && (
                    <div className="mt-8 relative z-10">
                        <div className="flex items-center justify-between text-sm font-semibold mb-3 tracking-wide uppercase">
                            <span className="text-gray-300">Your Progress</span>
                            <span className="text-indigo-400">{progressPercentage}% Complete</span>
                        </div>
                        <div className="h-2.5 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] transform translate-x-10 -translate-y-10 pointer-events-none">
                    <FileText className="w-64 h-64 text-white" />
                </div>
            </div>

            <div className="space-y-4">
                {subjects.map((subject) => (
                    <div key={subject.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_15px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all duration-300">
                        <button
                            onClick={() => toggleSubject(subject.id)}
                            className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50/50 transition-colors group"
                        >
                            <div className="flex items-center gap-5">
                                <div className={`p-2.5 rounded-xl transition-colors duration-300 ${expandedSubjects.includes(subject.id) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                                    {expandedSubjects.includes(subject.id)
                                        ? <ChevronDown className="w-5 h-5" />
                                        : <ChevronRight className="w-5 h-5" />
                                    }
                                </div>
                                <div className="text-left">
                                    <h3 className={`font-bold text-lg transition-colors ${expandedSubjects.includes(subject.id) ? 'text-indigo-900' : 'text-gray-900'}`}>{subject.title}</h3>
                                    <p className="text-sm text-gray-500 mt-0.5 font-medium">{subject.resources?.length || 0} lectures</p>
                                </div>
                            </div>
                        </button>

                        {expandedSubjects.includes(subject.id) && (
                            <div className="border-t border-gray-100 divide-y divide-gray-50 bg-gray-50/30">
                                {subject.resources?.map((resource) => {
                                    const isCompleted = completedResources.includes(resource.id);
                                    return (
                                        <button
                                            key={resource.id}
                                            onClick={() => handleResourceClick(resource)}
                                            className="w-full flex items-center justify-between p-4 pl-20 hover:bg-white hover:shadow-sm transition-all duration-200 group text-left relative"
                                        >
                                            <div className="absolute left-7 top-1/2 -translate-y-1/2">
                                                {isCompleted ? (
                                                    <CheckCircle className="w-5 h-5 text-emerald-500 drop-shadow-sm" />
                                                ) : (
                                                    <Circle className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="text-gray-400 group-hover:text-indigo-600 transition-colors bg-white p-1.5 rounded-lg border border-gray-100 shadow-sm group-hover:border-indigo-100">
                                                    {getIcon(resource.resource_type)}
                                                </div>
                                                <div>
                                                    <div className={`font-medium text-base transition-colors ${isCompleted ? 'text-gray-900' : 'text-gray-700 group-hover:text-indigo-700'}`}>
                                                        {resource.title}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 font-medium">
                                                        <span className="capitalize bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">{resource.resource_type}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="hidden group-hover:flex items-center text-sm font-bold text-indigo-600 pr-4 animate-in fade-in slide-in-from-right-2 duration-200">
                                                <span>Start</span>
                                                <PlayCircle className="w-4 h-4 ml-1.5 fill-current" />
                                            </div>
                                        </button>
                                    );
                                })}
                                {(!subject.resources || subject.resources.length === 0) && (
                                    <div className="p-8 text-center">
                                        <p className="text-gray-400 italic font-medium">No resources in this section.</p>
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
