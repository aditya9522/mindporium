import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    className?: string;
    isListening?: boolean;
    setIsListening?: (listening: boolean) => void;
}

export const VoiceInput = ({
    onTranscript,
    className = "",
    isListening: externalIsListening,
    setIsListening: externalSetIsListening
}: VoiceInputProps) => {
    const [internalIsListening, setInternalIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const isListening = externalIsListening !== undefined ? externalIsListening : internalIsListening;
    const setIsListening = externalSetIsListening || setInternalIsListening;

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                onTranscript(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onTranscript, setIsListening]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-full transition-all duration-300 ${isListening
                ? 'bg-red-50 text-red-600 animate-pulse ring-2 ring-red-100'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-indigo-600'
                } ${className}`}
            title={isListening ? "Stop listening" : "Start voice input"}
        >
            {isListening ? (
                <MicOff className="w-5 h-5" />
            ) : (
                <Mic className="w-5 h-5" />
            )}
        </button>
    );
};
