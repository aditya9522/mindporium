import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';

interface SpeakerButtonProps {
    text: string;
    className?: string;
}

export const SpeakerButton: React.FC<SpeakerButtonProps> = ({ text, className }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const cancelledRef = useRef(false);

    useEffect(() => {
        if (!('speechSynthesis' in window)) {
            return;
        }

        const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
        loadVoices();
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
            window.speechSynthesis.cancel();
        };
    }, []);

    const cleanForSpeech = (value: string) => value
        .replace(/<[^>]*>?/gm, ' ')
        .replace(/```[\s\S]*?```/g, ' code block ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[#*_~>|-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const chunkText = (value: string) => {
        const sentences = value.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [value];
        const chunks: string[] = [];
        let current = '';

        sentences.forEach((sentence) => {
            const next = `${current} ${sentence}`.trim();
            if (next.length > 220 && current) {
                chunks.push(current);
                current = sentence.trim();
            } else {
                current = next;
            }
        });

        if (current) {
            chunks.push(current);
        }

        return chunks;
    };

    const pickVoice = () => {
        const availableVoices = voices.length ? voices : window.speechSynthesis.getVoices();
        return availableVoices.find((voice) => /natural|premium|neural|google|zira|aria/i.test(voice.name))
            ?? availableVoices.find((voice) => voice.lang.toLowerCase().startsWith('en'))
            ?? availableVoices[0];
    };

    const speakChunks = (chunks: string[], index = 0) => {
        if (cancelledRef.current || index >= chunks.length) {
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[index]);
        const voice = pickVoice();
        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
        } else {
            utterance.lang = 'en-US';
        }
        utterance.rate = 0.92;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onend = () => speakChunks(chunks, index + 1);
        utterance.onerror = (err) => {
            console.error('Speech synthesis error:', err);
            setIsSpeaking(false);
            if (!cancelledRef.current) {
                toast.error('Failed to read text');
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    const speak = () => {
        if (!('speechSynthesis' in window)) {
            toast.error('Text-to-speech not supported');
            return;
        }

        if (isSpeaking) {
            cancelledRef.current = true;
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const cleanText = cleanForSpeech(text);
        if (!cleanText) {
            toast.error('Nothing to read');
            return;
        }

        cancelledRef.current = false;
        window.speechSynthesis.cancel();
        setIsSpeaking(true);
        speakChunks(chunkText(cleanText));
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
