import { useState, useEffect, useRef } from 'react';
import { ChatSidebar } from '../../components/chatbot/ChatSidebar';
import { MessageBubble } from '../../components/chatbot/MessageBubble';
import { chatbotService } from '../../services/chatbot.service';
import type { ChatSession, ChatMessage } from '../../types/chatbot';
import { Send, Loader2, Bot, PanelLeftOpen, MessageSquarePlus } from 'lucide-react';
import { VoiceInput } from '../../components/ui/VoiceInput';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/common/PageLoader';

export const ChatbotPage = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [input, setInput] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
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

            setCurrentSession(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    messages: [...(prev.messages || []), responseMsg]
                };
            });

            if (currentSession.messages.length === 0) {
                loadSessions();
            }

        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="p-0">
            <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
                {/* Sidebar Overlay for Mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`
                    fixed inset-y-0 left-0 z-30 w-80 bg-white dark:bg-gray-900 transform transition-all duration-300 ease-in-out lg:relative 
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:ml-[-20rem]'}
                    border-r border-gray-100 dark:border-gray-800
                `}>
                    <ChatSidebar
                        sessions={sessions}
                        currentSessionId={currentSession?.id || null}
                        onSelectSession={(id) => {
                            loadSession(id);
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        onNewChat={handleNewChat}
                        onUpdateSession={handleUpdateSession}
                        onDeleteSession={handleDeleteSession}
                        loading={loading}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col h-full min-w-0 bg-gray-50/30 dark:bg-gray-900/10">
                    {currentSession ? (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between z-10 sticky top-0 transition-colors">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                                        title="Toggle Sidebar"
                                    >
                                        <PanelLeftOpen className={`w-5 h-5 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>
                                    <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-200">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                                            {currentSession.title || 'AI Assistant'}
                                        </h2>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Online</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleNewChat}
                                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors sm:hidden"
                                        title="New Chat"
                                    >
                                        <MessageSquarePlus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 dark:bg-gray-950/20 transition-colors">
                                {currentSession.messages && currentSession.messages.length > 0 ? (
                                    currentSession.messages.map((msg) => (
                                        <MessageBubble key={msg.id} message={msg} />
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <Bot className="w-8 h-8 text-primary-400" />
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
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-primary-100 text-primary-600 mr-3">
                                                <Bot size={20} />
                                            </div>
                                            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 transition-colors">
                                <div className="max-w-4xl mx-auto">
                                    <form onSubmit={handleSendMessage} className="relative">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Type your message..."
                                            className="w-full pl-4 pr-24 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100 shadow-inner"
                                            disabled={sending}
                                        />
                                        <div className="absolute right-14 top-1/2 -translate-y-1/2">
                                            <VoiceInput onResult={(text) => setInput(text)} />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || sending}
                                            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all shadow-md shadow-primary-100 disabled:opacity-50 disabled:shadow-none flex items-center justify-center group"
                                        >
                                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                                        </button>
                                    </form>
                                    <p className="text-xs text-center text-gray-400 mt-2">
                                        AI can make mistakes. Consider checking important information.
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <PageLoader />
                    )}
                </div>
            </div>
        </div>
    );
};
