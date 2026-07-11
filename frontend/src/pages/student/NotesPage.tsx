import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { SummernoteEditor } from '../../components/editor/SummernoteEditor';
import {
    Plus, Search, StickyNote, Trash2, Save, Tag, Clock, FileText,
    File, Download, X, Edit3, Upload, Loader2, ChevronDown,
    AlertCircle, Archive, CheckCircle, Hash, Maximize2, Image as ImageIcon,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface NoteFile {
    name: string;
    url: string;
    type: string;
}

interface Note {
    id: number;
    title: string;
    content: string;          // HTML from Summernote
    files: NoteFile[];
    tags: string[];
    status: 'active' | 'draft' | 'archived';
    user_id: number;
    created_at: string;
    updated_at: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    active:   { label: 'Active',   color: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40', dot: 'bg-emerald-500', icon: CheckCircle },
    draft:    { label: 'Draft',    color: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40',         dot: 'bg-amber-500',   icon: Edit3 },
    archived: { label: 'Archived', color: 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-800',               dot: 'bg-gray-400',    icon: Archive },
} as const;

const stripHtml = (html: string): string => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
};

const relativeTime = (dateStr: string): string => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isImage = (type: string) => type?.startsWith('image/');
const isPDF   = (type: string) => type === 'application/pdf';
const isVideo = (type: string) => type?.startsWith('video/');
const isAudio = (type: string) => type?.startsWith('audio/');

// ─── File Preview ─────────────────────────────────────────────────────────────

const FilePreviewItem = ({ file, onRemove }: { file: NoteFile; onRemove?: () => void }) => {
    if (isImage(file.type)) {
        return (
            <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 aspect-video">
                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">{file.name}</p>
                </div>
                {onRemove && (
                    <button onClick={onRemove} className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        );
    }
    if (isPDF(file.type)) {
        return (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <iframe src={file.url} className="w-full h-56" title={file.name} />
                <div className="flex items-center justify-between p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                    {onRemove && <button onClick={onRemove} className="ml-2 text-red-500 hover:text-red-700 shrink-0"><X className="w-3.5 h-3.5" /></button>}
                </div>
            </div>
        );
    }
    if (isVideo(file.type)) {
        return (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <video src={file.url} controls className="w-full max-h-52 bg-black" />
                {onRemove && (
                    <button onClick={onRemove} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
                <p className="text-xs p-2 text-gray-500 truncate">{file.name}</p>
            </div>
        );
    }
    if (isAudio(file.type)) {
        return (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate flex-1">{file.name}</span>
                    {onRemove && <button onClick={onRemove} className="text-red-500 hover:text-red-700 shrink-0"><X className="w-3.5 h-3.5" /></button>}
                </div>
                <audio src={file.url} controls className="w-full h-8" />
            </div>
        );
    }
    return (
        <div className="group flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
            <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
                <File className="w-5 h-5 text-primary-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{file.type || 'File'}</p>
            </div>
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 hover:bg-primary-100 transition-colors" title="Download">
                    <Download className="w-3.5 h-3.5" />
                </a>
                {onRemove && (
                    <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── Note Card ────────────────────────────────────────────────────────────────

const NoteCard = ({ note, onOpen, onDelete }: { note: Note; onOpen: (n: Note) => void; onDelete: (id: number) => void }) => {
    const cfg = STATUS_CONFIG[note.status];
    const preview = stripHtml(note.content);
    const imgFiles = note.files.filter(f => isImage(f.type));

    return (
        <div
            className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col"
            onClick={() => onOpen(note)}
        >
            {/* Top accent bar */}
            <div className={`h-1 w-full ${cfg.dot === 'bg-emerald-500' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : cfg.dot === 'bg-amber-500' ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-gray-300 to-gray-400'}`} />

            {/* Thumbnail image if available */}
            {imgFiles.length > 0 && (
                <div className="w-full h-36 overflow-hidden">
                    <img src={imgFiles[0].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
            )}

            <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Header */}
                <div className="flex items-start gap-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 flex-1 leading-snug">{note.title}</h3>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
                        {cfg.label}
                    </span>
                </div>

                {/* Content preview */}
                {preview && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">{preview}</p>
                )}

                {/* Tags */}
                {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {note.tags.slice(0, 3).map(t => (
                            <span key={t} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-semibold rounded-full border border-primary-200 dark:border-primary-800">
                                <Hash className="w-2 h-2" />
                                {t}
                            </span>
                        ))}
                        {note.tags.length > 3 && <span className="text-[10px] text-gray-400 self-center">+{note.tags.length - 3}</span>}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 mt-auto">
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {relativeTime(note.updated_at)}</span>
                        {note.files.length > 0 && <span className="flex items-center gap-0.5"><File className="w-3 h-3" /> {note.files.length}</span>}
                        {imgFiles.length > 0 && <span className="flex items-center gap-0.5"><ImageIcon className="w-3 h-3" /> {imgFiles.length}</span>}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                            title="Open"
                            onClick={e => { e.stopPropagation(); onOpen(note); }}
                        >
                            <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                            onClick={e => { e.stopPropagation(); onDelete(note.id); }}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Full-Screen Note Modal ────────────────────────────────────────────────────

interface ModalProps {
    note: Note | null;
    isNew: boolean;
    onClose: () => void;
    onSaved: (note: Note) => void;
    onDeleted: (id: number) => void;
}

const NoteModal = ({ note, isNew, onClose, onSaved, onDeleted }: ModalProps) => {
    const [editing, setEditing] = useState(isNew);
    const [title,   setTitle]   = useState(note?.title ?? 'Untitled Note');
    const [content, setContent] = useState(note?.content ?? '');
    const [tags,    setTags]    = useState<string[]>(note?.tags ?? []);
    const [tagInput, setTagInput] = useState('');
    const [status,  setStatus]  = useState<'active' | 'draft' | 'archived'>(note?.status ?? 'active');
    const [files,   setFiles]   = useState<NoteFile[]>(note?.files ?? []);
    const [saving,    setSaving]    = useState(false);
    const [deleting,  setDeleting]  = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const cfg = STATUS_CONFIG[status];

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const addTag = () => {
        const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
        if (t && !tags.includes(t)) setTags(p => [...p, t]);
        setTagInput('');
    };

    const uploadFiles = async (fileList: FileList) => {
        setUploading(true);
        const uploaded: NoteFile[] = [];
        for (const f of Array.from(fileList)) {
            try {
                const fd = new FormData();
                fd.append('file', f);
                const { data } = await api.post<NoteFile>('/notes/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                uploaded.push(data);
            } catch { toast.error(`Upload failed: ${f.name}`); }
        }
        setFiles(p => [...p, ...uploaded]);
        if (uploaded.length) toast.success(`${uploaded.length} file(s) uploaded`);
        setUploading(false);
    };

    const handleSave = async () => {
        if (!title.trim()) { toast.error('Title is required'); return; }
        setSaving(true);
        try {
            const payload = { title, content, tags, status, files };
            if (note && !isNew) {
                const { data } = await api.put<Note>(`/notes/${note.id}`, payload);
                onSaved(data);
                toast.success('Note updated!');
            } else {
                const { data } = await api.post<Note>('/notes/', payload);
                onSaved(data);
                toast.success('Note created!');
            }
            setEditing(false);
        } catch { toast.error('Failed to save note'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!note || !confirm('Delete this note permanently?')) return;
        setDeleting(true);
        try {
            await api.delete(`/notes/${note.id}`);
            onDeleted(note.id);
            toast.success('Note deleted');
            onClose();
        } catch { toast.error('Delete failed'); }
        finally { setDeleting(false); }
    };

    const imgFiles   = files.filter(f => isImage(f.type));
    const otherFiles = files.filter(f => !isImage(f.type));

    return (
        <div className="fixed inset-0 z-[60] flex items-stretch" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Panel */}
            <div
                className="relative z-10 flex flex-col bg-white dark:bg-gray-950 w-full max-w-5xl mx-auto my-4 rounded-2xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="flex-1 min-w-0">
                        {editing ? (
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full text-xl font-extrabold bg-transparent text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 border-none outline-none"
                                placeholder="Note title…"
                            />
                        ) : (
                            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white truncate">{title}</h2>
                        )}
                    </div>

                    {/* Status badge / selector */}
                    {editing ? (
                        <div className="relative shrink-0">
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value as any)}
                                className="appearance-none pl-3 pr-7 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer"
                            >
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        </div>
                    ) : (
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase shrink-0 ${cfg.color}`}>
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                        </span>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        {note && !isNew && (
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            >
                                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                Delete
                            </button>
                        )}
                        {editing ? (
                            <>
                                <button
                                    onClick={() => { if (!isNew) setEditing(false); else onClose(); }}
                                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
                                >
                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    Save
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-all"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto">
                    {editing ? (
                        /* EDIT MODE */
                        <div className="p-6 space-y-5">
                            {/* Tags */}
                            <div className="flex items-center gap-2 flex-wrap p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                                {tags.map(t => (
                                    <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-full border border-primary-200 dark:border-primary-800">
                                        #{t}
                                        <button onClick={() => setTags(tags.filter(x => x !== t))} className="hover:text-red-500 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addTag())}
                                    placeholder="Add tag…"
                                    className="text-xs bg-transparent text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none border-none min-w-[80px]"
                                />
                            </div>

                            {/* Summernote WYSIWYG */}
                            <SummernoteEditor
                                value={content}
                                onChange={setContent}
                                height={380}
                                placeholder="Start writing your note…"
                            />

                            {/* File Upload */}
                            <div>
                                <div
                                    className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 rounded-xl p-5 text-center cursor-pointer transition-all group bg-gray-50 dark:bg-gray-800/30 hover:bg-primary-50/50 dark:hover:bg-primary-900/10"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={e => { e.preventDefault(); e.dataTransfer.files.length && uploadFiles(e.dataTransfer.files); }}
                                >
                                    {uploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                                            <p className="text-sm text-primary-600 font-medium">Uploading…</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">Drop files or click to upload</p>
                                            <p className="text-xs text-gray-400">Images, PDFs, videos, audio, docs — any type</p>
                                        </div>
                                    )}
                                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => e.target.files && uploadFiles(e.target.files)} />
                                </div>

                                {files.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Attachments ({files.length})</p>
                                        {imgFiles.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {imgFiles.map((f, i) => <FilePreviewItem key={i} file={f} onRemove={() => setFiles(p => p.filter((_, j) => j !== files.indexOf(f)))} />)}
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            {otherFiles.map((f, i) => <FilePreviewItem key={i} file={f} onRemove={() => setFiles(p => p.filter(x => x !== f))} />)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* VIEW MODE */
                        <div className="p-6 space-y-6">
                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 dark:text-gray-500 pb-4 border-b border-gray-100 dark:border-gray-800">
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Updated {note ? relativeTime(note.updated_at) : ''}</span>
                                {files.length > 0 && <span className="flex items-center gap-1"><File className="w-3.5 h-3.5" /> {files.length} attachment{files.length > 1 ? 's' : ''}</span>}
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {tags.map(t => (
                                            <span key={t} className="flex items-center gap-0.5 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-[10px] font-semibold rounded-full border border-primary-200 dark:border-primary-800">
                                                <Hash className="w-2.5 h-2.5" />{t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Rendered HTML content */}
                            {content ? (
                                <div
                                    className="prose prose-sm sm:prose max-w-none dark:prose-invert
                                        prose-headings:font-bold prose-headings:tracking-tight
                                        prose-p:leading-7 prose-p:text-gray-700 dark:prose-p:text-gray-300
                                        prose-a:text-primary-600 dark:prose-a:text-primary-400
                                        prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                                        prose-blockquote:border-primary-400
                                        prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                                        prose-ul:marker:text-primary-500 prose-ol:marker:text-primary-500
                                        [&_table]:border-collapse [&_td]:border [&_th]:border [&_td]:border-gray-300 [&_th]:border-gray-300 [&_td]:p-2 [&_th]:p-2 [&_th]:bg-gray-50 dark:[&_th]:bg-gray-800 dark:[&_td]:border-gray-700 dark:[&_th]:border-gray-700"
                                    dangerouslySetInnerHTML={{ __html: content }}
                                />
                            ) : (
                                <div className="flex items-center gap-3 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <AlertCircle className="w-5 h-5 text-gray-400 shrink-0" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No content yet. Click <strong>Edit</strong> to start writing.</p>
                                </div>
                            )}

                            {/* Attachments view */}
                            {files.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <File className="w-4 h-4" /> Attachments ({files.length})
                                    </p>
                                    {imgFiles.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {imgFiles.map((f, i) => <FilePreviewItem key={i} file={f} />)}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {otherFiles.map((f, i) => <FilePreviewItem key={i} file={f} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Main Notes Page ──────────────────────────────────────────────────────────

export const NotesPage = () => {
    const [notes,       setNotes]       = useState<Note[]>([]);
    const [loading,     setLoading]     = useState(true);
    const [openNote,    setOpenNote]    = useState<Note | null>(null);
    const [isNewModal,  setIsNewModal]  = useState(false);
    const [search,      setSearch]      = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const loadNotes = useCallback(async () => {
        try {
            const { data } = await api.get<Note[]>('/notes/');
            setNotes(data);
        } catch { toast.error('Failed to load notes'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadNotes(); }, [loadNotes]);

    const filtered = notes.filter(n => {
        const text = stripHtml(n.content);
        const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
            text.toLowerCase().includes(search.toLowerCase()) ||
            n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchStatus = filterStatus === 'all' || n.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const handleSaved = (saved: Note) => {
        setNotes(prev => {
            const idx = prev.findIndex(n => n.id === saved.id);
            if (idx >= 0) { const copy = [...prev]; copy[idx] = saved; return copy; }
            return [saved, ...prev];
        });
        setOpenNote(saved);
        setIsNewModal(false);
    };

    const handleDeleted = (id: number) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        setOpenNote(null);
        setIsNewModal(false);
    };

    const openNew = () => { setOpenNote(null); setIsNewModal(true); };

    const statusCounts = {
        active:   notes.filter(n => n.status === 'active').length,
        draft:    notes.filter(n => n.status === 'draft').length,
        archived: notes.filter(n => n.status === 'archived').length,
    };

    return (
        <div className="min-h-full bg-gray-50 dark:bg-gray-950 px-4 sm:px-6 py-6 space-y-6">

            {/* ── Page Header ──────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <StickyNote className="w-6 h-6 text-primary-600" />
                        My Notes
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{notes.length} note{notes.length !== 1 ? 's' : ''} · {statusCounts.active} active, {statusCounts.draft} drafts</p>
                </div>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-primary-200/50 dark:shadow-none hover:shadow-primary-300 hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4" />
                    New Note
                </button>
            </div>

            {/* ── Filters Bar ──────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search notes…"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all text-gray-700 dark:text-gray-300 placeholder-gray-400 shadow-sm"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1 shadow-sm">
                    {([['all', 'All'], ['active', 'Active'], ['draft', 'Draft'], ['archived', 'Archived']] as const).map(([val, label]) => (
                        <button
                            key={val}
                            onClick={() => setFilterStatus(val)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${filterStatus === val ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                            {label}
                            {val !== 'all' && <span className={`ml-1 ${filterStatus === val ? 'text-primary-200' : 'text-gray-400'}`}>·{val === 'active' ? statusCounts.active : val === 'draft' ? statusCounts.draft : statusCounts.archived}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Notes Grid ───────────────────────────────────────────── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                    <p className="text-sm text-gray-400">Loading notes…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-5 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center">
                        <StickyNote className="w-10 h-10 text-primary-500" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{search ? 'No matching notes' : 'No notes yet'}</p>
                        <p className="text-sm text-gray-400 mt-1">{search ? 'Try a different search term' : 'Click "New Note" to create your first note'}</p>
                    </div>
                    {!search && (
                        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md">
                            <Plus className="w-4 h-4" />
                            Create Note
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(note => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onOpen={n => { setOpenNote(n); setIsNewModal(false); }}
                            onDelete={handleDeleted}
                        />
                    ))}
                </div>
            )}

            {/* ── Full-Screen Modal ─────────────────────────────────────── */}
            {(openNote !== null || isNewModal) && (
                <NoteModal
                    note={openNote}
                    isNew={isNewModal}
                    onClose={() => { setOpenNote(null); setIsNewModal(false); }}
                    onSaved={handleSaved}
                    onDeleted={handleDeleted}
                />
            )}
        </div>
    );
};
