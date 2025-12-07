import type { Resource } from '../../types/enrollment';
import { FileText, ExternalLink, Download } from 'lucide-react';

interface CoursePlayerContentProps {
    resource: Resource;
}

export const CoursePlayerContent = ({ resource }: CoursePlayerContentProps) => {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{resource.title}</h1>

            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-8">
                {resource.resource_type === 'video' && resource.file_url ? (
                    <div className="aspect-video bg-black">
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
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <FileText className="w-16 h-16 text-gray-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">PDF Document</h3>
                        <p className="text-gray-400 mb-6">This lesson contains a PDF document.</p>
                        {resource.file_url && (
                            <a
                                href={resource.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <ExternalLink className="w-16 h-16 text-gray-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">External Resource</h3>
                        <p className="text-gray-400 mb-6">This lesson links to an external resource.</p>
                        {resource.external_link && (
                            <a
                                href={resource.external_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open Link
                            </a>
                        )}
                    </div>
                )}
            </div>

            {resource.description && (
                <div className="prose prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-300">{resource.description}</p>
                </div>
            )}
        </div>
    );
};
