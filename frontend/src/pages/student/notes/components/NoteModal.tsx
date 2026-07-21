import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
    AlertCircle,
    BookOpen,
    ChevronDown,
    Circle,
    Clock,
    Copy,
    Edit3,
    File,
    Hash,
    Loader2,
    Pin,
    PinOff,
    Save,
    Tag,
    Trash2,
    Upload,
    X,
} from 'lucide-react';

import api from '../../../../lib/axios';
import { RichTextEditor } from '../../../../components/editor/RichTextEditor';
import { getColorDot, STATUS_CONFIG } from '../constants';
import type { DeleteConfirmationState, Note, NoteFile } from '../types';
import { readTime, relativeTime, wordCount } from '../utils';
import { ColorPicker } from './ColorPicker';
import { FilePreviewItem } from './FilePreviewItem';
import { FilePreviewModal } from './FilePreviewModal';

interface NoteModalProps {
    note: Note | null;
    isNew: boolean;
    onClose: () => void;
    onSaved: (note: Note) => void;
    onDeleted: (id: number) => void;
    onPinToggled: (note: Note) => void;
    onRequestConfirm: (config: DeleteConfirmationState) => void;
}

export const NoteModal = ({
    note,
    isNew,
    onClose,
    onSaved,
    onDeleted,
    onPinToggled,
    onRequestConfirm,
}: NoteModalProps) => {
    const [editing, setEditing] = useState(isNew);
    const [title, setTitle] = useState(note?.title ?? 'Untitled Note');
    const [content, setContent] = useState(note?.content ?? '');
    const [tags, setTags] = useState<string[]>(note?.tags ?? []);
    const [tagInput, setTagInput] = useState('');
    const [status, setStatus] = useState<Note['status']>(note?.status ?? 'active');
    const [files, setFiles] = useState<NoteFile[]>(note?.files ?? []);
    const [color, setColor] = useState<string | null>(note?.color ?? null);
    const [saving, setSaving] = useState(false);
    const [duplicating, setDuplicating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewingFile, setPreviewingFile] = useState<NoteFile | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const cfg = STATUS_CONFIG[status];
    const wc = wordCount(content);
    const neutralIconButtonClass = 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white';
    const primaryIconButtonClass = 'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300';
    const dangerIconButtonClass = 'text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400';

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !previewingFile) onClose();
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose, previewingFile]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const addTag = () => {
        const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
        if (tag && !tags.includes(tag)) setTags(prev => [...prev, tag]);
        setTagInput('');
    };

    const uploadFiles = async (fileList: FileList) => {
        setUploading(true);
        const uploaded: NoteFile[] = [];

        for (const file of Array.from(fileList)) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const { data } = await api.post<NoteFile>('/notes/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                uploaded.push(data);
            } catch {
                toast.error(`Upload failed: ${file.name}`);
            }
        }

        setFiles(prev => [...prev, ...uploaded]);
        if (uploaded.length) toast.success(`${uploaded.length} file(s) uploaded`);
        setUploading(false);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                title,
                content,
                tags,
                status,
                files,
                color,
                is_pinned: note?.is_pinned ?? false,
            };

            if (note && !isNew) {
                const { data } = await api.put<Note>(`/notes/${note.id}`, payload);
                onSaved(data);
                toast.success('Note saved');
            } else {
                const { data } = await api.post<Note>('/notes/', payload);
                onSaved(data);
                toast.success('Note created');
            }

            setEditing(false);
        } catch {
            toast.error('Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = () => {
        if (!note) return;

        onRequestConfirm({
            title: 'Delete note?',
            message: 'This note will be permanently deleted and its unused attachments will be removed from storage.',
            itemName: title,
            confirmLabel: 'Delete',
            onConfirm: async () => {
                await api.delete(`/notes/${note.id}`);
                onDeleted(note.id);
                toast.success('Note deleted');
                onClose();
            },
        });
    };

    const handleDuplicate = async () => {
        if (!note || isNew) return;

        setDuplicating(true);
        try {
            const { data } = await api.post<Note>(`/notes/${note.id}/duplicate`);
            onSaved(data);
            toast.success('Note duplicated');
            onClose();
        } catch {
            toast.error('Duplicate failed');
        } finally {
            setDuplicating(false);
        }
    };

    const handlePin = async () => {
        if (!note || isNew) return;

        try {
            const { data } = await api.patch<Note>(`/notes/${note.id}/pin`);
            onPinToggled(data);
            toast.success(data.is_pinned ? 'Note pinned' : 'Note unpinned');
        } catch {
            toast.error('Failed to update pin');
        }
    };

    const handleRemoveFile = async (fileToRemove: NoteFile) => {
        const updatedFiles = files.filter(file => file.url !== fileToRemove.url);
        setFiles(updatedFiles);

        if (!isNew && note && !editing) {
            try {
                const payload = {
                    title,
                    content,
                    tags,
                    status,
                    files: updatedFiles,
                    color,
                    is_pinned: note.is_pinned,
                };
                const { data } = await api.put<Note>(`/notes/${note.id}`, payload);
                onSaved(data);
                toast.success('Attachment removed');
            } catch {
                toast.error('Failed to remove attachment');
            }
        } else {
            try {
                await api.delete('/notes/attachment', { params: { url: fileToRemove.url } });
            } catch {
                toast.error('Attachment removed, but storage cleanup failed');
                return;
            }
            toast.success('Attachment removed');
        }
    };

    const handleRemoveFileClick = (file: NoteFile) => {
        onRequestConfirm({
            title: 'Remove file?',
            message: 'This attachment will be removed from the note and deleted from storage if it is not used anywhere else.',
            itemName: file.name,
            confirmLabel: 'Remove',
            onConfirm: async () => {
                await handleRemoveFile(file);
            },
        });
    };

    const handleRenameFile = async (fileToRename: NoteFile, newName: string) => {
        const updatedFiles = files.map(file => (file.url === fileToRename.url ? { ...file, name: newName } : file));
        setFiles(updatedFiles);

        if (!isNew && note && !editing) {
            try {
                const payload = {
                    title,
                    content,
                    tags,
                    status,
                    files: updatedFiles,
                    color,
                    is_pinned: note.is_pinned,
                };
                const { data } = await api.put<Note>(`/notes/${note.id}`, payload);
                onSaved(data);
                toast.success('File renamed');
            } catch {
                toast.error('Failed to rename file');
                throw new Error('Failed to rename file');
            }
        } else {
            toast.success('File renamed');
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5" onClick={onClose}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                <div
                    className="relative z-10 flex flex-col bg-white dark:bg-gray-950 w-full max-w-5xl h-[88vh] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors duration-300"
                    onClick={event => event.stopPropagation()}
                >
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
                        {color && <div className={`w-1.5 h-6 rounded-full ${getColorDot(color)} shrink-0`} />}
                        <div className="flex-1 min-w-0">
                            {editing ? (
                                <input
                                    value={title}
                                    onChange={event => setTitle(event.target.value)}
                                    autoFocus
                                    className="w-full text-base font-semibold bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                                    placeholder="Note title..."
                                />
                            ) : (
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate">{title}</h2>
                            )}
                        </div>

                        {editing ? (
                            <div className="relative shrink-0">
                                <select
                                    value={status}
                                    onChange={event => setStatus(event.target.value as Note['status'])}
                                    className="appearance-none pl-3 pr-6 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-400 cursor-pointer"
                                >
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                    <option value="archived">Archived</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            </div>
                        ) : (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${cfg.badge}`}>
                                {cfg.label}
                            </span>
                        )}

                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 shrink-0" />
                        <div className="flex items-center gap-0.5 shrink-0">
                            {note && !isNew && (
                                <>
                                    <button
                                        onClick={handlePin}
                                        title={note.is_pinned ? 'Unpin' : 'Pin note'}
                                        className={`p-2 rounded-lg text-sm transition-colors ${
                                            note.is_pinned
                                                ? primaryIconButtonClass
                                                : neutralIconButtonClass
                                        }`}
                                    >
                                        {note.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={handleDuplicate}
                                        disabled={duplicating}
                                        title="Duplicate note"
                                        className={`p-2 rounded-lg transition-colors disabled:opacity-60 ${neutralIconButtonClass}`}
                                    >
                                        {duplicating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={handleDeleteClick}
                                        title="Delete note"
                                        className={`p-2 rounded-lg transition-colors ${dangerIconButtonClass}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0" />
                                </>
                            )}

                            {editing ? (
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    title="Save note"
                                    className={`p-2 rounded-lg transition-colors disabled:opacity-60 ${primaryIconButtonClass}`}
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setEditing(true)}
                                    title="Edit note"
                                    className={`p-2 rounded-lg transition-colors ${primaryIconButtonClass}`}
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            )}

                            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0" />
                            <button
                                onClick={onClose}
                                title="Close"
                                className={`p-2 rounded-lg transition-colors ${neutralIconButtonClass}`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {editing ? (
                            <div className="p-5 space-y-4">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex items-center gap-2 flex-wrap flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 min-h-[38px]">
                                        <Tag className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0" />
                                        {tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="flex items-center gap-1 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium rounded-md border border-primary-100 dark:border-primary-800"
                                            >
                                                #{tag}
                                                <button
                                                    onClick={() => setTags(tags.filter(item => item !== tag))}
                                                    className="hover:text-red-500 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            value={tagInput}
                                            onChange={event => setTagInput(event.target.value)}
                                            onKeyDown={event => {
                                                if (event.key === 'Enter' || event.key === ',') {
                                                    event.preventDefault();
                                                    addTag();
                                                }
                                            }}
                                            placeholder="Add tag..."
                                            className="text-xs bg-transparent text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none min-w-[80px]"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shrink-0">
                                        <Circle className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                        <ColorPicker value={color} onChange={setColor} />
                                    </div>
                                </div>

                                <RichTextEditor
                                    value={content}
                                    onChange={setContent}
                                    height={520}
                                    placeholder="Start writing your note..."
                                />

                                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                    <span>{wc} words</span>
                                    <span>·</span>
                                    <span>{readTime(content)} read</span>
                                </div>

                                <div>
                                    <div
                                        className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 rounded-xl p-5 text-center cursor-pointer transition-all group"
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={event => event.preventDefault()}
                                        onDrop={event => {
                                            event.preventDefault();
                                            if (event.dataTransfer.files.length) uploadFiles(event.dataTransfer.files);
                                        }}
                                    >
                                        {uploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                                                <p className="text-sm text-primary-600 font-medium">Uploading...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1.5">
                                                <Upload className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                                <p className="text-sm font-medium text-gray-500 group-hover:text-primary-600">
                                                    Drop files or click to upload
                                                </p>
                                                <p className="text-xs text-gray-400">Images, PDFs, videos, audio, docs</p>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={event => event.target.files && uploadFiles(event.target.files)}
                                        />
                                    </div>

                                    {files.length > 0 && (
                                        <div className="mt-3 space-y-3">
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Attachments ({files.length})
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                {files.map((file, index) => (
                                                    <FilePreviewItem
                                                        key={`${file.url}-${index}`}
                                                        file={file}
                                                        onRemove={() => handleRemoveFileClick(file)}
                                                        onClick={() => setPreviewingFile(file)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-5 space-y-5">
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400 pb-4 border-b border-gray-100 dark:border-gray-800">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" /> {note ? relativeTime(note.updated_at) : ''}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="w-3.5 h-3.5" /> {wc} words · {readTime(content)}
                                    </span>
                                    {files.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <File className="w-3.5 h-3.5" /> {files.length} attachment{files.length > 1 ? 's' : ''}
                                        </span>
                                    )}
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-[10px] font-medium rounded-md border border-primary-100 dark:border-primary-800"
                                                >
                                                    <Hash className="w-2.5 h-2.5" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {content ? (
                                    <div
                                        className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-7 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700 prose-blockquote:border-primary-400 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_table]:border-collapse [&_td]:border [&_th]:border [&_td]:border-gray-200 [&_th]:border-gray-200 [&_td]:p-2 [&_th]:p-2 [&_th]:bg-gray-50 dark:[&_th]:bg-gray-800 dark:[&_td]:border-gray-700 dark:[&_th]:border-gray-700"
                                        dangerouslySetInnerHTML={{ __html: content }}
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                        <AlertCircle className="w-5 h-5 text-gray-400 shrink-0" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            No content yet. Click <strong>Edit</strong> to start writing.
                                        </p>
                                    </div>
                                )}

                                {files.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <File className="w-3.5 h-3.5" />
                                            Attachments ({files.length})
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {files.map((file, index) => (
                                                <FilePreviewItem
                                                    key={`${file.url}-${index}`}
                                                    file={file}
                                                    onClick={() => setPreviewingFile(file)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {previewingFile && (
                <FilePreviewModal
                    file={previewingFile}
                    editable={editing}
                    onClose={() => setPreviewingFile(null)}
                    onRename={newName => handleRenameFile(previewingFile, newName)}
                    onRemove={() => handleRemoveFileClick(previewingFile)}
                />
            )}
        </>
    );
};
