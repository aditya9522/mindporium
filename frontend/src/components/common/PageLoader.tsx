import { Loader2 } from 'lucide-react';

export const PageLoader = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                <p className="text-gray-500 font-medium animate-pulse">Loading Mindporium...</p>
            </div>
        </div>
    );
};
