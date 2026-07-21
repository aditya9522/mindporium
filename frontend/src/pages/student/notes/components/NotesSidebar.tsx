import { Hash, Pin, Plus } from 'lucide-react';

import type { Note, NoteStatusCounts, NoteStatusFilter } from '../types';
import { wordCount } from '../utils';

const STATUS_FILTERS: Array<{ val: NoteStatusFilter; label: string }> = [
    { val: 'all', label: 'All Notes' },
    { val: 'active', label: 'Active' },
    { val: 'draft', label: 'Drafts' },
    { val: 'archived', label: 'Archived' },
];

interface NotesSidebarProps {
    notes: Note[];
    allTags: string[];
    statusCounts: NoteStatusCounts;
    filterStatus: NoteStatusFilter;
    filterTag: string | null;
    onNewNote: () => void;
    onFilterStatus: (status: NoteStatusFilter) => void;
    onFilterTag: (tag: string | null) => void;
}

export const NotesSidebar = ({
    notes,
    allTags,
    statusCounts,
    filterStatus,
    filterTag,
    onNewNote,
    onFilterStatus,
    onFilterTag,
}: NotesSidebarProps) => (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-primary-100 dark:border-primary-900/50 bg-white dark:bg-gray-900 h-full overflow-hidden">
        <div className="p-5 border-b border-primary-100 dark:border-primary-900/50 bg-primary-50/70 dark:bg-primary-900/15 shrink-0">
            <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-700 dark:text-primary-300">Studio</p>
                <h2 className="mt-1 text-lg font-semibold text-gray-950 dark:text-white">Organize your notes</h2>
                <p className="mt-1 text-sm leading-5 text-gray-600 dark:text-gray-300">Pinned ideas, quick filters, and tags in one place.</p>
            </div>
            <button
                onClick={onNewNote}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-2xl transition-colors shadow-[0_14px_30px_-18px_var(--primary-700)]"
            >
                <Plus className="w-4 h-4" /> New Note
            </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <nav className="p-4 space-y-1 shrink-0">
                <p className="px-2 pt-2 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Views</p>
                {STATUS_FILTERS.map(({ val, label }) => {
                    const count = val === 'all' ? notes.length : statusCounts[val];
                    const isActive = filterStatus === val && !filterTag;
                    const btnCls = `w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                            ? 'bg-white dark:bg-gray-900 text-primary-700 dark:text-primary-300 font-semibold shadow-sm ring-1 ring-primary-100 dark:ring-primary-900/50'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-white/85 dark:hover:bg-gray-900/80'
                    }`;
                    const badgeCls = `text-xs px-1.5 py-0.5 rounded-md font-medium ${
                        isActive
                            ? 'bg-primary-100 dark:bg-primary-800/60 text-primary-700 dark:text-primary-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`;

                    return (
                        <button
                            key={val}
                            onClick={() => {
                                onFilterStatus(val);
                                onFilterTag(null);
                            }}
                            className={btnCls}
                        >
                            <span>{label}</span>
                            <span className={badgeCls}>{count}</span>
                        </button>
                    );
                })}

                {statusCounts.pinned > 0 && (
                    <button
                        onClick={() => {
                            onFilterStatus('pinned');
                            onFilterTag(null);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            filterStatus === 'pinned' && !filterTag
                                ? 'bg-white dark:bg-gray-900 text-primary-700 dark:text-primary-300 font-semibold shadow-sm ring-1 ring-primary-100 dark:ring-primary-900/50'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-white/85 dark:hover:bg-gray-900/80'
                        }`}
                    >
                        <Pin className="w-3.5 h-3.5 text-primary-400" />
                        <span>Pinned</span>
                        <span
                            className={`ml-auto text-xs px-1.5 py-0.5 rounded-md font-medium ${
                                filterStatus === 'pinned' && !filterTag
                                    ? 'bg-primary-100 dark:bg-primary-800/60 text-primary-700 dark:text-primary-300'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                            }`}
                        >
                            {statusCounts.pinned}
                        </span>
                    </button>
                )}
            </nav>

            {allTags.length > 0 && (
                <div className="mx-4 pb-4 border-t border-primary-100/70 dark:border-primary-900/40 mt-1 pt-4 flex-1 min-h-0 flex flex-col">
                    <p className="px-2 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tags</p>
                    <div className="space-y-1 overflow-y-auto pr-1 flex-1 min-h-0">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => onFilterTag(filterTag === tag ? null : tag)}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left ${
                                    filterTag === tag
                                        ? 'bg-white dark:bg-gray-900 text-primary-700 dark:text-primary-300 font-semibold shadow-sm ring-1 ring-primary-100 dark:ring-primary-900/50'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/85 dark:hover:bg-gray-900/80'
                                }`}
                            >
                                <Hash className="w-3 h-3 shrink-0" />
                                <span className="truncate">{tag}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="m-4 mt-0 rounded-2xl border border-primary-100 dark:border-primary-900/50 bg-primary-50/40 dark:bg-gray-950/40 p-4 space-y-2 text-xs text-gray-400 shrink-0 shadow-sm">
            <div className="flex justify-between">
                <span>Total notes</span>
                <span className="font-medium text-gray-600 dark:text-gray-350">{notes.length}</span>
            </div>
            <div className="flex justify-between">
                <span>Total words</span>
                <span className="font-medium text-gray-600 dark:text-gray-350">
                    {notes.reduce((total, note) => total + wordCount(note.content), 0).toLocaleString()}
                </span>
            </div>
        </div>
    </aside>
);
