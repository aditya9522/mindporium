import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
    loading?: boolean;
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
    confirmText = 'Delete'
}: DeleteConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-br from-red-500 to-red-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold">{title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                            disabled={loading}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-700 mb-4">{message}</p>
                    {itemName && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-red-800">
                                <span className="font-semibold">Item to delete:</span>
                                <br />
                                <span className="font-bold">{itemName}</span>
                            </p>
                        </div>
                    )}
                    <p className="text-sm text-gray-500">
                        This action cannot be undone.
                    </p>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
