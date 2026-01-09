import React from 'react';
import type { ChatMessage } from '../../types/chatbot';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SpeakerButton } from '../ui/SpeakerButton';

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
                <div className="relative group/bubble">
                    <div className={`p-4 rounded-2xl shadow-sm transition-colors ${isAi
                        ? 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
                        : 'bg-indigo-600 text-white rounded-tr-none'
                        }`}>
                        <div className={`prose prose-sm max-w-none ${isAi ? 'prose-indigo dark:prose-invert' : 'prose-invert'}`}>
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        <div className={`text-xs mt-2 ${isAi ? 'text-gray-400 dark:text-gray-500' : 'text-indigo-200'}`}>
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    {isAi && (
                        <div className="absolute -right-12 top-0 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                            <SpeakerButton text={message.content} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
