import type { Resource } from '../../types/enrollment';
import { FileText, ExternalLink, Download } from 'lucide-react';

interface CoursePlayerContentProps {
    resource: Resource;
}

export const CoursePlayerContent = ({ resource }: CoursePlayerContentProps) => {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{resource.title}</h1>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-gray-700/50 mb-8 ring-1 ring-white/5">
                {resource.resource_type === 'video' && resource.file_url ? (
                    <div className="aspect-video bg-black relative group">
                        <video
                            src={resource.file_url}
                            controls
                            className="w-full h-full"
                            controlsList="nodownload"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                ) : resource.resource_type === 'pdf' ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center bg-linear-to-b from-gray-800 to-gray-900">
                        <div className="w-20 h-20 bg-gray-700/50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-gray-600">
                            <FileText className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">PDF Document</h3>
                        <p className="text-gray-400 mb-8 max-w-sm">This lesson contains additional reading material in PDF format.</p>
                        {resource.file_url && (
                            <a
                                href={resource.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-indigo-500/20 transform hover:-translate-y-0.5"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                Download PDF
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="p-16 flex flex-col items-center justify-center text-center bg-linear-to-b from-gray-800 to-gray-900">
                        <div className="w-20 h-20 bg-gray-700/50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-gray-600">
                            <ExternalLink className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">External Resource</h3>
                        <p className="text-gray-400 mb-8 max-w-sm">This lesson links to an external resource for further learning.</p>
                        {resource.external_link && (
                            <a
                                href={resource.external_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-emerald-500/20 transform hover:-translate-y-0.5"
                            >
                                <ExternalLink className="w-5 h-5 mr-2" />
                                Open Resource
                            </a>
                        )}
                    </div>
                )}
            </div>

            {resource.description && (
                <div className="prose prose-invert max-w-none">
                    <h3 className="text-xl font-bold mb-3 text-white">About this lesson</h3>
                    <p className="text-gray-300 leading-relaxed text-lg">{resource.description}</p>
                </div>
            )}
        </div>
    );
};
