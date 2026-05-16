import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Bot, BrainCircuit, CheckCircle2, ClipboardCheck, FileUp, MessageSquare, Mic, MicOff, Send, Sparkles, Timer, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { SpeakerButton } from '../../../components/ui/SpeakerButton';
import { VoiceInput } from '../../../components/ui/VoiceInput';
import { resumeService } from '../../../services/resume.service';
import {
    careerToolsService,
    type InterviewFeedbackResult,
    type InterviewQuestion,
    type InterviewQuestionResult,
} from '../../../services/career-tools.service';
import { getResumeDraft, listItems, saveResumeDraft, toText } from './utils';

export const AIInterviewSimulatorPage = () => {
    const [resumeData, setResumeData] = useState(() => getResumeDraft());
    const [resumeFileName, setResumeFileName] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [difficulty, setDifficulty] = useState('mid');
    const [session, setSession] = useState<InterviewQuestionResult | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState<InterviewFeedbackResult | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isScoring, setIsScoring] = useState(false);
    const [isImportingResume, setIsImportingResume] = useState(false);
    const [avatarMode, setAvatarMode] = useState<'idle' | 'speaking' | 'listening' | 'thinking'>('idle');
    const recognitionRef = useRef<any>(null);

    const currentIndex = session?.questions.findIndex((question) => question.id === selectedQuestion?.id) ?? -1;
    const progress = session && currentIndex >= 0 ? Math.round(((currentIndex + 1) / session.questions.length) * 100) : 0;

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0]?.transcript ?? '')
                .join(' ')
                .trim();
            if (transcript) {
                setAnswer(transcript);
            }
        };
        recognition.onerror = (event: any) => {
            console.error('Interview voice recognition error:', event.error);
            setAvatarMode('idle');
            toast.error(event.error === 'not-allowed' ? 'Microphone access denied' : 'Voice answer failed');
        };
        recognition.onend = () => {
            setAvatarMode((mode) => mode === 'listening' ? 'idle' : mode);
        };
        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []);

    useEffect(() => {
        setAvatarMode(isGenerating || isScoring ? 'thinking' : 'idle');
    }, [isGenerating, isScoring]);

    useEffect(() => {
        window.speechSynthesis?.cancel();
        recognitionRef.current?.stop();
        setAvatarMode(isGenerating || isScoring ? 'thinking' : 'idle');
    }, [selectedQuestion?.id, isGenerating, isScoring]);

    useEffect(() => () => {
        window.speechSynthesis?.cancel();
        recognitionRef.current?.stop();
    }, []);

    const cleanForSpeech = (value: string) => value
        .replace(/```[\s\S]*?```/g, ' code block ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[#*_~>|-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const speakInterviewText = (text: string, listenAfter = false) => {
        if (!('speechSynthesis' in window)) {
            toast.error('Text-to-speech not supported');
            return;
        }

        const cleanText = cleanForSpeech(text);
        if (!cleanText) {
            toast.error('Nothing to read');
            return;
        }

        recognitionRef.current?.stop();
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find((item) => /natural|premium|neural|google|zira|aria/i.test(item.name))
            ?? voices.find((item) => item.lang.toLowerCase().startsWith('en'));
        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
        }
        utterance.rate = 0.92;
        utterance.volume = 1;
        utterance.onstart = () => setAvatarMode('speaking');
        utterance.onend = () => {
            setAvatarMode('idle');
            if (listenAfter) {
                window.setTimeout(() => startVoiceAnswer(true), 250);
            }
        };
        utterance.onerror = () => {
            setAvatarMode('idle');
            toast.error('Unable to read the question');
        };
        window.speechSynthesis.speak(utterance);
    };

    const startVoiceAnswer = (replaceAnswer = false) => {
        if (!recognitionRef.current) {
            toast.error('Speech recognition not supported in this browser');
            return;
        }

        try {
            if (replaceAnswer) {
                setAnswer('');
            }
            window.speechSynthesis?.cancel();
            recognitionRef.current.start();
            setAvatarMode('listening');
        } catch (error) {
            console.error(error);
        }
    };

    const stopConversation = () => {
        window.speechSynthesis?.cancel();
        recognitionRef.current?.stop();
        setAvatarMode('idle');
    };

    const beginConversation = () => {
        if (!selectedQuestion) return;
        speakInterviewText(`${selectedQuestion.question}. ${selectedQuestion.whatGoodLooksLike}`, true);
    };

    const handleGenerate = async () => {
        if (targetRole.trim().length < 2) {
            toast.error('Add a target role first');
            return;
        }

        setIsGenerating(true);
        setFeedback(null);
        try {
            const response = await careerToolsService.generateInterviewQuestions(resumeData, targetRole, jobDescription, difficulty);
            setSession(response);
            setSelectedQuestion(response.questions[0] ?? null);
            setAnswer('');
            toast.success('Interview room prepared');
        } catch (error) {
            console.error(error);
            toast.error('Unable to generate interview');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        if (!/\.(pdf|docx)$/i.test(file.name)) {
            toast.error('Upload a PDF or DOCX resume');
            return;
        }

        setIsImportingResume(true);
        try {
            const response = await resumeService.importResume(file);
            setResumeData(response.data);
            saveResumeDraft(response.data);
            setResumeFileName(file.name);
            toast.success('Resume added to interview setup');
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.detail || 'Unable to import resume');
        } finally {
            setIsImportingResume(false);
        }
    };

    const handleScore = async () => {
        if (!selectedQuestion || answer.trim().length < 5) {
            toast.error('Answer the selected question first');
            return;
        }

        setIsScoring(true);
        try {
            const response = await careerToolsService.generateInterviewFeedback(
                resumeData,
                targetRole,
                selectedQuestion.question,
                answer
            );
            setFeedback(response);
            toast.success('Answer reviewed');
        } catch (error) {
            console.error(error);
            toast.error('Unable to score answer');
        } finally {
            setIsScoring(false);
        }
    };

    const handleNext = () => {
        if (!session || currentIndex < 0) return;
        const nextQuestion = session.questions[currentIndex + 1];
        if (nextQuestion) {
            setSelectedQuestion(nextQuestion);
            setAnswer('');
            setFeedback(null);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
                    <div className="p-6">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary-600" />
                            <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300">Beta</span>
                        </div>
                        <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">AI Interview Simulator</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                            A resume-aware practice room with an AI interviewer, structured questions, answer scoring, and coaching feedback.
                        </p>
                    </div>
                    <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-950/40 lg:border-l lg:border-t-0">
                        <div className="flex items-center gap-4">
                            <AIAvatar active={Boolean(selectedQuestion)} thinking={isGenerating || isScoring} />
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Mira, AI Interviewer</p>
                                <p className="mt-1 text-xs text-gray-500">{selectedQuestion ? 'Live practice session' : 'Ready to prepare your interview'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <aside className="space-y-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                            <BrainCircuit className="h-4 w-4 text-primary-600" /> Interview Setup
                        </h2>
                        <div className="mt-4 space-y-4">
                            <Field label="Target Role">
                                <input
                                    value={targetRole}
                                    onChange={(event) => setTargetRole(event.target.value)}
                                    placeholder="AI Engineer, Backend Developer..."
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
                                />
                            </Field>
                            <Field label="Difficulty">
                                <select
                                    value={difficulty}
                                    onChange={(event) => setDifficulty(event.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <option value="entry">Entry</option>
                                    <option value="mid">Mid</option>
                                    <option value="senior">Senior</option>
                                </select>
                            </Field>
                            <Field label="Job Description">
                                <textarea
                                    value={jobDescription}
                                    onChange={(event) => setJobDescription(event.target.value)}
                                    rows={7}
                                    placeholder="Paste the role description to personalize the interview..."
                                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
                                />
                            </Field>
                            <Field label="Resume">
                                <div className="space-y-2">
                                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                                        <FileUp className="h-4 w-4" />
                                        {isImportingResume ? 'Importing resume...' : 'Upload PDF or DOCX'}
                                        <input
                                            type="file"
                                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            onChange={handleResumeUpload}
                                            disabled={isImportingResume}
                                            className="sr-only"
                                        />
                                    </label>
                                    <p className="text-xs text-gray-500">
                                        {resumeFileName || resumeData.personalInfo.fullName || 'Using your saved resume draft'}
                                    </p>
                                </div>
                            </Field>
                            <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full gap-2">
                                <Sparkles className="h-4 w-4" /> Prepare Interview Room
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                            <MessageSquare className="h-4 w-4 text-primary-600" /> Question Queue
                        </h2>
                        {session ? (
                            <div className="mt-4 space-y-3">
                                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                    <div className="h-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
                                </div>
                                {session.questions.map((question, index) => (
                                    <button
                                        type="button"
                                        key={question.id}
                                        onClick={() => {
                                            setSelectedQuestion(question);
                                            setFeedback(null);
                                            setAnswer('');
                                        }}
                                        className={`w-full rounded-lg border p-3 text-left transition ${selectedQuestion?.id === question.id
                                            ? 'border-primary-300 bg-primary-50 dark:border-primary-800 dark:bg-primary-950/30'
                                            : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-bold uppercase text-primary-600">Q{index + 1} · {question.type}</p>
                                            {selectedQuestion?.id === question.id && <CheckCircle2 className="h-4 w-4 text-primary-600" />}
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">{question.question}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-gray-500">Prepare an interview to generate a question queue.</p>
                        )}
                    </div>
                </aside>

                <main className="space-y-6">
                    <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                        {selectedQuestion ? (
                            <div className="space-y-5">
                                <div className="rounded-lg border border-primary-100 bg-primary-50/70 p-4 dark:border-primary-900 dark:bg-primary-950/20">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-center gap-4">
                                            <AIAvatar active={avatarMode !== 'idle'} thinking={avatarMode === 'thinking'} mode={avatarMode} />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">Mira is {avatarMode === 'speaking' ? 'asking the question' : avatarMode === 'listening' ? 'listening to your answer' : avatarMode === 'thinking' ? 'reviewing your response' : 'ready'}</p>
                                                <p className="mt-1 text-xs text-gray-500">Use the avatar controls for the interview question and spoken answer.</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button type="button" variant="outline" onClick={beginConversation} disabled={avatarMode === 'speaking' || avatarMode === 'listening'} className="gap-2">
                                                <Volume2 className="h-4 w-4" /> Start Conversation
                                            </Button>
                                            <Button type="button" variant={avatarMode === 'listening' ? 'destructive' : 'outline'} onClick={() => avatarMode === 'listening' ? stopConversation() : startVoiceAnswer(false)} className="gap-2">
                                                {avatarMode === 'listening' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                                {avatarMode === 'listening' ? 'Stop Answer' : 'Speak Answer'}
                                            </Button>
                                            {(avatarMode === 'speaking' || avatarMode === 'listening') && (
                                                <Button type="button" variant="ghost" onClick={stopConversation} className="gap-2">
                                                    <VolumeX className="h-4 w-4" /> Stop
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 dark:border-gray-800 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase text-primary-600">{selectedQuestion.type}</p>
                                        <div className="mt-2 flex items-start gap-2">
                                            <h2 className="min-w-0 text-2xl font-bold leading-tight text-gray-900 dark:text-white">{selectedQuestion.question}</h2>
                                            <SpeakerButton text={`${selectedQuestion.question}. ${selectedQuestion.whatGoodLooksLike}`} className="shrink-0" />
                                        </div>
                                        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">{selectedQuestion.whatGoodLooksLike}</p>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                        <Timer className="h-4 w-4" /> Practice Mode
                                    </div>
                                </div>

                                {listItems(session?.focusAreas ?? []).length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {session?.focusAreas.map((area) => (
                                            <span key={area} className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">{area}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <textarea
                                        value={answer}
                                        onChange={(event) => setAnswer(event.target.value)}
                                        rows={9}
                                        placeholder="Type your answer here. Keep it structured: situation, action, result, and tradeoffs when relevant."
                                        className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                        <VoiceInput onResult={(text) => setAnswer((current) => `${current} ${text}`.trim())} />
                                        {answer.trim() && <SpeakerButton text={answer} />}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button onClick={handleScore} isLoading={isScoring} className="gap-2">
                                        <Send className="h-4 w-4" /> Review Answer
                                    </Button>
                                    <Button variant="outline" onClick={handleNext} disabled={!session || currentIndex >= session.questions.length - 1}>
                                        Next Question
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
                                <AIAvatar active={false} thinking={false} large />
                                <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">No interview room yet</h2>
                                <p className="mt-2 max-w-md text-sm text-gray-500">Set a target role and prepare the interview room to begin a polished mock interview.</p>
                            </div>
                        )}
                    </div>

                    {feedback && (
                        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                        <ClipboardCheck className="h-5 w-5 text-primary-600" /> Interview Feedback
                                    </h3>
                                    <MarkdownText className="mt-1 text-sm text-gray-500">{feedback.verdict}</MarkdownText>
                                </div>
                                <SpeakerButton text={`${feedback.verdict}. ${feedback.betterAnswer}`} />
                                <span className="text-4xl font-bold text-primary-600">{feedback.score}<span className="text-base text-gray-400">/100</span></span>
                            </div>
                            <div className="mt-5 grid gap-5 lg:grid-cols-2">
                                <FeedbackBlock title="Strengths" items={feedback.strengths} />
                                <FeedbackBlock title="Improvements" items={feedback.improvements} />
                            </div>
                            <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/60">
                                <h4 className="text-xs font-bold uppercase text-gray-500">Stronger Answer</h4>
                                <MarkdownText className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">{feedback.betterAnswer}</MarkdownText>
                            </div>
                            {feedback.followUpQuestion && (
                                <div className="mt-4 rounded-lg border border-primary-100 bg-primary-50 p-4 dark:border-primary-900 dark:bg-primary-950/30">
                                    <h4 className="text-xs font-bold uppercase text-primary-700 dark:text-primary-300">Follow-up Question</h4>
                                    <MarkdownText className="mt-2 text-sm font-semibold text-primary-950 dark:text-primary-100">{feedback.followUpQuestion}</MarkdownText>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

const AIAvatar = ({ active, thinking, large = false, mode = 'idle' }: { active: boolean; thinking: boolean; large?: boolean; mode?: 'idle' | 'speaking' | 'listening' | 'thinking' }) => (
    <div className={`relative flex ${large ? 'h-24 w-24' : 'h-16 w-16'} shrink-0 items-center justify-center rounded-full border border-primary-200 bg-white shadow-sm transition-all dark:border-primary-900 dark:bg-gray-900 ${active ? 'ring-4 ring-primary-100 dark:ring-primary-900/40' : ''}`}>
        <div className={`${large ? 'h-16 w-16' : 'h-11 w-11'} flex items-center justify-center rounded-full bg-primary-600 text-white transition-transform ${mode === 'speaking' ? 'scale-105' : ''}`}>
            <Bot className={large ? 'h-8 w-8' : 'h-6 w-6'} />
        </div>
        {(active || thinking) && (
            <div className="absolute -bottom-1 flex items-end gap-0.5 rounded-full bg-white px-2 py-1 shadow-sm dark:bg-gray-800">
                {[0, 1, 2].map((item) => (
                    <span
                        key={item}
                        className={`block w-1 rounded-full ${mode === 'listening' ? 'bg-emerald-500' : 'bg-primary-500'} ${active || thinking ? 'animate-pulse' : ''}`}
                        style={{ height: `${8 + item * 4}px` }}
                    />
                ))}
            </div>
        )}
        {mode === 'listening' && (
            <span className="absolute -right-1 top-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
            </span>
        )}
    </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
        <label className="mb-1 block text-xs font-bold uppercase text-gray-500">{label}</label>
        {children}
    </div>
);

const FeedbackBlock = ({ title, items }: { title: string; items: string[] }) => (
    <div>
        <h4 className="text-xs font-bold uppercase text-gray-500">{title}</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-gray-700 dark:text-gray-300">
            {listItems(items).map((item) => (
                <li key={item}>
                    <ReactMarkdown>{item}</ReactMarkdown>
                </li>
            ))}
        </ul>
    </div>
);

const MarkdownText = ({ children, className }: { children: unknown; className?: string }) => (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className ?? ''}`}>
        <ReactMarkdown>{toText(children)}</ReactMarkdown>
    </div>
);
