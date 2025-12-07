import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService } from '../../services/test.service';
import type { Submission, Test } from '../../types/test';
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const TestSubmissionsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [test, setTest] = useState<Test | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    useEffect(() => {
        if (id) {
            fetchData(parseInt(id));
        }
    }, [id]);

    const fetchData = async (testId: number) => {
        try {
            const [testData, submissionsData] = await Promise.all([
                testService.getTest(testId),
                testService.getTestSubmissions(testId)
            ]);
            setTest(testData);
            setSubmissions(submissionsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load submissions');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!test) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6 pl-0 hover:pl-2 transition-all"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.title} - Submissions</h1>
                    <p className="text-gray-600">
                        Total Submissions: {submissions.length} | Passing Marks: {test.passing_marks}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Submitted At
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Score
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {submissions.map((submission) => (
                                    <tr key={submission.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    {submission.user?.photo ? (
                                                        <img className="h-10 w-10 rounded-full object-cover" src={submission.user.photo} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                            {submission.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">{submission.user?.full_name || `User ${submission.user_id}`}</div>
                                                    <div className="text-gray-500">{submission.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(submission.submitted_at), 'PP p')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {submission.obtained_marks} / {test.total_marks}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {submission.obtained_marks >= test.passing_marks ? (
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
                                    </tr>
                                ))}
                                {submissions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            No submissions yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
