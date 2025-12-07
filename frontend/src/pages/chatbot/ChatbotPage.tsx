import { useState, useEffect, useRef } from 'react';
import { ChatSidebar } from '../../components/chatbot/ChatSidebar';
import { MessageBubble } from '../../components/chatbot/MessageBubble';
import { chatbotService } from '../../services/chatbot.service';
import type { ChatSession, ChatMessage } from '../../types/chatbot';
import { Send, Loader2, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

export const ChatbotPage = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch sessions on mount
    useEffect(() => {
        loadSessions();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [currentSession?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadSessions = async () => {
        try {
            setLoading(true);
            const data = await chatbotService.getSessions();
            setSessions(data);

            // If we have sessions but none selected, select the most recent one
            if (data.length > 0 && !currentSession) {
                await loadSession(data[0].id);
            } else if (data.length === 0) {
                // If no sessions, create one automatically
                handleNewChat();
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
            toast.error('Failed to load chat history');
        } finally {
            setLoading(false);
        }
    };

    const loadSession = async (sessionId: number) => {
        try {
            const session = await chatbotService.getSession(sessionId);
            setCurrentSession(session);
        } catch (error) {
            console.error('Failed to load session:', error);
            toast.error('Failed to load chat session');
        }
    };

    const handleNewChat = async () => {
        try {
            setLoading(true);
            const newSession = await chatbotService.createSession();
            setSessions([newSession, ...sessions]);
            setCurrentSession(newSession);
        } catch (error) {
            console.error('Failed to create session:', error);
            toast.error('Failed to create new chat');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSession = async (sessionId: number, title: string) => {
        try {
            const updated = await chatbotService.updateSession(sessionId, title);
            setSessions(sessions.map(s => s.id === sessionId ? updated : s));
            if (currentSession?.id === sessionId) {
                setCurrentSession({ ...currentSession, title: updated.title });
            }
            toast.success('Chat renamed');
        } catch (error) {
            console.error('Failed to update session:', error);
            toast.error('Failed to update chat');
        }
    };

    const handleDeleteSession = async (sessionId: number) => {
        try {
            await chatbotService.deleteSession(sessionId);
            setSessions(sessions.filter(s => s.id !== sessionId));
            if (currentSession?.id === sessionId) {
                setCurrentSession(null);
                // Optionally load another session or clear view
            }
            toast.success('Chat deleted');
        } catch (error) {
            console.error('Failed to delete session:', error);
            toast.error('Failed to delete chat');
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!input.trim() || !currentSession || sending) return;

        const content = input.trim();
        setInput('');
        setSending(true);

        // Optimistically add user message
        const optimisticMsg: ChatMessage = {
            id: Date.now(), // temporary ID
            session_id: currentSession.id,
            content: content,
            sender: 'user',
            created_at: new Date().toISOString()
        };

        const updatedSession = {
            ...currentSession,
            messages: [...(currentSession.messages || []), optimisticMsg]
        };
        setCurrentSession(updatedSession);

        try {
            const responseMsg = await chatbotService.sendMessage(currentSession.id, content);

            // Update session with actual AI response
            // We need to reload the session to get the updated messages list properly synced or just append
            // For smoother UX, let's append the AI response
            setCurrentSession(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    messages: [...(prev.messages || []), responseMsg]
                };
            });

            // Update session title in sidebar if it was "New Chat" and this is the first message
            if (currentSession.messages.length === 0) {
                loadSessions(); // Refresh list to get new title
            }

        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
            // Revert optimistic update on error (optional, but good practice)
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50">
            {/* Sidebar */}
            <ChatSidebar
                sessions={sessions}
                currentSessionId={currentSession?.id || null}
                onSelectSession={loadSession}
                onNewChat={handleNewChat}
                onUpdateSession={handleUpdateSession}
                onDeleteSession={handleDeleteSession}
                loading={loading}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full">
                {currentSession ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <Bot className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {currentSession.title || 'AI Assistant'}
                                    </h2>
                                    <p className="text-sm text-gray-500">Always here to help you learn</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
                            {currentSession.messages && currentSession.messages.length > 0 ? (
                                currentSession.messages.map((msg) => (
                                    <MessageBubble key={msg.id} message={msg} />
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <Bot className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-medium text-gray-900">How can I help you today?</h3>
                                        <p className="max-w-sm mt-2 text-sm text-gray-500">
                                            Ask me anything about your courses, assignments, or general topics.
                                        </p>
                                    </div>
                                </div>
                            )}
                            {sending && (
                                <div className="flex justify-start w-full mb-6">
                                    <div className="flex max-w-[80%] flex-row">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 mr-3">
                                            <Bot size={20} />
                                        </div>
                                        <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="bg-white border-t border-gray-200 p-4">
                            <div className="max-w-4xl mx-auto">
                                <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type your message..."
                                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                        disabled={sending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || sending}
                                        className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </form>
                                <p className="text-xs text-center text-gray-400 mt-2">
                                    AI can make mistakes. Consider checking important information.
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                )}
            </div>
        </div>
    );
};
