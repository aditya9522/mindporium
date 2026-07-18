import { Plus, StickyNote } from 'lucide-react';

interface EmptyNotesStateProps {
    hasFilters: boolean;
    onNewNote: () => void;
}

export const EmptyNotesState = ({ hasFilters, onNewNote }: EmptyNotesStateProps) => (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center">
            <StickyNote className="w-7 h-7 text-primary-500" />
        </div>
        <div>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                {hasFilters ? 'No matching notes' : 'No notes yet'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
                {hasFilters ? 'Try adjusting your filters' : 'Click "New Note" to get started'}
            </p>
        </div>
        {!hasFilters && (
            <button
                onClick={onNewNote}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
                <Plus className="w-4 h-4" /> Create Note
            </button>
        )}
    </div>
);
