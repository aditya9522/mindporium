import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService } from '../../services/test.service';
import type { Submission, Test } from '../../types/test';
import { CheckCircle, XCircle, ArrowLeft, Search, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../lib/utils';
import { PageLoader } from '../../components/common/PageLoader';
import { formatNumber, formatPercent } from '../../lib/format';

export const TestSubmissionsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [test, setTest] = useState<Test | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');

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
        return <PageLoader />;
    }

    if (!test) return null;

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredSubmissions = submissions.filter((submission) => {
        const studentName = submission.user?.full_name || `User ${submission.user_id}`;
        const studentEmail = submission.user?.email || '';
        const isPassed = submission.obtained_marks >= test.passing_marks;
        const matchesSearch =
            studentName.toLowerCase().includes(normalizedQuery) ||
            studentEmail.toLowerCase().includes(normalizedQuery) ||
            String(submission.user_id).includes(normalizedQuery);
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'passed' && isPassed) ||
            (statusFilter === 'failed' && !isPassed);
        return matchesSearch && matchesStatus;
    });
    const passedCount = submissions.filter(submission => submission.obtained_marks >= test.passing_marks).length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6 pl-0 hover:pl-2 transition-all text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-transparent dark:hover:bg-transparent"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8 transition-colors duration-300">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{test.title} - Submissions</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Total Submissions: {submissions.length} | Passing Marks: {formatNumber(test.passing_marks)}
                    </p>
                </div>

                <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search student name, email, or ID..."
                                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-primary-900/40"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto">
                            <Filter className="h-4 w-4 shrink-0 text-gray-400" />
                            {([
                                ['all', `All (${submissions.length})`],
                                ['passed', `Passed (${passedCount})`],
                                ['failed', `Failed (${submissions.length - passedCount})`],
                            ] as const).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setStatusFilter(value)}
                                    className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition ${statusFilter === value
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Submitted At
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Score
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Percent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredSubmissions.map((submission) => {
                                    const percentage = test.total_marks > 0 ? (submission.obtained_marks / test.total_marks) * 100 : 0;
                                    const isPassed = submission.obtained_marks >= test.passing_marks;
                                    return (
                                    <tr key={submission.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    {submission.user?.photo ? (
                                                        <img className="h-10 w-10 rounded-full object-cover" src={getImageUrl(submission.user.photo)} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                            {submission.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">{submission.user?.full_name || `User ${submission.user_id}`}</div>
                                                    <div className="text-gray-500 dark:text-gray-400">{submission.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {format(new Date(submission.submitted_at), 'PP p')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {formatNumber(submission.obtained_marks)} / {formatNumber(test.total_marks)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                            {formatPercent(percentage)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isPassed ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Passed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                    Failed
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )})}
                                {filteredSubmissions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            {submissions.length === 0 ? 'No submissions yet.' : 'No submissions match your filters.'}
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
