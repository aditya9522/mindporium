import { X } from 'lucide-react';

import type { NoteStatusFilter } from '../types';

interface ActiveFiltersProps {
    search: string;
    filterStatus: NoteStatusFilter;
    filterTag: string | null;
    resultCount: number;
    onSearchChange: (value: string) => void;
    onFilterStatus: (status: NoteStatusFilter) => void;
    onFilterTag: (tag: string | null) => void;
}

export const ActiveFilters = ({
    search,
    filterStatus,
    filterTag,
    resultCount,
    onSearchChange,
    onFilterStatus,
    onFilterTag,
}: ActiveFiltersProps) => {
    if (!filterTag && filterStatus === 'all' && !search) return null;

    return (
        <div className="flex items-center gap-2 px-4 sm:px-5 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-955 flex-wrap">
            <span className="text-xs text-gray-400">Filters:</span>
            {filterStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full border border-primary-100 dark:border-primary-800">
                    {filterStatus}
                    <button onClick={() => onFilterStatus('all')} className="hover:text-red-500 ml-0.5">
                        <X className="w-3 h-3" />
                    </button>
                </span>
            )}
            {filterTag && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full border border-primary-100 dark:border-primary-800">
                    #{filterTag}
                    <button onClick={() => onFilterTag(null)} className="hover:text-red-500 ml-0.5">
                        <X className="w-3 h-3" />
                    </button>
                </span>
            )}
            {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                    "{search}"
                    <button onClick={() => onSearchChange('')} className="hover:text-red-500 ml-0.5">
                        <X className="w-3 h-3" />
                    </button>
                </span>
            )}
            <span className="text-xs text-gray-400">
                {resultCount} result{resultCount !== 1 ? 's' : ''}
            </span>
        </div>
    );
};
