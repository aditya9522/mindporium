import React from 'react';
import type { ChatMessage } from '../../types/chatbot';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
    message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isAi = message.sender === 'ai' || message.sender === 'model';

    return (
        <div className={`flex w-full mb-6 ${isAi ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex max-w-[80%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isAi ? 'bg-indigo-100 text-indigo-600 mr-3' : 'bg-gray-200 text-gray-600 ml-3'
                    }`}>
                    {isAi ? <Bot size={20} /> : <User size={20} />}
                </div>

                {/* Message Content */}
                <div className={`p-4 rounded-2xl shadow-sm ${isAi
                    ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                    : 'bg-indigo-600 text-white rounded-tr-none'
                    }`}>
                    <div className={`prose prose-sm max-w-none ${isAi ? 'prose-indigo' : 'prose-invert'}`}>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    <div className={`text-xs mt-2 ${isAi ? 'text-gray-400' : 'text-indigo-200'}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        </div>
    );
};
