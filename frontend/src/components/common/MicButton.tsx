import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface MicButtonProps {
    onTranscript: (text: string) => void;
    className?: string;
}

export const MicButton: React.FC<MicButtonProps> = ({ onTranscript, className }) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
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
                toast.error('Voice input failed. Please try again.');
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [onTranscript]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast.error('Voice input is not supported in this browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                toast.success('Listening...');
            } catch (error) {
                console.error(error);
            }
        }
    };

    if (!('webkitSpeechRecognition' in window)) {
        return null; // Don't render if not supported
    }

    return (
        <Button
            type="button"
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={toggleListening}
            className={`transition-all duration-300 ${isListening ? 'animate-pulse ring-2 ring-red-400' : ''} ${className}`}
            title={isListening ? "Stop Listening" : "Voice Search"}
        >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
    );
};
