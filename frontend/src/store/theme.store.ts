import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeColor = 'default' | 'ocean' | 'midnight' | 'forest' | 'sunset';
type ThemeMode = 'light' | 'dark' | 'system';
type Language = 'en' | 'es' | 'fr' | 'de' | 'hi';

interface ThemeState {
    themeColor: ThemeColor;
    mode: ThemeMode;
    language: Language;
    appIcon: string | null;
    appName: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;

    // Actions
    setThemeColor: (color: ThemeColor) => void;
    setMode: (mode: ThemeMode) => void;
    setLanguage: (lang: Language) => void;
    setAppIcon: (url: string | null) => void;
    setAppName: (name: string) => void;
    setMaintenanceMode: (enabled: boolean) => void;
    setAllowRegistration: (allowed: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            themeColor: 'default',
            mode: 'light',
            language: 'en',
            appIcon: null,
            appName: 'Mindporium',
            maintenanceMode: false,
            allowRegistration: true,

            setThemeColor: (color) => set({ themeColor: color }),
            setMode: (mode) => set({ mode }),
            setLanguage: (language) => set({ language }),
            setAppIcon: (appIcon) => set({ appIcon }),
            setAppName: (appName) => set({ appName }),
            setMaintenanceMode: (maintenanceMode) => set({ maintenanceMode }),
            setAllowRegistration: (allowRegistration) => set({ allowRegistration }),
        }),
        {
            name: 'mindporium-theme-storage',
        }
    )
);
