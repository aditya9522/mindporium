import { useState, useEffect, useRef } from 'react';
import { Sparkles, FileText, Brain, MessageSquare, Send, RefreshCw, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

interface AIStudyBuddyProps {
    courseTitle: string;
    lessonTitle: string;
    lessonDescription: string;
    onClose: () => void;
}

interface Flashcard {
    question: string;
    answer: string;
}

interface ChatMessage {
    sender: 'user' | 'ai';
    content: string;
}

type TabType = 'notes' | 'flashcards' | 'chat';

export const AIStudyBuddy = ({ courseTitle, lessonTitle, lessonDescription, onClose }: AIStudyBuddyProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('notes');
    const [notes, setNotes] = useState<string>('');
    const [loadingNotes, setLoadingNotes] = useState(false);

    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [loadingFlashcards, setLoadingFlashcards] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [sendingChat, setSendingChat] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Reset notes and flashcards when lesson changes
    useEffect(() => {
        setNotes('');
        setFlashcards([]);
        setChatMessages([
            {
                sender: 'ai',
                content: `Hi! I'm your AI Study Buddy. Ask me anything about this lesson: **${lessonTitle}**!`
            }
        ]);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    }, [lessonTitle]);

    const generateNotes = async () => {
        setLoadingNotes(true);
        try {
            const res = await api.post('/chatbot/study-companion', {
                course_title: courseTitle,
                lesson_title: lessonTitle,
                lesson_description: lessonDescription,
                action: 'notes'
            });
            setNotes(res.data.notes || 'Failed to generate notes.');
            toast.success('Study notes generated!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate study notes');
        } finally {
            setLoadingNotes(false);
        }
    };

    const generateFlashcards = async () => {
        setLoadingFlashcards(true);
        setIsFlipped(false);
        try {
            const res = await api.post('/chatbot/study-companion', {
                course_title: courseTitle,
                lesson_title: lessonTitle,
                lesson_description: lessonDescription,
                action: 'flashcards'
            });
            setFlashcards(res.data.flashcards || []);
            setCurrentCardIndex(0);
            toast.success('Study flashcards generated!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate flashcards');
        } finally {
            setLoadingFlashcards(false);
        }
    };

    const handleSendChat = async (e: React.FormEvent) => {
        e.preventDefault();
        const query = chatInput.trim();
        if (!query || sendingChat) return;

        setChatInput('');
        const userMsg: ChatMessage = { sender: 'user', content: query };
        setChatMessages(prev => [...prev, userMsg]);
        setSendingChat(true);

        try {
            const res = await api.post('/chatbot/study-companion', {
                course_title: courseTitle,
                lesson_title: lessonTitle,
                lesson_description: lessonDescription,
                action: 'chat',
                user_query: query,
                history: chatMessages.slice(1) // skip welcome message
            });
            const aiMsg: ChatMessage = { sender: 'ai', content: res.data.response || "I couldn't generate an answer." };
            setChatMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            toast.error('Failed to get response');
        } finally {
            setSendingChat(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800 text-white w-96 max-w-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/90 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-linear-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-wide">AI Study Buddy</h3>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Lesson Companion</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-800 p-2 gap-1 bg-gray-950/20">
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'notes'
                            ? 'bg-gray-800 text-indigo-400 border border-gray-700/50 shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                    }`}
                >
                    <FileText className="w-3.5 h-3.5" />
                    Smart Notes
                </button>
                <button
                    onClick={() => setActiveTab('flashcards')}
                    className={`flex-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'flashcards'
                            ? 'bg-gray-800 text-indigo-400 border border-gray-700/50 shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                    }`}
                >
                    <Brain className="w-3.5 h-3.5" />
                    Flashcards
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'chat'
                            ? 'bg-gray-800 text-indigo-400 border border-gray-700/50 shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                    }`}
                >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Tutor Chat
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0 flex flex-col">
                {/* Notes Tab */}
                {activeTab === 'notes' && (
                    <div className="flex flex-col h-full">
                        {notes ? (
                            <div className="space-y-4">
                                <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed">
                                    <ReactMarkdown>{notes}</ReactMarkdown>
                                </div>
                                <button
                                    onClick={generateNotes}
                                    disabled={loadingNotes}
                                    className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 bg-gray-850 text-gray-200 transition-colors hover:border-primary-700 hover:bg-primary-900/30 hover:text-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
                                    aria-label="Regenerate study notes"
                                    title="Regenerate study notes"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loadingNotes ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
                                <div className="bg-indigo-950/40 p-4 rounded-full border border-indigo-500/20 shadow-inner">
                                    <FileText className="w-8 h-8 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">Generate Study Notes</h4>
                                    <p className="text-xs text-gray-400 mt-1 max-w-60">
                                        Analyze the lesson and generate structured notes with takeaways.
                                    </p>
                                </div>
                                <button
                                    onClick={generateNotes}
                                    disabled={loadingNotes}
                                    className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 flex items-center transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loadingNotes ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Analyzing Lesson...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Generate Smart Notes
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Flashcards Tab */}
                {activeTab === 'flashcards' && (
                    <div className="flex flex-col h-full">
                        {flashcards.length > 0 ? (
                            <div className="flex flex-col h-full justify-between gap-6 py-2">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs text-gray-450 font-bold px-1">
                                        <span>Lesson Assessment</span>
                                        <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
                                    </div>

                                    {/* 3D Flashcard */}
                                    <div className="perspective-1000 w-full h-56">
                                        <div
                                            onClick={() => setIsFlipped(!isFlipped)}
                                            className="w-full h-full cursor-pointer relative duration-500 transform-style-3d shadow-2xl transition-transform"
                                            style={{ transform: isFlipped ? 'rotateY(180deg)' : 'none' }}
                                        >
                                            {/* Front Side */}
                                            <div 
                                                className="absolute inset-0 bg-gray-850 hover:bg-gray-800 border border-gray-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl backface-hidden"
                                                style={{ backfaceVisibility: 'hidden' }}
                                            >
                                                <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Question</div>
                                                <p className="text-sm font-semibold text-center text-white my-auto px-2">
                                                    {flashcards[currentCardIndex].question}
                                                </p>
                                                <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-wide">
                                                    Click to Reveal Answer
                                                </p>
                                            </div>

                                            {/* Back Side */}
                                            <div
                                                className="absolute inset-0 bg-linear-to-b from-indigo-950 to-indigo-900 border border-indigo-500/30 rounded-2xl p-6 flex flex-col justify-between shadow-xl backface-hidden"
                                                style={{
                                                    backfaceVisibility: 'hidden',
                                                    transform: 'rotateY(180deg)'
                                                }}
                                            >
                                                <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Correct Answer</div>
                                                <p className="text-xs leading-relaxed text-center text-indigo-100 my-auto overflow-y-auto max-h-24 px-2">
                                                    {flashcards[currentCardIndex].answer}
                                                </p>
                                                <p className="text-[10px] text-center text-indigo-400 font-bold uppercase tracking-wide">
                                                    Click to Flip Back
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Navigation */}
                                    <div className="flex gap-3">
                                        <button
                                            disabled={currentCardIndex === 0}
                                            onClick={() => {
                                                setIsFlipped(false);
                                                setTimeout(() => setCurrentCardIndex(prev => prev - 1), 150);
                                            }}
                                            className="flex-1 py-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 disabled:opacity-30 rounded-xl flex items-center justify-center font-bold text-xs transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                                        </button>
                                        <button
                                            disabled={currentCardIndex === flashcards.length - 1}
                                            onClick={() => {
                                                setIsFlipped(false);
                                                setTimeout(() => setCurrentCardIndex(prev => prev + 1), 150);
                                            }}
                                            className="flex-1 py-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 disabled:opacity-30 rounded-xl flex items-center justify-center font-bold text-xs transition-colors"
                                        >
                                            Next <ChevronRight className="w-4 h-4 ml-1" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={generateFlashcards}
                                        disabled={loadingFlashcards}
                                        className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 bg-gray-850 text-gray-200 transition-colors hover:border-primary-700 hover:bg-primary-900/30 hover:text-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
                                        aria-label="Regenerate flashcards"
                                        title="Regenerate flashcards"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loadingFlashcards ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
                                <div className="bg-indigo-950/40 p-4 rounded-full border border-indigo-500/20 shadow-inner">
                                    <Brain className="w-8 h-8 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">Generate Flashcards</h4>
                                    <p className="text-xs text-gray-400 mt-1 max-w-60">
                                        Test your retention on this lesson using generated interactive study cards.
                                    </p>
                                </div>
                                <button
                                    onClick={generateFlashcards}
                                    disabled={loadingFlashcards}
                                    className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 flex items-center transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loadingFlashcards ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Analyzing Lesson...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Generate Flashcards
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Tutor Chat Tab */}
                {activeTab === 'chat' && (
                    <div className="flex flex-col h-full flex-1">
                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0 mb-4">
                            {chatMessages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm leading-relaxed ${
                                            msg.sender === 'user'
                                                ? 'bg-indigo-650 text-white rounded-tr-none'
                                                : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700/50'
                                        }`}
                                    >
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {sendingChat && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-800 text-gray-450 rounded-2xl rounded-tl-none border border-gray-700/50 p-4 shadow-sm flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input form */}
                        <form onSubmit={handleSendChat} className="flex gap-2 bg-gray-950/40 p-1.5 rounded-xl border border-gray-800 sticky bottom-0">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask a question about this lesson..."
                                className="flex-1 bg-transparent border-0 outline-none text-xs px-2.5 text-white placeholder-gray-500"
                                disabled={sendingChat}
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim() || sendingChat}
                                className="p-2 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-40 disabled:hover:bg-indigo-650 rounded-lg text-white transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
