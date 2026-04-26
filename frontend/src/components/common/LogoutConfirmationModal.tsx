import React from 'react';
import { LogOut, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface LogoutConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <h3 id="logout-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
                    Ready to leave?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    Are you sure you want to log out? You will need to log back in to access your account.
                </p>
                <div className="flex items-center gap-3 w-full">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white border-transparent">
                        Log Out
                    </Button>
                </div>
            </div>
        </div>
    );
};
