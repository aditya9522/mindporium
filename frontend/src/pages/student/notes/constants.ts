import { Archive, CheckCircle, Edit3 } from 'lucide-react';

export const STATUS_CONFIG = {
    active: {
        label: 'Active',
        dot: 'bg-emerald-500',
        badge: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-800',
        icon: CheckCircle,
    },
    draft: {
        label: 'Draft',
        dot: 'bg-amber-400',
        badge: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-800',
        icon: Edit3,
    },
    archived: {
        label: 'Archived',
        dot: 'bg-gray-400',
        badge: 'text-gray-500 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700',
        icon: Archive,
    },
} as const;

export const NOTE_COLORS = [
    {
        key: 'red',
        label: 'Red',
        dot: 'bg-red-400 dark:bg-red-500',
        border: 'border-red-200 dark:border-red-900/60',
        accentBorder: 'border-l-red-400 dark:border-l-red-500',
    },
    {
        key: 'orange',
        label: 'Orange',
        dot: 'bg-orange-400 dark:bg-orange-500',
        border: 'border-orange-200 dark:border-orange-900/60',
        accentBorder: 'border-l-orange-400 dark:border-l-orange-500',
    },
    {
        key: 'yellow',
        label: 'Yellow',
        dot: 'bg-yellow-400 dark:bg-yellow-500',
        border: 'border-yellow-200 dark:border-yellow-900/60',
        accentBorder: 'border-l-yellow-400 dark:border-l-yellow-500',
    },
    {
        key: 'green',
        label: 'Green',
        dot: 'bg-emerald-400 dark:bg-emerald-500',
        border: 'border-emerald-200 dark:border-emerald-900/60',
        accentBorder: 'border-l-emerald-400 dark:border-l-emerald-500',
    },
    {
        key: 'blue',
        label: 'Blue',
        dot: 'bg-blue-400 dark:bg-blue-500',
        border: 'border-blue-200 dark:border-blue-900/60',
        accentBorder: 'border-l-blue-400 dark:border-l-blue-500',
    },
    {
        key: 'purple',
        label: 'Purple',
        dot: 'bg-purple-400 dark:bg-purple-500',
        border: 'border-purple-200 dark:border-purple-900/60',
        accentBorder: 'border-l-purple-400 dark:border-l-purple-500',
    },
] as const;

export const getColorDot = (color: string | null) =>
    NOTE_COLORS.find(c => c.key === color)?.dot ?? 'bg-gray-200 dark:bg-gray-700';

export const getColorBorderClass = (color: string | null) =>
    color
        ? NOTE_COLORS.find(c => c.key === color)?.border ?? 'border-gray-200 dark:border-gray-800'
        : 'border-gray-200 dark:border-gray-800';

export const getColorAccentBorder = (color: string | null) =>
    color ? NOTE_COLORS.find(c => c.key === color)?.accentBorder ?? '' : '';
