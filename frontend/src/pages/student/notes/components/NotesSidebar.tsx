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
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-full overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <button
                onClick={onNewNote}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
                <Plus className="w-4 h-4" /> New Note
            </button>
        </div>

        <div className="flex-1">
            <nav className="p-3 space-y-0.5">
                <p className="px-2 pt-2 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Views</p>
                {STATUS_FILTERS.map(({ val, label }) => {
                    const count = val === 'all' ? notes.length : statusCounts[val];
                    const isActive = filterStatus === val && !filterTag;
                    const btnCls = `w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
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
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Pin className="w-3.5 h-3.5 text-primary-400" />
                        <span>Pinned</span>
                        <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-400 font-medium">
                            {statusCounts.pinned}
                        </span>
                    </button>
                )}
            </nav>

            {allTags.length > 0 && (
                <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-800 mt-1 pt-3">
                    <p className="px-2 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tags</p>
                    <div className="space-y-0.5">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => onFilterTag(filterTag === tag ? null : tag)}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left ${
                                    filterTag === tag
                                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
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

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-1.5 text-xs text-gray-400 shrink-0">
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
