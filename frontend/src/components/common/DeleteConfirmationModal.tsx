import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDeleting?: boolean;
}

export const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    isDeleting = false,
}: DeleteConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{description}</p>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Processing...' : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};
