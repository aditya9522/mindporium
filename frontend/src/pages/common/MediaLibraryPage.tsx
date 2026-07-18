import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
    CheckSquare,
    Copy,
    Download,
    Edit3,
    Eye,
    File,
    FileAudio,
    FileText,
    Film,
    FolderOpen,
    Grid3X3,
    Image as ImageIcon,
    Loader2,
    Search,
    Square,
    Trash2,
    UploadCloud,
    X,
} from 'lucide-react';

import { DeleteConfirmationModal } from '../../components/common/DeleteConfirmationModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/auth.store';
import api from '../../lib/axios';

type MediaCategory = 'all' | 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'document';

interface MediaAsset {
    id: number;
    name: string;
    original_name: string;
    url: string;
    content_type: string;
    size: number;
    category: Exclude<MediaCategory, 'all'>;
    description?: string | null;
    owner_id: number;
    created_at: string;
    updated_at: string;
}

const CATEGORY_OPTIONS: Array<{ id: MediaCategory; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'image', label: 'Images' },
    { id: 'video', label: 'Videos' },
    { id: 'audio', label: 'Audio' },
    { id: 'pdf', label: 'PDFs' },
    { id: 'text', label: 'Text' },
    { id: 'document', label: 'Docs' },
];

const categoryIcon = {
    image: ImageIcon,
    video: Film,
    audio: FileAudio,
    pdf: FileText,
    text: FileText,
    document: File,
};

const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const isPreviewable = (asset: MediaAsset) =>
    ['image', 'video', 'audio', 'pdf', 'text'].includes(asset.category);

