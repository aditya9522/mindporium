import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testService } from '../../services/test.service';
import type { Test, Submission } from '../../types/test';
import { FileText, Clock, CheckCircle, Play, Award, XCircle } from 'lucide-react';
import { CardGridSkeleton } from '../../components/ui/CardGridSkeleton';
import { TableSkeleton } from '../../components/ui/TableSkeleton';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const StudentTestsPage = () => {
    const [loading, setLoading] = useState(true);
    const [availableTests, setAvailableTests] = useState<Test[]>([]);
    const [completedTests, setCompletedTests] = useState<Submission[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch both available tests and completed submissions
            const [tests, submissions] = await Promise.all([
                testService.getAvailableTests(),
                testService.getMySubmissions()
            ]);
            setAvailableTests(tests);
            setCompletedTests(submissions);
        } catch (error) {
            console.error('Failed to fetch tests:', error);
            toast.error('Failed to load tests');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 dark:from-white to-primary-600 dark:to-primary-400 tracking-tight mb-2">My Tests</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Your gateway to self-assessment and mastery</p>
                </div>
                <div className="space-y-8">
                    {/* Available Tests */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Available Tests</h2>
                        {loading ? (
                            <CardGridSkeleton count={3} />
                        ) : availableTests.length === 0 ? (
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
                                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tests available</h3>
                                <p className="text-gray-500 dark:text-gray-400">Check back later for new assessments from your instructors</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availableTests.map((test) => (
                                    <div key={test.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800 p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:bg-gray-850 transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{test.title}</h3>
                                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide rounded-full border border-emerald-200 dark:border-emerald-800">
                                                Active
                                            </span>
                                        </div>
                                        {test.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 leading-relaxed">{test.description}</p>
                                        )}

                                        <div className="space-y-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                <div className="p-1.5 bg-primary-50 dark:bg-primary-900/30 rounded-lg mr-3">
                                                    <FileText className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white mr-1">{test.questions?.length || 0}</span>
                                                <span className="text-gray-400 dark:text-gray-500">Questions</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg mr-3">
                                                    <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white mr-1">{test.duration_minutes}</span>
                                                <span className="text-gray-400 dark:text-gray-500">mins duration</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                <div className="p-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg mr-3">
                                                    <Award className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white mr-1">{test.total_marks}</span>
                                                <span className="text-gray-400 dark:text-gray-500">total marks (Pass: {test.passing_marks})</span>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/test/${test.id}/take`}
                                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-semibold shadow-lg shadow-primary-200 dark:shadow-primary-900/50 transform hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <Play className="w-4 h-4 fill-white" />
                                            Start Assessment
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Completed Tests */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Completed Tests</h2>
                        {loading ? (
                            <TableSkeleton columns={5} rows={5} />
                        ) : completedTests.length === 0 ? (
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center">
                                <CheckCircle className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No completed tests yet</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Your test results will appear here</p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                                        <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                                            <tr>
                                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                    Test ID
                                                </th>
                                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                    Score
                                                </th>
                                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                    Percentage
                                                </th>
                                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                    Submitted
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
                                            {completedTests.map((submission) => {
                                                const totalQuestions = Object.keys(submission.evaluation).length;
                                                const percentage = totalQuestions > 0
                                                    ? Math.round((submission.obtained_marks / totalQuestions) * 100)
                                                    : 0;
                                                const isPassed = percentage >= 50; // Assuming 50% is passing

                                                return (
                                                    <tr key={submission.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                                            Test #{submission.test_id}
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                            <span className="font-bold text-lg">{submission.obtained_marks}</span>
                                                            <span className="text-gray-400 dark:text-gray-500 text-xs font-medium"> / {totalQuestions}</span>
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap text-sm">
                                                            <div className="flex items-center">
                                                                <div className="w-24 bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mr-3 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${isPassed ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                                                                            }`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                </div>
                                                                <span className="font-bold text-gray-700 dark:text-gray-300">{percentage}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap">
                                                            {isPassed ? (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                                                                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                                                    Passed
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800">
                                                                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                                                    Failed
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            <div className="flex flex-col">
                                                                <span className="text-gray-900 dark:text-white font-medium">{format(new Date(submission.submitted_at), 'MMM d, yyyy')}</span>
                                                                <span className="text-gray-400 dark:text-gray-500 text-xs font-medium">
                                                                    {format(new Date(submission.submitted_at), 'h:mm a')}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
