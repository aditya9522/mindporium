import { useState } from 'react';
import type { Subject, Resource } from '../../types/enrollment';
import { ChevronDown, ChevronRight, PlayCircle, FileText, Link as LinkIcon, CheckCircle } from 'lucide-react';

interface CoursePlayerSidebarProps {
    subjects: Subject[];
    activeResource: Resource | null;
    onSelectResource: (resource: Resource) => void;
    completedResourceIds?: number[];
}

export const CoursePlayerSidebar = ({ subjects, activeResource, onSelectResource, completedResourceIds = [] }: CoursePlayerSidebarProps) => {
    const [expandedSubjects, setExpandedSubjects] = useState<number[]>(subjects.map(s => s.id));

    const toggleSubject = (subjectId: number) => {
        setExpandedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <PlayCircle className="w-4 h-4" />;
            case 'pdf': return <FileText className="w-4 h-4" />;
            default: return <LinkIcon className="w-4 h-4" />;
        }
    };

    return (
        <div className="py-2">
            {subjects.map(subject => (
                <div key={subject.id} className="mb-1">
                    <button
                        onClick={() => toggleSubject(subject.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors text-left"
                    >
                        <span className="font-medium text-sm text-gray-200">{subject.title}</span>
                        {expandedSubjects.includes(subject.id) ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                    </button>

                    {expandedSubjects.includes(subject.id) && (
                        <div className="bg-gray-900">
                            {subject.resources?.map((resource) => {
                                const isCompleted = completedResourceIds.includes(resource.id);
                                return (
                                    <button
                                        key={resource.id}
                                        onClick={() => onSelectResource(resource)}
                                        className={`w-full flex items-center gap-3 p-3 pl-6 text-sm transition-colors ${activeResource?.id === resource.id
                                            ? 'bg-indigo-600/10 text-indigo-400 border-r-2 border-indigo-600'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0
                                        ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                                            {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                                        </div>

                                        <div className="flex-1 text-left truncate">
                                            {resource.title}
                                        </div>

                                        <div className="text-gray-500">
                                            {getIcon(resource.resource_type)}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
