import type { MouseEvent } from 'react';
import { File, FileText, X } from 'lucide-react';

import type { NoteFile } from '../types';
import { isAudio, isImage, isPDF, isVideo } from '../utils';

interface FilePreviewItemProps {
    file: NoteFile;
    onRemove?: () => void;
    onClick?: () => void;
}

const containerClass =
    'group flex items-center gap-3 p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:border-primary-300 transition-colors w-full sm:w-[240px] shrink-0';

const RemoveButton = ({ onRemove }: { onRemove?: () => void }) => {
    if (!onRemove) return null;

    return (
        <button
            onClick={onRemove}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors"
        >
            <X className="w-3.5 h-3.5" />
        </button>
    );
};

export const FilePreviewItem = ({ file, onRemove, onClick }: FilePreviewItemProps) => {
    const handleWrapperClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;

        if (target.closest('button') || target.closest('a')) return;
        onClick?.();
    };

    if (isImage(file.type)) {
        return (
            <div
                onClick={handleWrapperClick}
                className={`relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video bg-gray-50 dark:bg-gray-800 w-full sm:w-[220px] shrink-0 ${
                    onClick ? 'cursor-pointer' : ''
                }`}
            >
                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                <div className="absolute bottom-0 inset-x-0 p-2 bg-linear-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{file.name}</p>
                </div>
                {onRemove && (
                    <button
                        onClick={onRemove}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>
        );
    }

    const fileKind = isPDF(file.type)
        ? { label: 'PDF Document', icon: FileText, iconClass: 'text-red-500', bgClass: 'bg-red-50 dark:bg-red-900/30' }
        : isVideo(file.type)
          ? { label: 'Video File', icon: File, iconClass: 'text-amber-500', bgClass: 'bg-amber-50 dark:bg-amber-900/30' }
          : isAudio(file.type)
            ? { label: 'Audio File', icon: FileText, iconClass: 'text-purple-500', bgClass: 'bg-purple-50 dark:bg-purple-900/30' }
            : { label: file.type || 'File', icon: File, iconClass: 'text-primary-500', bgClass: 'bg-primary-50 dark:bg-primary-900/30' };
    const Icon = fileKind.icon;

    return (
        <div
            onClick={handleWrapperClick}
            className={`${containerClass} ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className={`w-8 h-8 ${fileKind.bgClass} rounded-md flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${fileKind.iconClass}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{fileKind.label}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <RemoveButton onRemove={onRemove} />
            </div>
        </div>
    );
};
