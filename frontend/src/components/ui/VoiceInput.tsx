import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface VoiceInputProps {
    onResult: (text: string) => void;
    placeholder?: string;
    className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onResult, className }) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                onResult(transcript);
                setIsListening(false);
            };

            recognitionInstance.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    toast.error('Microphone access denied');
                } else {
                    toast.error('Speech recognition failed');
                }
            };

            recognitionInstance.onend = () => {
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        }
    }, [onResult]);

    const toggleListening = () => {
        if (!recognition) {
            toast.error('Speech recognition not supported in this browser');
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            try {
                recognition.start();
                setIsListening(true);
            } catch (err) {
                console.error('Failed to start recognition:', err);
            }
        }
    };

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-lg transition-all duration-200 ${isListening
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                } ${className}`}
            title={isListening ? 'Stop Listening' : 'Search by Voice'}
        >
            {isListening ? (
                <MicOff className="w-5 h-5" />
            ) : (
                <Mic className="w-5 h-5" />
            )}
        </button>
    );
};
