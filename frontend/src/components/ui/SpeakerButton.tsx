import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';

interface SpeakerButtonProps {
    text: string;
    className?: string;
}

export const SpeakerButton: React.FC<SpeakerButtonProps> = ({ text, className }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [synth, setSynth] = useState<SpeechSynthesis | null>(null);

    useEffect(() => {
        setSynth(window.speechSynthesis);
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const speak = () => {
        if (!synth) {
            toast.error('Text-to-speech not supported');
            return;
        }

        if (isSpeaking) {
            synth.cancel();
            setIsSpeaking(false);
            return;
        }

        // Clean text (remove HTML if any, though usually should be plain text)
        const cleanText = text.replace(/<[^>]*>?/gm, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (err) => {
            console.error('Speech synthesis error:', err);
            setIsSpeaking(false);
            toast.error('Failed to read text');
        };

        // Select a premium voice if available
        const voices = synth.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Natural')
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        synth.speak(utterance);
    };

    return (
        <button
            type="button"
            onClick={speak}
            className={`p-2 rounded-lg transition-all duration-200 ${isSpeaking
                ? 'bg-indigo-100 text-indigo-600 animate-pulse'
                : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                } ${className}`}
            title={isSpeaking ? 'Stop Reading' : 'Read Aloud'}
        >
            {isSpeaking ? (
                <VolumeX className="w-5 h-5" />
            ) : (
                <Volume2 className="w-5 h-5" />
            )}
        </button>
    );
};