export const MediaLibraryPage = () => {
    const { user } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [category, setCategory] = useState<MediaCategory>('all');
    const [search, setSearch] = useState('');
    const [ownerFilter, setOwnerFilter] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
    const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
    const [deleteState, setDeleteState] = useState<{
        type: 'single' | 'selected' | 'clean';
        asset?: MediaAsset;
    } | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [dragging, setDragging] = useState(false);

    const isAdmin = user?.role === 'admin';

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (category !== 'all') params.category = category;
            if (isAdmin && ownerFilter.trim()) params.owner_id = ownerFilter.trim();
            const { data } = await api.get<MediaAsset[]>('/media-library/', { params });
            setAssets(data);
            setSelectedIds([]);
        } catch {
            toast.error('Failed to load media library');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category]);

    const filteredAssets = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return assets;

        return assets.filter(asset =>
            [asset.name, asset.original_name, asset.description, asset.content_type]
                .filter(Boolean)
                .some(value => String(value).toLowerCase().includes(query))
        );
    }, [assets, search]);

    const selectedAll = filteredAssets.length > 0 && selectedIds.length === filteredAssets.length;

    const uploadFiles = async (files: FileList | File[]) => {
        const incoming = Array.from(files);
        if (!incoming.length) return;

        setUploading(true);
        let uploaded = 0;

        for (const file of incoming) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                await api.post('/media-library/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                uploaded += 1;
            } catch {
                toast.error(`Upload failed: ${file.name}`);
            }
        }

        if (uploaded) toast.success(`${uploaded} file${uploaded > 1 ? 's' : ''} uploaded`);
        setUploading(false);
        fetchAssets();
    };

    const toggleSelected = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        setSelectedIds(selectedAll ? [] : filteredAssets.map(asset => asset.id));
    };

    const copyLink = async (asset: MediaAsset) => {
        await navigator.clipboard.writeText(asset.url);
        toast.success('Direct link copied');
    };

    const handleDelete = async () => {
        if (!deleteState) return;

        setDeleting(true);
        try {
            if (deleteState.type === 'single' && deleteState.asset) {
                await api.delete(`/media-library/${deleteState.asset.id}`);
                toast.success('File deleted');
            }

            if (deleteState.type === 'selected') {
                await api.post('/media-library/bulk-delete', { ids: selectedIds });
                toast.success(`${selectedIds.length} file${selectedIds.length > 1 ? 's' : ''} deleted`);
            }

            if (deleteState.type === 'clean') {
                await api.post('/media-library/clean', null, {
                    params: {
                        ...(isAdmin && ownerFilter.trim() ? { owner_id: ownerFilter.trim() } : {}),
                        ...(category !== 'all' ? { category } : {}),
                    },
                });
                toast.success('Library cleaned');
            }

            setDeleteState(null);
            setPreviewAsset(null);
            fetchAssets();
        } catch {
            toast.error('Delete failed');
        } finally {
            setDeleting(false);
        }
    };

    const handleSaveEdit = async (asset: MediaAsset, values: { name: string; description: string }) => {
        if (!values.name.trim()) {
            toast.error('File name is required');
            return;
        }

        try {
            const { data } = await api.put<MediaAsset>(`/media-library/${asset.id}`, values);
            setAssets(prev => prev.map(item => item.id === data.id ? data : item));
            setEditingAsset(null);
            setPreviewAsset(data);
            toast.success('File details updated');
        } catch {
            toast.error('Failed to update file details');
        }
    };

    const stats = useMemo(() => {
        const totalSize = assets.reduce((total, asset) => total + asset.size, 0);
        return {
            total: assets.length,
            selected: selectedIds.length,
            totalSize: formatBytes(totalSize),
        };
    }, [assets, selectedIds.length]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                                <FolderOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">File & Media Library</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload, preview, organize, and clean your personal files.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={toggleSelectAll} disabled={!filteredAssets.length}>
                            {selectedAll ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                            {selectedAll ? 'Clear selection' : 'Select all'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteState({ type: 'selected' })}
                            disabled={!selectedIds.length}
                            className="text-red-600 dark:text-red-400"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete selected
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteState({ type: 'clean' })}
                            disabled={!assets.length}
                            className="text-red-600 dark:text-red-400"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clean library
                        </Button>
                    </div>
                </div>

                <section className="rounded-2xl border border-primary-100/70 dark:border-primary-900/30 bg-primary-50/40 dark:bg-primary-950/10 p-4 sm:p-5">
                    <div className="grid grid-cols-1 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)] gap-5">
                        <div
                            onDrop={event => {
                                event.preventDefault();
                                setDragging(false);
                                uploadFiles(event.dataTransfer.files);
                            }}
                            onDragOver={event => {
                                event.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={() => setDragging(false)}
                            className={`rounded-xl border-2 border-dashed bg-white dark:bg-gray-900 p-6 transition-all ${dragging
                                ? 'border-primary-500 ring-4 ring-primary-100 dark:ring-primary-900/30'
                                : 'border-gray-200 dark:border-gray-800'
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={event => event.target.files && uploadFiles(event.target.files)}
                            />
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                                    {uploading ? <Loader2 className="w-5 h-5 text-primary-600 dark:text-primary-400 animate-spin" /> : <UploadCloud className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Upload files and media</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag files here or choose from your device. Images, videos, audio, PDFs, and documents are supported.</p>
                                    <Button className="mt-4" onClick={() => fileInputRef.current?.click()} isLoading={uploading}>
                                        Choose files
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Files</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.total}</p>
                            </div>
                            <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Storage</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.totalSize}</p>
                            </div>
                            <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Selected</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.selected}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col xl:flex-row gap-3 xl:items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                            {CATEGORY_OPTIONS.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setCategory(option.id)}
                                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${category === option.id
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-300'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 xl:w-auto">
                            {isAdmin && (
                                <Input
                                    value={ownerFilter}
                                    onChange={event => setOwnerFilter(event.target.value)}
                                    onKeyDown={event => event.key === 'Enter' && fetchAssets()}
                                    placeholder="Owner ID"
                                    className="sm:w-32"
                                />
                            )}
                            <div className="relative sm:w-80">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search files..." className="pl-9" />
                            </div>
                            {isAdmin && <Button variant="outline" onClick={fetchAssets}>Apply</Button>}
                        </div>
                    </div>

                    {loading ? (
                        <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Loading media library...
                        </div>
                    ) : filteredAssets.length ? (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                            {filteredAssets.map(asset => {
                                const Icon = categoryIcon[asset.category] ?? File;
                                const selected = selectedIds.includes(asset.id);

                                return (
                                    <article
                                        key={asset.id}
                                        className={`group rounded-xl border bg-white dark:bg-gray-950 overflow-hidden transition-all ${selected
                                            ? 'border-primary-500 ring-2 ring-primary-100 dark:ring-primary-900/40'
                                            : 'border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800'
                                            }`}
                                    >
                                        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                            {asset.category === 'image' ? (
                                                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                                    <Icon className="w-9 h-9" />
                                                    <span className="text-xs font-semibold uppercase">{asset.category}</span>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => toggleSelected(asset.id)}
                                                className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-white/90 dark:bg-gray-950/90 text-primary-600 dark:text-primary-400 flex items-center justify-center shadow-sm"
                                                title={selected ? 'Deselect file' : 'Select file'}
                                            >
                                                {selected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{asset.name}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatBytes(asset.size)} · {asset.content_type}</p>
                                            </div>
                                            {asset.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">{asset.description}</p>}
                                            <div className="grid grid-cols-5 gap-1.5 mt-4">
                                                <button onClick={() => setPreviewAsset(asset)} className="h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center" title="Preview">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setEditingAsset(asset)} className="h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center" title="Edit details">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => copyLink(asset)} className="h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center" title="Copy link">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <a href={asset.url} download={asset.name} target="_blank" rel="noopener noreferrer" className="h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center" title="Download">
                                                    <Download className="w-4 h-4" />
                                                </a>
                                                <button onClick={() => setDeleteState({ type: 'single', asset })} className="h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 flex items-center justify-center" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-80 flex flex-col items-center justify-center text-center px-4">
                            <Grid3X3 className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-3" />
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">No files found</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload a file or adjust your filters.</p>
                        </div>
                    )}
                </section>
            </div>

            {previewAsset && (
                <MediaPreviewModal
                    asset={previewAsset}
                    onClose={() => setPreviewAsset(null)}
                    onEdit={() => setEditingAsset(previewAsset)}
                    onDelete={() => setDeleteState({ type: 'single', asset: previewAsset })}
                />
            )}

            {editingAsset && (
                <EditMediaModal
                    asset={editingAsset}
                    onClose={() => setEditingAsset(null)}
                    onSave={handleSaveEdit}
                />
            )}

            <DeleteConfirmationModal
                isOpen={Boolean(deleteState)}
                onClose={() => setDeleteState(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title={deleteState?.type === 'clean' ? 'Clean media library?' : 'Delete media file?'}
                message={
                    deleteState?.type === 'clean'
                        ? 'This will permanently delete every file in this library view and remove the storage objects.'
                        : deleteState?.type === 'selected'
                          ? 'The selected files will be permanently deleted and removed from storage.'
                          : 'This file will be permanently deleted and removed from storage.'
                }
                itemName={deleteState?.asset?.name ?? (deleteState?.type === 'selected' ? `${selectedIds.length} selected files` : undefined)}
                confirmText={deleteState?.type === 'clean' ? 'Clean Library' : 'Delete'}
            />
        </div>
    );
};

const MediaPreviewModal = ({
    asset,
    onClose,
    onEdit,
    onDelete,
}: {
    asset: MediaAsset;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) => (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-950 w-full max-w-5xl h-[82vh] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col lg:flex-row">
            <div className="flex-1 bg-gray-950 flex items-center justify-center p-4 min-h-0">
                {asset.category === 'image' && <img src={asset.url} alt={asset.name} className="max-w-full max-h-full object-contain rounded-lg" />}
                {asset.category === 'video' && <video src={asset.url} controls className="w-full max-h-full rounded-lg bg-black" />}
                {asset.category === 'audio' && <audio src={asset.url} controls className="w-full max-w-lg" />}
                {asset.category === 'pdf' && <iframe src={asset.url} title={asset.name} className="w-full h-full bg-white rounded-lg border-0" />}
                {asset.category === 'text' && <iframe src={asset.url} title={asset.name} className="w-full h-full bg-white rounded-lg border-0" />}
                {!isPreviewable(asset) && (
                    <div className="text-center text-white">
                        <File className="w-14 h-14 mx-auto mb-4 text-primary-300" />
                        <p className="font-semibold">{asset.name}</p>
                        <p className="text-sm text-gray-400 mt-1">Preview is not available for this file type.</p>
                    </div>
                )}
            </div>
            <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 break-words">{asset.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatBytes(asset.size)}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="py-4 space-y-3 text-sm text-gray-600 dark:text-gray-400 flex-1">
                    <p><span className="font-semibold text-gray-900 dark:text-gray-100">Type:</span> {asset.content_type}</p>
                    <p><span className="font-semibold text-gray-900 dark:text-gray-100">Category:</span> {asset.category}</p>
                    <p><span className="font-semibold text-gray-900 dark:text-gray-100">Uploaded:</span> {new Date(asset.created_at).toLocaleString()}</p>
                    {asset.description && <p className="break-words">{asset.description}</p>}
                </div>
                <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="outline" className="w-full" onClick={onEdit}><Edit3 className="w-4 h-4 mr-2" /> Edit details</Button>
                    <Button variant="outline" className="w-full" asChild><a href={asset.url} download={asset.name} target="_blank" rel="noopener noreferrer"><Download className="w-4 h-4 mr-2" /> Download</a></Button>
                    <Button variant="outline" className="w-full text-red-600 dark:text-red-400" onClick={onDelete}><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
                </div>
            </aside>
        </div>
    </div>
);

const EditMediaModal = ({
    asset,
    onClose,
    onSave,
}: {
    asset: MediaAsset;
    onClose: () => void;
    onSave: (asset: MediaAsset, values: { name: string; description: string }) => Promise<void>;
}) => {
    const [name, setName] = useState(asset.name);
    const [description, setDescription] = useState(asset.description ?? '');
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        await onSave(asset, { name, description });
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit file details</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Rename the display title or add helpful context.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">File name</label>
                        <Input value={name} onChange={event => setName(event.target.value)} className="mt-2" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                            value={description}
                            onChange={event => setDescription(event.target.value)}
                            className="mt-2 w-full min-h-28 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                            placeholder="Optional notes about this file"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={save} isLoading={saving}>Save details</Button>
                </div>
            </div>
        </div>
    );
};
