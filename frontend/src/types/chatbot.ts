export interface ChatMessage {
    id: number;
    session_id: number;
    content: string;
    sender: 'user' | 'ai' | 'model';
    created_at: string;
}

export interface ChatSession {
    id: number;
    user_id: number;
    title: string;
    created_at: string;
    updated_at: string;
    messages: ChatMessage[];
}

export interface CreateMessageRequest {
    content: string;
}
