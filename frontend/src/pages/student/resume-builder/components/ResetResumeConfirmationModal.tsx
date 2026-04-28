import React from 'react';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

interface ResetResumeConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const ResetResumeConfirmationModal: React.FC<ResetResumeConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-resume-modal-title"
        >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label="Close reset confirmation"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <h3 id="reset-resume-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
                    Reset to default template?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    This will replace your current resume draft with the default template. Your unsaved custom edits in this draft will be removed.
                </p>

                <div className="mt-5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 px-4 py-3">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                        We recommend saving a copy first if you may want to return to this version later.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full mt-6">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} className="flex-1 gap-2 bg-red-600 hover:bg-red-700 text-white border-transparent">
                        <RotateCcw className="w-4 h-4" />
                        Reset Resume
                    </Button>
                </div>
            </div>
        </div>
    );
};
