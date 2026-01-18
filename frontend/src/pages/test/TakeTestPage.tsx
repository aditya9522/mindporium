import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService } from '../../services/test.service';
import type { Test } from '../../types/test';
import { Loader2, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/common/PageLoader';

export const TakeTestPage = () => {
    // ... (state and effects)
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [test, setTest] = useState<Test | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            fetchTest(parseInt(id));
        }
    }, [id]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto-submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const fetchTest = async (testId: number) => {
        try {
            const data = await testService.getTest(testId);
            setTest(data);
            setTimeLeft(data.duration_minutes * 60);
        } catch (error) {
            console.error('Failed to fetch test:', error);
            toast.error('Failed to load test');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId: number, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId.toString()]: value
        }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!id || submitting) return;

        setSubmitting(true);
        try {
            const result = await testService.submitTest({
                test_id: parseInt(id),
                answers
            });
            toast.success(`Test submitted! Score: ${result.obtained_marks}/${test?.total_marks}`);
            navigate('/dashboard'); // Or results page
        } catch (error) {
            toast.error('Failed to submit test');
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <PageLoader />;
    }

    if (!test) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header with Timer */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8 sticky top-4 z-10 flex justify-between items-center transition-colors duration-300">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{test.title}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Marks: {test.total_marks}</p>
                    </div>
                    <div className={`flex items-center gap-2 text-xl font-mono font-bold ${(timeLeft || 0) < 300 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-indigo-600 dark:text-indigo-400'
                        }`}>
                        <Clock className="w-6 h-6" />
                        {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {test.questions.map((question, index) => (
                        <div key={question.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                            <div className="flex justify-between mb-4">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-lg">
                                    <span className="text-gray-400 dark:text-gray-500 mr-2">{index + 1}.</span>
                                    {question.question_text}
                                </h3>
                                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {question.marks} marks
                                </span>
                            </div>

                            {question.question_type === 'mcq' && question.options ? (
                                <div className="space-y-3">
                                    {question.options.map((option, optIndex) => (
                                        <label
                                            key={optIndex}
                                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${answers[question.id!.toString()] === option
                                                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600 dark:ring-indigo-500'
                                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                value={option}
                                                checked={answers[question.id!.toString()] === option}
                                                onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                                                className="w-4 h-4 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-800"
                                            />
                                            <span className="ml-3 text-gray-700 dark:text-gray-300">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent min-h-[100px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="Type your answer here..."
                                    value={answers[question.id!.toString()] || ''}
                                    onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                                />
                            )}
                        </div>
                    ))}

                    <div className="flex justify-end pt-6">
                        <Button type="submit" size="lg" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Submit Test
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
