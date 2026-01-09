import React, { useState, useRef, useEffect } from 'react';
import type { ChatSession } from '../../types/chatbot';
import { MessageSquare, Plus, Loader2, MoreVertical, Edit2, Trash2, X, Check } from 'lucide-react';

interface ChatSidebarProps {
    sessions: ChatSession[];
    currentSessionId: number | null;
    onSelectSession: (sessionId: number) => void;
    onNewChat: () => void;
    onUpdateSession: (sessionId: number, title: string) => void;
    onDeleteSession: (sessionId: number) => void;
    loading: boolean;
    onClose?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    sessions,
    currentSessionId,
    onSelectSession,
    onNewChat,
    onUpdateSession,
    onDeleteSession,
    loading,
    onClose
}) => {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [showOptionsId, setShowOptionsId] = useState<number | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const optionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
                setShowOptionsId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEditStart = (session: ChatSession, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(session.id);
        setEditTitle(session.title || 'New Chat');
        setShowOptionsId(null);
    };

    const handleEditSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (editingId && editTitle.trim()) {
            onUpdateSession(editingId, editTitle.trim());
            setEditingId(null);
        }
    };

    const handleEditCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
    };

    const handleDeleteClick = (sessionId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteConfirmId(sessionId);
        setShowOptionsId(null);
    };

    const handleDeleteConfirm = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (deleteConfirmId) {
            onDeleteSession(deleteConfirmId);
            setDeleteConfirmId(null);
        }
    };

    const handleDeleteCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteConfirmId(null);
    };
    return (
        <div className="w-full bg-white dark:bg-gray-900 h-full flex flex-col border-r border-gray-100 dark:border-gray-800 transition-colors">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
                    History
                </h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onNewChat}
                        disabled={loading}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="New Chat"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 lg:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Action Bar */}
            <div className="p-4">
                <button
                    onClick={onNewChat}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl transition-all font-semibold border border-gray-100 dark:border-gray-700 hover:border-primary-100 dark:hover:border-primary-800 disabled:opacity-50 group"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    Start Fresh
                </button>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {sessions.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        <p className="text-sm">No chat history</p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div key={session.id} className="relative group">
                            <button
                                onClick={() => onSelectSession(session.id)}
                                className={`w-full text-left p-3 rounded-lg transition-all border ${currentSessionId === session.id
                                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 shadow-sm'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-transparent text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <MessageSquare className={`w-5 h-5 mt-0.5 flex-shrink-0 ${currentSessionId === session.id ? 'text-primary-600' : 'text-gray-400'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        {editingId === session.id ? (
                                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-primary-300 dark:border-primary-700 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                    autoFocus
                                                />
                                                <button onClick={handleEditSave} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={handleEditCancel} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className={`font-medium text-sm truncate pr-6 ${currentSessionId === session.id ? 'text-primary-900 dark:text-primary-200' : 'text-gray-900 dark:text-gray-200'
                                                    }`}>
                                                    {session.title || 'New Chat'}
                                                </h3>
                                                <p className={`text-xs mt-1 truncate ${currentSessionId === session.id ? 'text-primary-500 dark:text-primary-400/80' : 'text-gray-500 dark:text-gray-500'
                                                    }`}>
                                                    {new Date(session.updated_at || session.created_at).toLocaleDateString()}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* Options Button */}
                            {!editingId && (
                                <div className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowOptionsId(showOptionsId === session.id ? null : session.id);
                                        }}
                                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Options Dropdown */}
                            {showOptionsId === session.id && (
                                <div ref={optionsRef} className="absolute top-8 right-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-10 py-1 transition-colors">
                                    <button
                                        onClick={(e) => handleEditStart(session, e)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" /> Rename
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(session.id, e)}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            )}

                            {/* Delete Confirmation Overlay */}
                            {deleteConfirmId === session.id && (
                                <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center gap-2 rounded-lg z-20">
                                    <span className="text-xs font-medium text-red-600">Delete?</span>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleDeleteCancel}
                                        className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
