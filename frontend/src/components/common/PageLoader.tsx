import { Loader2 } from 'lucide-react';

export const PageLoader = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary-600 dark:text-primary-400" />
                <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading Mindporium...</p>
            </div>
        </div>
    );
};
