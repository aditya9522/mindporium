import { create } from 'zustand';
import type { ReactNode } from 'react';

interface SidebarState {
    isOpen: boolean;
    customSidebarContent: ReactNode | null;
    toggleSidebar: () => void;
    openSidebar: () => void;
    closeSidebar: () => void;
    setCustomSidebarContent: (content: ReactNode | null) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
    isOpen: true,
    customSidebarContent: null,
    toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
    openSidebar: () => set({ isOpen: true }),
    closeSidebar: () => set({ isOpen: false }),
    setCustomSidebarContent: (content) => set({ customSidebarContent: content }),
}));
