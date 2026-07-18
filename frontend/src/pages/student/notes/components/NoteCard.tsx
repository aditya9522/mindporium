import { Clock, Copy, File, Hash, Pin, PinOff, Trash2 } from 'lucide-react';

import {
    getColorAccentBorder,
    getColorBorderClass,
    STATUS_CONFIG,
} from '../constants';
import type { Note, NoteView } from '../types';
import { isImage, relativeTime, stripHtml, wordCount } from '../utils';

interface NoteCardProps {
    note: Note;
    onOpen: (note: Note) => void;
    onDelete: (id: number) => void;
    onPin: (id: number) => void;
    onDuplicate: (id: number) => void;
    view: NoteView;
}

export const NoteCard = ({ note, onOpen, onDelete, onPin, onDuplicate, view }: NoteCardProps) => {
    const cfg = STATUS_CONFIG[note.status];
    const preview = stripHtml(note.content);
    const imgFiles = note.files.filter(file => isImage(file.type));
    const cardBorder = getColorBorderClass(note.color);
    const colorBorder = getColorAccentBorder(note.color);
    const wc = wordCount(note.content);

    if (view === 'list') {
        return (
            <div
                className={`group flex items-center gap-4 w-full overflow-hidden bg-white dark:bg-gray-900 rounded-xl border ${cardBorder} border-l-4 ${colorBorder || 'border-l-gray-200 dark:border-l-gray-700'} px-5 py-5 hover:shadow-md transition-all duration-150 cursor-pointer`}
                onClick={() => onOpen(note)}
            >
                {note.is_pinned && <Pin className="w-3.5 h-3.5 text-primary-500 shrink-0" />}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate flex-1 min-w-0">
                            {note.title}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${cfg.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                        </span>
                    </div>
                    {preview && <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">{preview}</p>}
                </div>

                {imgFiles.length > 0 && (
                    <div className="hidden sm:block w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700 ml-2 shadow-sm">
                        <img src={imgFiles[0].url} alt="" className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="hidden md:flex items-center gap-3 text-[11px] text-gray-400 shrink-0">
                    {note.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-primary-500 font-medium">
                            #{tag}
                        </span>
                    ))}
                    {wc > 0 && <span>{wc}w</span>}
                    <span className="whitespace-nowrap">{relativeTime(note.updated_at)}</span>
                </div>

                <div
                    className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={event => event.stopPropagation()}
                >
                    <button
                        onClick={() => onDuplicate(note.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        title="Duplicate"
                    >
                        <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onPin(note.id)}
                        className={`p-1.5 rounded-md transition-colors ${
                            note.is_pinned
                                ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                : 'text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                        }`}
                        title={note.is_pinned ? 'Unpin' : 'Pin'}
                    >
                        {note.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        onClick={() => onDelete(note.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`group relative bg-white dark:bg-gray-900 rounded-xl border ${cardBorder} border-l-4 ${colorBorder || 'border-l-gray-200 dark:border-l-gray-700'} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col`}
            onClick={() => onOpen(note)}
        >
            {imgFiles.length > 0 && (
                <div className="w-full h-48 overflow-hidden bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800/50">
                    <img
                        src={imgFiles[0].url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}

            <div className="flex flex-col gap-2.5 p-4 flex-1">
                {note.is_pinned && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-primary-600 dark:text-primary-400">
                        <Pin className="w-3 h-3" /> Pinned
                    </div>
                )}

                <div className="flex items-start gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 leading-snug">
                        {note.title}
                    </h3>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                    </span>
                </div>

                {preview && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{preview}</p>}

                {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {note.tags.slice(0, 3).map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-medium rounded-md border border-primary-100 dark:border-primary-800"
                            >
                                <Hash className="w-2.5 h-2.5" />
                                {tag}
                            </span>
                        ))}
                        {note.tags.length > 3 && <span className="text-[10px] text-gray-400">+{note.tags.length - 3}</span>}
                    </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {relativeTime(note.updated_at)}
                        </span>
                        {wc > 0 && <span>{wc}w</span>}
                        {note.files.length > 0 && (
                            <span className="flex items-center gap-0.5">
                                <File className="w-3 h-3" /> {note.files.length}
                            </span>
                        )}
                    </div>
                    <div
                        className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={event => event.stopPropagation()}
                    >
                        <button
                            onClick={() => onDuplicate(note.id)}
                            className="p-1 rounded-md text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            title="Duplicate"
                        >
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => onPin(note.id)}
                            className={`p-1 rounded-md transition-colors ${
                                note.is_pinned
                                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                    : 'text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                            }`}
                            title={note.is_pinned ? 'Unpin' : 'Pin'}
                        >
                            {note.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                        </button>
                        <button
                            onClick={() => onDelete(note.id)}
                            className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
