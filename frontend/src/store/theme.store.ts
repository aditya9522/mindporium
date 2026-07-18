import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeColor = 'default' | 'ocean' | 'midnight' | 'forest' | 'sunset';
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
    themeColor: ThemeColor;
    mode: ThemeMode;
    appIcon: string | null;
    appName: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;

    // Actions
    setThemeColor: (color: ThemeColor) => void;
    setMode: (mode: ThemeMode) => void;
    setAppIcon: (url: string | null) => void;
    setAppName: (name: string) => void;
    setMaintenanceMode: (enabled: boolean) => void;
    setAllowRegistration: (allowed: boolean) => void;
    resetAppearance: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            themeColor: 'default',
            mode: 'light',
            appIcon: '/logo.png',
            appName: 'Mindporium',
            maintenanceMode: false,
            allowRegistration: true,

            setThemeColor: (color) => set({ themeColor: color }),
            setMode: (mode) => set({ mode }),
            setAppIcon: (appIcon) => set({ appIcon }),
            setAppName: (appName) => set({ appName }),
            setMaintenanceMode: (maintenanceMode) => set({ maintenanceMode }),
            setAllowRegistration: (allowRegistration) => set({ allowRegistration }),
            resetAppearance: () => set({ themeColor: 'default', mode: 'light' }),
        }),
        {
            name: 'mindporium-theme-storage',
        }
    )
);
