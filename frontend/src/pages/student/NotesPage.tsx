import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { PageLoader } from '../../components/common/PageLoader';
import { DeleteConfirmationModal } from '../../components/common/DeleteConfirmationModal';
import api from '../../lib/axios';
import { ActiveFilters } from './notes/components/ActiveFilters';
import { EmptyNotesState } from './notes/components/EmptyNotesState';
import { NoteCard } from './notes/components/NoteCard';
import { NoteModal } from './notes/components/NoteModal';
import { NotesSidebar } from './notes/components/NotesSidebar';
import { NotesToolbar } from './notes/components/NotesToolbar';
import type { DeleteConfirmationState, Note, NoteStatusCounts, NoteStatusFilter, NoteView } from './notes/types';
import { stripHtml } from './notes/utils';

export const NotesPage = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [openNote, setOpenNote] = useState<Note | null>(null);
    const [isNewModal, setIsNewModal] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<NoteStatusFilter>('all');
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [view, setView] = useState<NoteView>('grid');
    const [confirmState, setConfirmState] = useState<DeleteConfirmationState | null>(null);

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

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        notes.forEach(note => note.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, [notes]);

    const filtered = useMemo(() => {
        const searchTerm = search.toLowerCase();

        return notes.filter(note => {
            const text = stripHtml(note.content).toLowerCase();
            const matchSearch =
                !searchTerm ||
                note.title.toLowerCase().includes(searchTerm) ||
                text.includes(searchTerm) ||
                note.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            const matchStatus = filterStatus === 'all' || note.status === filterStatus;
            const matchTag = !filterTag || note.tags.includes(filterTag);

            return matchSearch && matchStatus && matchTag;
        });
    }, [notes, search, filterStatus, filterTag]);

    const statusCounts: NoteStatusCounts = useMemo(
        () => ({
            active: notes.filter(note => note.status === 'active').length,
            draft: notes.filter(note => note.status === 'draft').length,
            archived: notes.filter(note => note.status === 'archived').length,
            pinned: notes.filter(note => note.is_pinned).length,
        }),
        [notes],
    );

    const handleNewNote = () => {
        setOpenNote(null);
        setIsNewModal(true);
    };

    const handleSaved = (saved: Note) => {
        setNotes(prev => {
            const index = prev.findIndex(note => note.id === saved.id);
            if (index < 0) return [saved, ...prev];

            const copy = [...prev];
            copy[index] = saved;
            return copy;
        });
        setOpenNote(saved);
        setIsNewModal(false);
    };

    const handleDeleted = (id: number) => {
        setNotes(prev => prev.filter(note => note.id !== id));
        setOpenNote(null);
        setIsNewModal(false);
    };

    const handlePinToggled = (updated: Note) => {
        setNotes(prev =>
            prev
                .map(note => (note.id === updated.id ? updated : note))
                .sort((a, b) => {
                    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
                    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                }),
        );

        if (openNote?.id === updated.id) setOpenNote(updated);
    };

    const handlePin = async (id: number) => {
        try {
            const { data } = await api.patch<Note>(`/notes/${id}/pin`);
            handlePinToggled(data);
            toast.success(data.is_pinned ? 'Pinned' : 'Unpinned');
        } catch {
            toast.error('Failed to pin note');
        }
    };

    const handleDuplicate = async (id: number) => {
        try {
            const { data } = await api.post<Note>(`/notes/${id}/duplicate`);
            setNotes(prev => [data, ...prev]);
            toast.success('Note duplicated');
        } catch {
            toast.error('Duplicate failed');
        }
    };

    const handleCardDelete = (id: number) => {
        setConfirmState({
            title: 'Delete note?',
            message: 'This note will be permanently deleted and its unused attachments will be removed from storage.',
            itemName: notes.find(note => note.id === id)?.title,
            confirmLabel: 'Delete',
            onConfirm: async () => {
                await api.delete(`/notes/${id}`);
                setNotes(prev => prev.filter(note => note.id !== id));
                toast.success('Note deleted');
            },
        });
    };

    if (loading) return <PageLoader />;

    return (
        <>
            <div className="h-[calc(100vh-4rem)] flex bg-gray-50 dark:bg-gray-950 overflow-hidden">
                <NotesSidebar
                    notes={notes}
                    allTags={allTags}
                    statusCounts={statusCounts}
                    filterStatus={filterStatus}
                    filterTag={filterTag}
                    onNewNote={handleNewNote}
                    onFilterStatus={setFilterStatus}
                    onFilterTag={setFilterTag}
                />

                <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                    <NotesToolbar
                        search={search}
                        filterStatus={filterStatus}
                        view={view}
                        onSearchChange={setSearch}
                        onFilterStatus={setFilterStatus}
                        onViewChange={setView}
                        onNewNote={handleNewNote}
                    />

                    <ActiveFilters
                        search={search}
                        filterStatus={filterStatus}
                        filterTag={filterTag}
                        resultCount={filtered.length}
                        onSearchChange={setSearch}
                        onFilterStatus={setFilterStatus}
                        onFilterTag={setFilterTag}
                    />

                    <div className="flex-1 p-4 sm:p-5 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <EmptyNotesState hasFilters={Boolean(search || filterTag)} onNewNote={handleNewNote} />
                        ) : (
                            <div
                                className={
                                    view === 'grid'
                                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                                        : 'flex flex-col gap-4'
                                }
                            >
                                {filtered.map(note => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        view={view}
                                        onOpen={selected => {
                                            setOpenNote(selected);
                                            setIsNewModal(false);
                                        }}
                                        onDelete={handleCardDelete}
                                        onPin={handlePin}
                                        onDuplicate={handleDuplicate}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {(openNote !== null || isNewModal) && (
                <NoteModal
                    note={openNote}
                    isNew={isNewModal}
                    onClose={() => {
                        setOpenNote(null);
                        setIsNewModal(false);
                    }}
                    onSaved={handleSaved}
                    onDeleted={handleDeleted}
                    onPinToggled={handlePinToggled}
                    onRequestConfirm={setConfirmState}
                />
            )}

            {confirmState && (
                <DeleteConfirmationModal
                    isOpen={Boolean(confirmState)}
                    title={confirmState.title}
                    message={confirmState.message}
                    itemName={confirmState.itemName}
                    confirmText={confirmState.confirmLabel}
                    loading={confirmState.loading}
                    onConfirm={async () => {
                        setConfirmState(prev => (prev ? { ...prev, loading: true } : null));
                        try {
                            await confirmState.onConfirm();
                            setConfirmState(null);
                        } catch {
                            setConfirmState(prev => (prev ? { ...prev, loading: false } : null));
                        }
                    }}
                    onClose={() => setConfirmState(null)}
                />
            )}
        </>
    );
};
