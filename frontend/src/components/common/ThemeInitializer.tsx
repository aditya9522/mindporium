import { useEffect } from 'react';
import { useThemeStore } from '../../store/theme.store';

const THEMES = {
    default: { // Indigo
        50: '#eef2ff',
        100: '#e0e7ff',
        200: '#c7d2fe',
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
        800: '#3730a3',
        900: '#312e81',
        950: '#1e1b4b',
    },
    ocean: { // Blue
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554',
    },
    midnight: { // Purple
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7e22ce',
        800: '#6b21a8',
        900: '#581c87',
        950: '#3b0764',
    },
    forest: { // Emerald
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
        950: '#022c22',
    },
    sunset: { // Orange
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
        950: '#431407',
    },
};

export const ThemeInitializer = () => {
    const { themeColor, mode } = useThemeStore();

    useEffect(() => {
        const root = document.documentElement;

        // Apply Mode
        root.classList.remove('dark');
        if (mode === 'dark') {
            root.classList.add('dark');
        } else if (mode === 'system') {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
            }
        }

        // Apply Theme Colors
        const colors = THEMES[themeColor] || THEMES.default;
        Object.entries(colors).forEach(([shade, value]) => {
            root.style.setProperty(`--primary-${shade}`, value);
        });

    }, [themeColor, mode]);

    return null;
};
