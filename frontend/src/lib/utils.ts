import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | undefined | null) {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:')) {
        return path;
    }
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}
