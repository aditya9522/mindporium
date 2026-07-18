import { useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Edit3, File, FileText, Trash2, X } from 'lucide-react';

import type { NoteFile } from '../types';
import { isAudio, isImage, isPDF, isVideo } from '../utils';

interface FilePreviewModalProps {
    file: NoteFile;
    editable: boolean;
    onClose: () => void;
    onRename: (newName: string) => Promise<void>;
    onRemove: () => void;
}

export const FilePreviewModal = ({ file, editable, onClose, onRename, onRemove }: FilePreviewModalProps) => {
    const [name, setName] = useState(file.name);
    const [renaming, setRenaming] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [rotate, setRotate] = useState(0);

    const handleSaveRename = async () => {
        if (!name.trim()) {
            toast.error('File name cannot be empty');
            return;
        }

        if (name === file.name) {
            setRenaming(false);
            return;
        }

        try {
            await onRename(name);
            setRenaming(false);
        } catch {
            // Parent displays the error toast.
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(file.url);
        toast.success('File link copied to clipboard');
    };

    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 shadow-2xl" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className="relative z-10 flex flex-col md:flex-row bg-white dark:bg-gray-950 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
                onClick={event => event.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 md:hidden p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex-1 bg-gray-900 flex flex-col justify-center items-center p-4 relative overflow-hidden group min-h-[40vh] md:min-h-0">
                    {isImage(file.type) && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/75 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-semibold z-10 opacity-90 hover:opacity-100 transition-opacity shadow-lg">
                            <button onClick={() => setZoom(value => Math.max(0.5, value - 0.25))} className="hover:text-primary-400 transition-colors px-1" title="Zoom Out">
                                -
                            </button>
                            <span>{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(value => Math.min(3, value + 0.25))} className="hover:text-primary-400 transition-colors px-1" title="Zoom In">
                                +
                            </button>
                            <span className="w-px h-3 bg-white/20 mx-1" />
                            <button onClick={() => setRotate(value => (value + 90) % 360)} className="hover:text-primary-400 transition-colors px-1" title="Rotate">
                                Rotate 90 deg
                            </button>
                            <span className="w-px h-3 bg-white/20 mx-1" />
                            <button
                                onClick={() => {
                                    setZoom(1);
                                    setRotate(0);
                                }}
                                className="hover:text-primary-400 transition-colors px-1"
                            >
                                Reset
                            </button>
                        </div>
                    )}

                    <div className="w-full h-full flex items-center justify-center overflow-auto">
                        {isImage(file.type) && (
                            <img
                                src={file.url}
                                alt={file.name}
                                style={{
                                    transform: `scale(${zoom}) rotate(${rotate}deg)`,
                                    transition: 'transform 0.15s ease-out',
                                }}
                                className="max-w-full max-h-[65vh] object-contain shadow-lg rounded-md"
                            />
                        )}
                        {isPDF(file.type) && (
                            <iframe src={file.url} className="w-full h-full border-0 bg-white rounded-lg shadow-lg" title={file.name} />
                        )}
                        {isVideo(file.type) && (
                            <video src={file.url} controls className="w-full max-h-[60vh] bg-black rounded-lg shadow-lg" />
                        )}
                        {isAudio(file.type) && (
                            <div className="flex flex-col items-center gap-4 bg-white/5 backdrop-blur-md p-8 rounded-2xl w-full max-w-md border border-white/10 text-white text-center">
                                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-purple-400" />
                                </div>
                                <div className="min-w-0 w-full">
                                    <p className="font-semibold truncate text-sm">{file.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">Audio File</p>
                                </div>
                                <audio src={file.url} controls className="w-full mt-2" />
                            </div>
                        )}
                        {!isImage(file.type) && !isPDF(file.type) && !isVideo(file.type) && !isAudio(file.type) && (
                            <div className="flex flex-col items-center gap-4 bg-white/5 backdrop-blur-md p-8 rounded-2xl w-full max-w-sm border border-white/10 text-white text-center">
                                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center">
                                    <File className="w-8 h-8 text-primary-400" />
                                </div>
                                <div>
                                    <p className="font-semibold truncate text-sm">{file.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">{file.type || 'Document'}</p>
                                </div>
                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors mt-2"
                                >
                                    <Download className="w-3.5 h-3.5" /> Download File
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-80 bg-white dark:bg-gray-950 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 p-5 flex flex-col h-full overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4 shrink-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Attachment Options</h3>
                        <button
                            onClick={onClose}
                            className="hidden md:block p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 space-y-4 min-w-0">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                File Name
                            </label>
                            {renaming ? (
                                <div className="flex gap-1.5 items-center mt-1">
                                    <input
                                        value={name}
                                        onChange={event => setName(event.target.value)}
                                        className="flex-1 text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-850 dark:text-gray-200 outline-none focus:ring-1 focus:ring-primary-500"
                                        placeholder="Enter new name"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSaveRename}
                                        className="px-2.5 py-1.5 text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setName(file.name);
                                            setRenaming(false);
                                        }}
                                        className="px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2 mt-1">
                                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 break-all">{file.name}</p>
                                    {editable && (
                                        <button
                                            onClick={() => setRenaming(true)}
                                            className="text-gray-400 hover:text-primary-500 shrink-0 p-0.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            title="Rename file"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                                Details
                            </label>
                            <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex justify-between gap-2">
                                    <span>Type:</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-40">
                                        {file.type || 'Unknown'}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <span>Link:</span>
                                    <button
                                        onClick={copyToClipboard}
                                        className="font-medium text-primary-500 hover:underline truncate text-left max-w-40"
                                    >
                                        Copy Direct URL
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2 mt-auto shrink-0">
                        <a
                            href={file.url}
                            download={file.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-lg hover:bg-primary-100 transition-colors"
                        >
                            <Download className="w-3.5 h-3.5" /> Download File
                        </a>

                        {editable && (
                            <button
                                onClick={onRemove}
                                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Remove Attachment
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
