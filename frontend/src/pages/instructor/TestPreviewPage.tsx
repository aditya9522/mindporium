import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService } from '../../services/test.service';
import type { Test } from '../../types/test';
import { Clock, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/common/PageLoader';

export const TestPreviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [test, setTest] = useState<Test | null>(null);

    useEffect(() => {
        if (id) {
            fetchTest(parseInt(id));
        }
    }, [id]);

    const fetchTest = async (testId: number) => {
        try {
            const data = await testService.getTest(testId);
            setTest(data);
        } catch (error) {
            console.error('Failed to fetch test:', error);
            toast.error('Failed to load test preview');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    if (!test) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Tests
                    </button>
                    <span className="flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium border border-primary-200 dark:border-primary-800">
                        <Eye className="w-3 h-3" /> Preview Mode
                    </span>
                </div>

                {/* Banner */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8 flex justify-between items-center transition-colors duration-300">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{test.title}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Marks: {test.total_marks}</p>
                    </div>
                    <div className="flex items-center gap-2 text-lg font-mono font-medium text-gray-600 dark:text-gray-400">
                        <Clock className="w-5 h-5" />
                        {test.duration_minutes} minutes
                    </div>
                </div>

                <div className="space-y-6 opacity-90 pointer-events-none">
                    {test.questions.map((question, index) => (
                        <div key={question.id || index} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
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
                                <div className="space-y-3 mt-4">
                                    {question.options.map((option, optIndex) => (
                                        <div
                                            key={optIndex}
                                            className={`flex items-center p-4 border rounded-lg 
                                                ${option === question.correct_answer 
                                                    ? 'border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-900/20' 
                                                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'}`}
                                        >
                                            <input
                                                type="radio"
                                                disabled
                                                checked={option === question.correct_answer}
                                                className={`w-4 h-4 ${option === question.correct_answer ? 'text-green-600 dark:text-green-500' : 'text-gray-300 dark:text-gray-600'}`}
                                            />
                                            <span className={`ml-3 ${option === question.correct_answer ? 'text-green-700 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-500'}`}>
                                                {option}
                                                {option === question.correct_answer && <span className="ml-2 text-xs">(Correct Answer)</span>}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-4">
                                    <div className="w-full p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg min-h-[100px] bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 flex items-center justify-center">
                                        Student will type their descriptive answer here
                                    </div>
                                    {question.correct_answer && (
                                        <div className="mt-4 p-4 border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                            <h4 className="text-xs font-semibold text-green-800 dark:text-green-400 uppercase tracking-wider mb-2">Expected Answer Key</h4>
                                            <p className="text-sm text-green-700 dark:text-green-300">{question.correct_answer}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    <div className="py-6 flex justify-center">
                        <Button disabled size="lg" className="opacity-50">
                            Submit Test (Disabled in Preview)
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
