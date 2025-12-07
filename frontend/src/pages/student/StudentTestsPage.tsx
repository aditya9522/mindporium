import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testService } from '../../services/test.service';
import type { Test, Submission } from '../../types/test';
import { FileText, Clock, CheckCircle, Loader2, Play, Award, XCircle } from 'lucide-react';
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Tests</h1>
                    <p className="mt-2 text-gray-600">View and take available tests</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Available Tests */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Tests</h2>
                            {availableTests.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tests available</h3>
                                    <p className="text-gray-500">Check back later for new assessments from your instructors</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {availableTests.map((test) => (
                                        <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-lg font-bold text-gray-900">{test.title}</h3>
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                    Active
                                                </span>
                                            </div>
                                            {test.description && (
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{test.description}</p>
                                            )}

                                            <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                                                    <span className="font-medium">{test.questions?.length || 0}</span>
                                                    <span className="ml-1">Questions</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Clock className="w-4 h-4 mr-2 text-amber-500" />
                                                    <span className="font-medium">{test.duration_minutes}</span>
                                                    <span className="ml-1">minutes</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Award className="w-4 h-4 mr-2 text-purple-500" />
                                                    <span className="font-medium">{test.total_marks}</span>
                                                    <span className="ml-1">marks (Pass: {test.passing_marks})</span>
                                                </div>
                                            </div>

                                            <Link
                                                to={`/test/${test.id}/take`}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow"
                                            >
                                                <Play className="w-4 h-4" />
                                                Start Test
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Completed Tests */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Completed Tests</h2>
                            {completedTests.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No completed tests yet</p>
                                    <p className="text-sm text-gray-400 mt-1">Your test results will appear here</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Test ID
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Score
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Percentage
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Submitted
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {completedTests.map((submission) => {
                                                    const totalQuestions = Object.keys(submission.evaluation).length;
                                                    const percentage = totalQuestions > 0
                                                        ? Math.round((submission.obtained_marks / totalQuestions) * 100)
                                                        : 0;
                                                    const isPassed = percentage >= 50; // Assuming 50% is passing

                                                    return (
                                                        <tr key={submission.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                Test #{submission.test_id}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                <span className="font-semibold">{submission.obtained_marks}</span>
                                                                <span className="text-gray-500"> / {totalQuestions}</span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <div className="flex items-center">
                                                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                                        <div
                                                                            className={`h-2 rounded-full ${isPassed ? 'bg-green-500' : 'bg-red-500'
                                                                                }`}
                                                                            style={{ width: `${percentage}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="font-medium">{percentage}%</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {isPassed ? (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                                        Passed
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                        <XCircle className="w-3 h-3 mr-1" />
                                                                        Failed
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {format(new Date(submission.submitted_at), 'MMM d, yyyy')}
                                                                <br />
                                                                <span className="text-xs text-gray-400">
                                                                    {format(new Date(submission.submitted_at), 'h:mm a')}
                                                                </span>
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
                )}
            </div>
        </div>
    );
};
