import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
    loading?: boolean;
    isDeleting?: boolean;
    confirmText?: string;
}

export const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
    loading = false,
    isDeleting = false,
    confirmText = 'Delete'
}: DeleteConfirmationModalProps) => {
    const isLoading = loading || isDeleting;
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all duration-300">
            {/* Modal Container */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-white/20 dark:border-gray-800 transform transition-all duration-300 scale-100 animate-in zoom-in-95 fade-in duration-200">

                {/* Visual Accent/Header */}
                <div className="h-2 bg-linear-to-r from-red-500 via-rose-500 to-red-600" />

                <div className="p-8">
                    {/* Icon & Title */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="mb-4 relative">
                            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full scale-150 animate-pulse" />
                            <div className="relative w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center border border-red-100 dark:border-red-800/50">
                                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {/* Item Highlight */}
                    {itemName && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-800 group transition-all hover:bg-red-50/50 dark:hover:bg-red-900/10">
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 group-hover:text-red-400 transition-colors">Confirming Deletion of</p>
                            <p className="text-gray-900 dark:text-gray-200 font-semibold break-all">{itemName}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-6 py-3.5 text-gray-600 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                        >
                            Keep it
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="relative overflow-hidden group px-6 py-3.5 bg-red-600 dark:bg-rose-600 text-white font-bold rounded-xl hover:bg-red-700 dark:hover:bg-rose-700 transition-all shadow-lg shadow-red-200 dark:shadow-rose-900/20 active:scale-95 disabled:opacity-80 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <span>{confirmText}</span>
                                </>
                            )}

                            {/* Hover effect light */}
                            <div className="absolute inset-0 w-1/2 h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-white/50 dark:bg-gray-800/50 rounded-full border border-white/20 dark:border-gray-700 hover:rotate-90"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
