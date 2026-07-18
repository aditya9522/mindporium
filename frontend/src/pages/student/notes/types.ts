export interface NoteFile {
    name: string;
    url: string;
    type: string;
}

export interface Note {
    id: number;
    title: string;
    content: string;
    files: NoteFile[];
    tags: string[];
    status: 'active' | 'draft' | 'archived';
    is_pinned: boolean;
    color: string | null;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface DeleteConfirmationState {
    title: string;
    message: string;
    itemName?: string;
    confirmLabel?: string;
    onConfirm: () => void | Promise<void>;
    loading?: boolean;
}

export type NoteView = 'grid' | 'list';
export type NoteStatusFilter = 'all' | Note['status'];

export interface NoteStatusCounts {
    active: number;
    draft: number;
    archived: number;
    pinned: number;
}
