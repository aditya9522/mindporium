import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import {
    Plus, Search, StickyNote, Trash2, Save, Tag, Clock, FileText,
    File, Download, X, Eye, Edit3, Upload,
    Bold, Italic, Code, Heading1, Heading2, List, ListOrdered,
    Quote, Minus, Link as LinkIcon, CheckSquare, Loader2,
    ChevronDown, AlertCircle, Archive, CheckCircle, Hash
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
    content: string;
    files: NoteFile[];
    tags: string[];
    status: 'active' | 'draft' | 'archived';
    user_id: number;
    created_at: string;
    updated_at: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    active: { label: 'Active', color: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/60', icon: CheckCircle },
    draft: { label: 'Draft', color: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/60', icon: Edit3 },
    archived: { label: 'Archived', color: 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-800', icon: Archive },
};

const stripMarkdown = (md: string) =>
    md.replace(/[#*`_~>\-[\]()!]/g, ' ').replace(/\s+/g, ' ').trim();

const relativeTime = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const isImage = (type: string) => type.startsWith('image/');
const isPDF = (type: string) => type === 'application/pdf';
const isVideo = (type: string) => type.startsWith('video/');
const isAudio = (type: string) => type.startsWith('audio/');

// ─── Toolbar helper ────────────────────────────────────────────────────────────

const insertMarkdown = (
    textarea: HTMLTextAreaElement,
    prefix: string,
    suffix = '',
    placeholder = 'text'
) => {
    const { selectionStart: s, selectionEnd: e, value } = textarea;
    const selected = value.slice(s, e) || placeholder;
    const before = value.slice(0, s);
    const after = value.slice(e);
    const inserted = `${prefix}${selected}${suffix}`;
    textarea.value = before + inserted + after;
    // trigger React synthetic event
    Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')!
        .set!.call(textarea, before + inserted + after);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.setSelectionRange(s + prefix.length, s + prefix.length + selected.length);
    textarea.focus();
};

// ─── Toolbar Component ────────────────────────────────────────────────────────

const Toolbar = ({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement> }) => {
    const btn = (icon: React.ReactNode, label: string, fn: () => void) => (
        <button
            key={label}
            type="button"
            title={label}
            onMouseDown={(e) => { e.preventDefault(); fn(); }}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
            {icon}
        </button>
    );

    const ta = () => textareaRef.current!;

    const tools = [
        btn(<Bold className="w-3.5 h-3.5" />, 'Bold', () => insertMarkdown(ta(), '**', '**', 'bold text')),
        btn(<Italic className="w-3.5 h-3.5" />, 'Italic', () => insertMarkdown(ta(), '_', '_', 'italic text')),
        btn(<Code className="w-3.5 h-3.5" />, 'Inline Code', () => insertMarkdown(ta(), '`', '`', 'code')),
        <div key="sep1" className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />,
        btn(<Heading1 className="w-3.5 h-3.5" />, 'Heading 1', () => insertMarkdown(ta(), '\n# ', '', 'Heading 1')),
        btn(<Heading2 className="w-3.5 h-3.5" />, 'Heading 2', () => insertMarkdown(ta(), '\n## ', '', 'Heading 2')),
        <div key="sep2" className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />,
        btn(<List className="w-3.5 h-3.5" />, 'Bullet List', () => insertMarkdown(ta(), '\n- ', '', 'list item')),
        btn(<ListOrdered className="w-3.5 h-3.5" />, 'Numbered List', () => insertMarkdown(ta(), '\n1. ', '', 'list item')),
        btn(<CheckSquare className="w-3.5 h-3.5" />, 'Task List', () => insertMarkdown(ta(), '\n- [ ] ', '', 'task')),
        <div key="sep3" className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />,
        btn(<Quote className="w-3.5 h-3.5" />, 'Blockquote', () => insertMarkdown(ta(), '\n> ', '', 'quote')),
        btn(<Minus className="w-3.5 h-3.5" />, 'Divider', () => insertMarkdown(ta(), '\n---\n', '', '')),
        btn(<LinkIcon className="w-3.5 h-3.5" />, 'Link', () => insertMarkdown(ta(), '[', '](url)', 'link text')),
    ];

    return (
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            {tools}
        </div>
    );
};

// ─── File Preview Component ───────────────────────────────────────────────────

const FilePreview = ({ file, onRemove }: { file: NoteFile; onRemove?: () => void }) => {
    if (isImage(file.type)) {
        return (
            <div className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <img src={file.url} alt={file.name} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate font-medium">{file.name}</p>
                </div>
                {onRemove && (
                    <button onClick={onRemove} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        );
    }
    if (isPDF(file.type)) {
        return (
            <div className="group relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                <iframe src={file.url} className="w-full h-52" title={file.name} />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                    {onRemove && <button onClick={onRemove} className="text-red-500 hover:text-red-700"><X className="w-3.5 h-3.5" /></button>}
                </div>
            </div>
        );
    }
    if (isVideo(file.type)) {
        return (
            <div className="group relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <video src={file.url} controls className="w-full max-h-48 bg-black" />
                {onRemove && (
                    <button onClick={onRemove} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
                <p className="text-xs p-1.5 text-gray-500 truncate">{file.name}</p>
            </div>
        );
    }
    if (isAudio(file.type)) {
        return (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center shrink-0">
                        <File className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate flex-1">{file.name}</span>
                    {onRemove && <button onClick={onRemove} className="text-red-500 hover:text-red-700 shrink-0"><X className="w-3.5 h-3.5" /></button>}
                </div>
                <audio src={file.url} controls className="w-full h-8" />
            </div>
        );
    }
    // Generic file
    return (
        <div className="group flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
            <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
                <File className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{file.type || 'File'}</p>
            </div>
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors" title="Download">
                    <Download className="w-3.5 h-3.5" />
                </a>
                {onRemove && (
                    <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors" title="Remove">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── Main Notes Page ──────────────────────────────────────────────────────────

export const NotesPage = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Editor state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');
    const [files, setFiles] = useState<NoteFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropzoneRef = useRef<HTMLDivElement>(null);

    // ── Load Notes ────────────────────────────────────────────────────────────
    const loadNotes = useCallback(async () => {
        try {
            const { data } = await api.get<Note[]>('/notes/');
            setNotes(data);
        } catch {
            toast.error('Failed to load notes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadNotes(); }, [loadNotes]);

    // ── Auto-resize textarea ──────────────────────────────────────────────────
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = `${ta.scrollHeight}px`;
    }, [content]);

    // ── Select a note ─────────────────────────────────────────────────────────
    const selectNote = (note: Note) => {
        setSelectedNote(note);
        setTitle(note.title);
        setContent(note.content || '');
        setTags(note.tags || []);
        setStatus(note.status);
        setFiles(note.files || []);
        setMode('view');
    };

    // ── New Note ──────────────────────────────────────────────────────────────
    const newNote = () => {
        setSelectedNote(null);
        setTitle('Untitled Note');
        setContent('');
        setTags([]);
        setTagInput('');
        setStatus('active');
        setFiles([]);
        setMode('edit');
    };

    // ── Save Note ─────────────────────────────────────────────────────────────
    const saveNote = async () => {
        if (!title.trim()) { toast.error('Title is required'); return; }
        setSaving(true);
        try {
            const payload = { title, content, tags, status, files };
            if (selectedNote) {
                const { data } = await api.put<Note>(`/notes/${selectedNote.id}`, payload);
                setNotes(prev => prev.map(n => n.id === data.id ? data : n));
                setSelectedNote(data);
                toast.success('Note updated!');
            } else {
                const { data } = await api.post<Note>('/notes/', payload);
                setNotes(prev => [data, ...prev]);
                setSelectedNote(data);
                toast.success('Note created!');
            }
            setMode('view');
        } catch {
            toast.error('Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete Note ───────────────────────────────────────────────────────────
    const deleteNote = async (id: number) => {
        if (!confirm('Delete this note permanently?')) return;
        setDeleting(true);
        try {
            await api.delete(`/notes/${id}`);
            setNotes(prev => prev.filter(n => n.id !== id));
            if (selectedNote?.id === id) { setSelectedNote(null); setMode('view'); }
            toast.success('Note deleted');
        } catch {
            toast.error('Failed to delete note');
        } finally {
            setDeleting(false);
        }
    };

    // ── Upload Files ──────────────────────────────────────────────────────────
    const uploadFiles = async (fileList: FileList) => {
        setUploading(true);
        const uploaded: NoteFile[] = [];
        for (const file of Array.from(fileList)) {
            try {
                const fd = new FormData();
                fd.append('file', file);
                const { data } = await api.post<NoteFile>('/notes/upload', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                uploaded.push(data);
            } catch {
                toast.error(`Failed to upload: ${file.name}`);
            }
        }
        setFiles(prev => [...prev, ...uploaded]);
        if (uploaded.length > 0) toast.success(`${uploaded.length} file(s) uploaded`);
        setUploading(false);
    };

    // ── Drag & Drop ───────────────────────────────────────────────────────────
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
    };

    // ── Tag handling ──────────────────────────────────────────────────────────
    const addTag = () => {
        const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
        if (t && !tags.includes(t)) { setTags(prev => [...prev, t]); }
        setTagInput('');
    };

    // ── Filtered notes ────────────────────────────────────────────────────────
    const filtered = notes.filter(n => {
        const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
            stripMarkdown(n.content || '').toLowerCase().includes(search.toLowerCase()) ||
            n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchStatus = filterStatus === 'all' || n.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 overflow-hidden">

            {/* ── Left Panel: Notes List ──────────────────────────────────── */}
            <div className="w-72 lg:w-80 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
                {/* Header */}
                <div className="px-4 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <StickyNote className="w-5 h-5 text-primary-600" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Notes</h2>
                        </div>
                        <button
                            onClick={newNote}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm shadow-primary-200 dark:shadow-none"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            New
                        </button>
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search notes..."
                            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all text-gray-700 dark:text-gray-300 placeholder-gray-400"
                        />
                    </div>
                    {/* Filter tabs */}
                    <div className="flex gap-1">
                        {(['all', 'active', 'draft', 'archived'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`flex-1 text-[10px] font-semibold py-1 rounded-md transition-all capitalize ${filterStatus === s ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3">
                            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                            <p className="text-sm text-gray-400">Loading notes...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 px-4 text-center">
                            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                                <StickyNote className="w-7 h-7 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">No notes found</p>
                                <p className="text-xs text-gray-400 mt-1">{search ? 'Try a different search' : 'Click "+ New" to create one'}</p>
                            </div>
                        </div>
                    ) : (
                        filtered.map(note => {
                            const isActive = selectedNote?.id === note.id;
                            const StatusIcon = STATUS_CONFIG[note.status]?.icon || CheckCircle;
                            const preview = stripMarkdown(note.content || '');
                            return (
                                <div
                                    key={note.id}
                                    onClick={() => selectNote(note)}
                                    className={`group p-3 rounded-xl cursor-pointer transition-all duration-150 border ${isActive
                                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                                            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700'
                                        }`}
                                >
                                    {/* Title row */}
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <h3 className={`text-sm font-semibold leading-tight line-clamp-1 ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {note.title}
                                        </h3>
                                        <div className={`shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${STATUS_CONFIG[note.status]?.color}`}>
                                            <StatusIcon className="w-2.5 h-2.5" />
                                            {STATUS_CONFIG[note.status]?.label}
                                        </div>
                                    </div>
                                    {/* Content preview */}
                                    {preview && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">
                                            {preview}
                                        </p>
                                    )}
                                    {/* Footer row */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                            {note.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-[9px] font-semibold text-gray-500 dark:text-gray-400 rounded-full">
                                                    <Hash className="w-2 h-2" />
                                                    {tag}
                                                </span>
                                            ))}
                                            {note.tags.length > 2 && (
                                                <span className="text-[9px] text-gray-400">+{note.tags.length - 2}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {note.files.length > 0 && (
                                                <span className="flex items-center gap-0.5 text-[9px] text-gray-400">
                                                    <File className="w-2.5 h-2.5" />
                                                    {note.files.length}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-0.5 text-[9px] text-gray-400">
                                                <Clock className="w-2.5 h-2.5" />
                                                {relativeTime(note.updated_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer count */}
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{filtered.length} of {notes.length} notes</p>
                </div>
            </div>

            {/* ── Right Panel: Editor / Viewer ─────────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                {selectedNote === null && mode !== 'edit' ? (
                    // ── Empty State ────────────────────────────────────────────
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center shadow-inner">
                            <StickyNote className="w-12 h-12 text-primary-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Select or Create a Note</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">Pick a note from the sidebar to view or edit it, or create a new one.</p>
                        </div>
                        <button
                            onClick={newNote}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-primary-200 dark:shadow-none"
                        >
                            <Plus className="w-4 h-4" />
                            Create New Note
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ── Toolbar Bar ──────────────────────────────────── */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                                {/* Mode Toggle */}
                                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                                    <button
                                        onClick={() => setMode('edit')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${mode === 'edit' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setMode('view')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${mode === 'view' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Preview
                                    </button>
                                </div>
                                {/* Status dropdown */}
                                {mode === 'edit' && (
                                    <div className="relative">
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
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedNote && (
                                    <button
                                        onClick={() => deleteNote(selectedNote.id)}
                                        disabled={deleting}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                    >
                                        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                        Delete
                                    </button>
                                )}
                                {mode === 'edit' && (
                                    <button
                                        onClick={saveNote}
                                        disabled={saving}
                                        className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm shadow-primary-200 dark:shadow-none"
                                    >
                                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                        Save
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ── Main Content Area ─────────────────────────────── */}
                        <div className="flex-1 overflow-y-auto">
                            {mode === 'edit' ? (
                                // ── EDIT MODE ──────────────────────────────────
                                <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">
                                    {/* Title */}
                                    <input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Note title..."
                                        className="w-full text-2xl font-extrabold bg-transparent text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 border-none outline-none resize-none leading-tight"
                                    />

                                    {/* Tags Row */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                                        {tags.map(tag => (
                                            <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-full border border-primary-200 dark:border-primary-800">
                                                #{tag}
                                                <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500 transition-colors">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            value={tagInput}
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addTag())}
                                            placeholder="Add tag..."
                                            className="text-xs bg-transparent text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none border-none min-w-[80px]"
                                        />
                                    </div>

                                    {/* Rich Editor */}
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                                        <Toolbar textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>} />
                                        <textarea
                                            ref={textareaRef}
                                            value={content}
                                            onChange={e => setContent(e.target.value)}
                                            placeholder="Write your note here... Supports **Markdown** formatting."
                                            className="w-full px-5 py-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm leading-7 font-mono resize-none outline-none min-h-[300px] placeholder-gray-300 dark:placeholder-gray-600"
                                            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace" }}
                                        />
                                    </div>

                                    {/* File Upload Drop Zone */}
                                    <div
                                        ref={dropzoneRef}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 rounded-xl p-6 text-center cursor-pointer transition-all group bg-gray-50 dark:bg-gray-800/30 hover:bg-primary-50/50 dark:hover:bg-primary-900/10"
                                    >
                                        {uploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                                                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">Uploading...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 rounded-xl flex items-center justify-center transition-colors">
                                                    <Upload className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">Drop files here or click to upload</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">Images, PDFs, videos, audio, documents — any type supported</p>
                                                </div>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={e => e.target.files && uploadFiles(e.target.files)}
                                        />
                                    </div>

                                    {/* Uploaded Files Preview */}
                                    {files.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <File className="w-4 h-4 text-gray-400" />
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Attachments ({files.length})</h4>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {files.map((file, idx) => (
                                                    <FilePreview
                                                        key={idx}
                                                        file={file}
                                                        onRemove={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // ── VIEW / PREVIEW MODE ────────────────────────
                                <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                                    {/* Header */}
                                    <div className="space-y-3 pb-5 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">{title}</h1>
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${STATUS_CONFIG[status]?.color}`}>
                                                {(() => { const Icon = STATUS_CONFIG[status]?.icon; return Icon ? <Icon className="w-3 h-3" /> : null; })()}
                                                {STATUS_CONFIG[status]?.label}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                Updated {relativeTime(selectedNote?.updated_at || new Date().toISOString())}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FileText className="w-3.5 h-3.5" />
                                                {content.split(/\s+/).filter(Boolean).length} words
                                            </span>
                                            {files.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <File className="w-3.5 h-3.5" />
                                                    {files.length} attachment{files.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                        {tags.length > 0 && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {tags.map(tag => (
                                                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-full border border-primary-200 dark:border-primary-800">
                                                        <Hash className="w-3 h-3" />
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Markdown Content */}
                                    {content ? (
                                        <div className="prose prose-gray dark:prose-invert prose-sm sm:prose max-w-none
                                            prose-headings:font-bold prose-headings:tracking-tight
                                            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                                            prose-p:leading-7 prose-p:text-gray-700 dark:prose-p:text-gray-300
                                            prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
                                            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                                            prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-pre:rounded-xl
                                            prose-blockquote:border-primary-400 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
                                            prose-hr:border-gray-200 dark:prose-hr:border-gray-700
                                            prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                                            prose-ul:marker:text-primary-500 prose-ol:marker:text-primary-500"
                                        >
                                            <ReactMarkdown>{content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                            <AlertCircle className="w-5 h-5 text-gray-400 shrink-0" />
                                            <p className="text-sm text-gray-500 dark:text-gray-400">No content yet. Click <strong>Edit</strong> to start writing.</p>
                                        </div>
                                    )}

                                    {/* Attached Files */}
                                    {files.length > 0 && (
                                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center gap-2">
                                                <File className="w-4 h-4 text-gray-400" />
                                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Attachments ({files.length})</h3>
                                            </div>
                                            {/* Images grid */}
                                            {files.filter(f => isImage(f.type)).length > 0 && (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {files.filter(f => isImage(f.type)).map((file, i) => (
                                                        <FilePreview key={i} file={file} />
                                                    ))}
                                                </div>
                                            )}
                                            {/* Other files */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {files.filter(f => !isImage(f.type)).map((file, i) => (
                                                    <FilePreview key={i} file={file} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Edit CTA */}
                                    <div className="pt-4">
                                        <button
                                            onClick={() => setMode('edit')}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all border border-primary-200 dark:border-primary-800"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Edit this note
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
