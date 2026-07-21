import { LayoutGrid, List as ListIcon, Plus, Search, X } from 'lucide-react';

import type { NoteStatusFilter, NoteView } from '../types';

interface NotesToolbarProps {
    search: string;
    filterStatus: NoteStatusFilter;
    view: NoteView;
    onSearchChange: (value: string) => void;
    onFilterStatus: (status: NoteStatusFilter) => void;
    onViewChange: (view: NoteView) => void;
    onNewNote: () => void;
}

export const NotesToolbar = ({
    search,
    filterStatus,
    view,
    onSearchChange,
    onFilterStatus,
    onViewChange,
    onNewNote,
}: NotesToolbarProps) => (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-5 py-3 flex items-center gap-3">
        <button
            onClick={onNewNote}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
        >
            <Plus className="w-4 h-4" />
        </button>

        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
                value={search}
                onChange={event => onSearchChange(event.target.value)}
                placeholder="Search notes, tags..."
                className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all text-gray-700 dark:text-gray-300 placeholder-gray-400"
            />
            {search && (
                <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>

        <div className="lg:hidden flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shrink-0">
            {(['all', 'active', 'draft', 'pinned'] as const).map(val => (
                <button
                    key={val}
                    onClick={() => onFilterStatus(val)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                        filterStatus === val
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400'
                    }`}
                >
                    {val === 'all' ? 'All' : val === 'pinned' ? 'Pinned' : val}
                </button>
            ))}
        </div>

        <div className="ml-auto flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shrink-0">
            <button
                onClick={() => onViewChange('grid')}
                className={`p-1.5 rounded-md transition-all ${
                    view === 'grid' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
                }`}
                title="Grid view"
            >
                <LayoutGrid className="w-4 h-4" />
            </button>
            <button
                onClick={() => onViewChange('list')}
                className={`p-1.5 rounded-md transition-all ${
                    view === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
                }`}
                title="List view"
            >
                <ListIcon className="w-4 h-4" />
            </button>
        </div>
    </div>
);
