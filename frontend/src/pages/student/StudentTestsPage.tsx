import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testService } from '../../services/test.service';
import type { Test, Submission } from '../../types/test';
import { FileText, Clock, CheckCircle, Play, Award, XCircle } from 'lucide-react';
import { PageLoader } from '../../components/common/PageLoader';
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

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-indigo-600 tracking-tight mb-2">My Tests</h1>
                    <p className="text-lg text-gray-500 font-medium">Your gateway to self-assessment and mastery</p>
                </div>
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
                                    <div key={test.id} className="bg-white rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{test.title}</h3>
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide rounded-full border border-emerald-200">
                                                Active
                                            </span>
                                        </div>
                                        {test.description && (
                                            <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">{test.description}</p>
                                        )}

                                        <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                                            <div className="flex items-center text-sm text-gray-600 font-medium">
                                                <div className="p-1.5 bg-indigo-50 rounded-lg mr-3">
                                                    <FileText className="w-4 h-4 text-indigo-500" />
                                                </div>
                                                <span className="font-bold text-gray-900 mr-1">{test.questions?.length || 0}</span>
                                                <span className="text-gray-400">Questions</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 font-medium">
                                                <div className="p-1.5 bg-amber-50 rounded-lg mr-3">
                                                    <Clock className="w-4 h-4 text-amber-500" />
                                                </div>
                                                <span className="font-bold text-gray-900 mr-1">{test.duration_minutes}</span>
                                                <span className="text-gray-400">mins duration</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 font-medium">
                                                <div className="p-1.5 bg-purple-50 rounded-lg mr-3">
                                                    <Award className="w-4 h-4 text-purple-500" />
                                                </div>
                                                <span className="font-bold text-gray-900 mr-1">{test.total_marks}</span>
                                                <span className="text-gray-400">total marks (Pass: {test.passing_marks})</span>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/test/${test.id}/take`}
                                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200 transform hover:scale-[1.02] active:scale-[0.98]"
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
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Completed Tests</h2>
                        {completedTests.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No completed tests yet</p>
                                <p className="text-sm text-gray-400 mt-1">Your test results will appear here</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-100">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    Test ID
                                                </th>
                                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    Score
                                                </th>
                                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    Percentage
                                                </th>
                                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    Submitted
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-50">
                                            {completedTests.map((submission) => {
                                                const totalQuestions = Object.keys(submission.evaluation).length;
                                                const percentage = totalQuestions > 0
                                                    ? Math.round((submission.obtained_marks / totalQuestions) * 100)
                                                    : 0;
                                                const isPassed = percentage >= 50; // Assuming 50% is passing

                                                return (
                                                    <tr key={submission.id} className="group hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                            Test #{submission.test_id}
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900">
                                                            <span className="font-bold text-lg">{submission.obtained_marks}</span>
                                                            <span className="text-gray-400 text-xs font-medium"> / {totalQuestions}</span>
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap text-sm">
                                                            <div className="flex items-center">
                                                                <div className="w-24 bg-gray-100 rounded-full h-2.5 mr-3 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${isPassed ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                                                                            }`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                </div>
                                                                <span className="font-bold text-gray-700">{percentage}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap">
                                                            {isPassed ? (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                                                    Passed
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                                                                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                                                    Failed
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                                                            <div className="flex flex-col">
                                                                <span className="text-gray-900 font-medium">{format(new Date(submission.submitted_at), 'MMM d, yyyy')}</span>
                                                                <span className="text-gray-400 text-xs font-medium">
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
