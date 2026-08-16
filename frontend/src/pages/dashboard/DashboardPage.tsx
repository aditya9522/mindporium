import { useCallback, useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { studentService } from '../../services/student.service';
import { Activity, Award, BookOpen, Calendar, CheckCircle2, Clock, Flame, RefreshCw, Target, TrendingUp, Gift, Copy } from 'lucide-react';
import { referralService } from '../../services/referral.service';
import type { ReferralInfo } from '../../types/referral';
import toast from 'react-hot-toast';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { StatsCardSkeleton } from '../../components/ui/StatsCardSkeleton';
import { WidgetSkeleton } from '../../components/ui/WidgetSkeleton';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
const CARD_GRADIENTS = [
    'from-sky-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-fuchsia-500 to-violet-600',
];

export const DashboardPage = () => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<any>(null);

    const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await studentService.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
            setError('Failed to load your dashboard.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchReferrals = useCallback(async () => {
        try {
            const data = await referralService.getInfo();
            setReferralInfo(data);
        } catch (error) {
            console.error('Failed to fetch referrals:', error);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
        fetchReferrals();
    }, [fetchDashboard, fetchReferrals]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;
        setInviting(true);
        try {
            await referralService.invite(inviteEmail);
            toast.success(`Invitation sent to ${inviteEmail}`);
            setInviteEmail('');
            fetchReferrals();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to send invite');
        } finally {
            setInviting(false);
        }
    };

    const handleCopyLink = () => {
        if (referralInfo?.referral_link) {
            navigator.clipboard.writeText(referralInfo.referral_link);
            toast.success('Referral link copied to clipboard!');
        }
    };

    const overview = dashboardData?.overview ?? {};
    const activityData = dashboardData?.charts?.activity ?? [];
    const averageScore = Number(overview.average_test_score || 0);
    const attended = Number(overview.total_classes_attended || 0);
    const completedTests = Number(overview.total_tests_completed || 0);
    const enrolledCourses = Number(overview.total_courses || 0);
    const focusScore = Math.min(100, Math.round((averageScore * 0.5) + (completedTests * 8) + (attended * 2)));

    const focusBadge = useMemo(() => {
        if (focusScore <= 30) return { title: 'Cognitive Novice', color: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/30' };
        if (focusScore <= 60) return { title: 'Mind Explorer', color: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/30' };
        if (focusScore <= 85) return { title: 'Knowledge Architect', color: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/30' };
        return { title: 'Cognitive Master', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/30' };
    }, [focusScore]);

    const stats = [
        { icon: BookOpen, label: 'Enrolled Courses', value: enrolledCourses, note: 'Active learning paths' },
        { icon: Clock, label: 'Classes Attended', value: attended, note: 'Live and recorded sessions' },
        { icon: Award, label: 'Tests Completed', value: completedTests, note: 'Assessments finished' },
        { icon: TrendingUp, label: 'Avg. Score', value: `${averageScore}%`, note: 'Current performance' },
    ];

    const performanceData = dashboardData?.charts?.performance_distribution ? [
        { name: 'Excellent', value: dashboardData.charts.performance_distribution.excellent },
        { name: 'Good', value: dashboardData.charts.performance_distribution.good },
        { name: 'Average', value: dashboardData.charts.performance_distribution.average },
        { name: 'Needs Work', value: dashboardData.charts.performance_distribution.needs_improvement },
    ].filter((item) => item.value > 0) : [];

    const weeklyWave = useMemo<{ label: string; value: number }[]>(() => {
        const items = activityData.slice(-10).map((item: any, index: number) => ({
            label: item.date ? new Date(item.date).toLocaleDateString(undefined, { weekday: 'short' }) : `D${index + 1}`,
            value: item.count || 0,
        }));
        return items.length ? items : Array.from({ length: 8 }, (_, index) => ({ label: `D${index + 1}`, value: 0 }));
    }, [activityData]);

    return (
        <div className="space-y-6 sm:space-y-8 px-4 py-5 sm:py-6 transition-colors sm:px-6 lg:px-8">
            {error && !loading && (
                <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
                    <Activity className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-700" />
                    <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">{error}</h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please retry to refresh your learning progress.</p>
                    <button
                        onClick={fetchDashboard}
                        className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        aria-label="Refresh dashboard"
                        title="Refresh dashboard"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                </section>
            )}

            <section className="overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-100 bg-white shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
                    <div className="p-5 sm:p-8">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-primary-700 dark:bg-primary-950 dark:text-primary-300">Student Dashboard</span>
                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${focusBadge.color}`}>{focusBadge.title} Rank</span>
                        </div>
                        <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-gray-950 dark:text-white">
                            Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                            A real-time view of your courses, attendance, assessments, activity rhythm, and career next steps.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link to="/my-learning" className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700">Continue Learning</Link>
                            <Link to="/career/job-search" className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Career Workspace</Link>
                            <button
                                onClick={fetchDashboard}
                                disabled={loading}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                aria-label="Refresh dashboard"
                                title="Refresh dashboard"
                            >
                                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 bg-gray-50 p-5 sm:p-8 dark:border-gray-800 dark:bg-gray-950/50 lg:border-l lg:border-t-0">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Learning Focus Score</p>
                        <div className="relative mt-4 h-44">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ name: 'Focus', value: focusScore, fill: 'var(--primary-600)' }]} startAngle={90} endAngle={-270}>
                                    <RadialBar dataKey="value" cornerRadius={12} background />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl font-black text-gray-950 dark:text-white">{focusScore}%</span>
                            </div>
                        </div>
                        <p className="text-center text-xs text-gray-500">Blends attendance, test activity, and score trend.</p>
                    </div>
                </div>
            </section>

            {loading ? (
                <StatsCardSkeleton count={4} />
            ) : (
                <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="group overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:border-gray-800 dark:bg-gray-900">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="mb-2 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{stat.label}</p>
                                        <p className="text-3xl font-black text-gray-950 dark:text-white">{stat.value}</p>
                                    </div>
                                    <div className={`rounded-2xl bg-linear-to-br ${CARD_GRADIENTS[index]} p-4 shadow-lg transition-transform group-hover:scale-110`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <p className="mt-4 text-xs font-semibold text-gray-500">{stat.note}</p>
                                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                    <div className={`h-full rounded-full bg-linear-to-r ${CARD_GRADIENTS[index]}`} style={{ width: `${Math.min(100, 35 + index * 14 + Number(String(stat.value).replace('%', '')) / 3)}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </section>
            )}

            {loading ? (
                <WidgetSkeleton count={2} />
            ) : (
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
                        <h2 className="mb-6 flex items-center gap-2 text-lg font-black text-gray-900 dark:text-gray-100">
                            <span className="rounded-xl bg-primary-50 p-2 text-primary-600 dark:bg-primary-950 dark:text-primary-300"><TrendingUp className="h-5 w-5" /></span>
                            Learning Activity
                        </h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData}>
                                    <defs>
                                        <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary-600)" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="var(--primary-600)" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} style={{ fontSize: '12px' }} />
                                    <YAxis style={{ fontSize: '12px' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgb(0 0 0 / 0.12)' }} labelFormatter={(val) => new Date(val).toLocaleDateString()} />
                                    <Area type="monotone" dataKey="count" stroke="var(--primary-600)" strokeWidth={3} fill="url(#activityGradient)" dot={{ r: 3, fill: 'var(--primary-600)' }} activeDot={{ r: 6 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-6 flex items-center gap-2 text-lg font-black text-gray-900 dark:text-gray-100">
                            <span className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"><Award className="h-5 w-5" /></span>
                            Score Donut
                        </h2>
                        <div className="relative h-80">
                            {performanceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={performanceData} cx="50%" cy="50%" innerRadius={64} outerRadius={90} paddingAngle={5} dataKey="value">
                                            {performanceData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgb(0 0 0 / 0.12)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState icon={<Award className="h-12 w-12" />} label="No test data yet" fill />
                            )}
                        </div>
                    </div>
                </section>
            )}

            {!loading && (
                <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-5 flex items-center gap-2 text-lg font-black text-gray-900 dark:text-gray-100">
                            <span className="rounded-xl bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"><Flame className="h-5 w-5" /></span>
                            Study Wave
                        </h2>
                        <div className="flex h-36 items-end gap-2">
                            {weeklyWave.map((item: { label: string; value: number }, index: number) => {
                                const max = Math.max(...weeklyWave.map((wave: { label: string; value: number }) => wave.value), 1);
                                const height = 18 + ((item.value || 0) / max) * 100;
                                return (
                                    <div key={`${item.label}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                                        <div className="flex w-full items-end overflow-hidden rounded-t-xl bg-gray-100 dark:bg-gray-800" style={{ height: 120 }}>
                                            <div className="w-full rounded-t-xl bg-linear-to-t from-rose-500 to-amber-400 transition-all" style={{ height }} />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-5 flex items-center gap-2 text-lg font-black text-gray-900 dark:text-gray-100">
                            <span className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"><Target className="h-5 w-5" /></span>
                            Today’s Learning Plan
                        </h2>
                        <div className="grid gap-3 md:grid-cols-3">
                            {[
                                ['Course', enrolledCourses > 0 ? 'Continue an active course module' : 'Pick your first course'],
                                ['Practice', completedTests > 0 ? 'Review your latest test result' : 'Attempt one short assessment'],
                                ['Career', 'Open Career Workspace and update your target role'],
                            ].map(([title, note]) => (
                                <div key={title} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/50">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    <p className="mt-3 font-bold text-gray-950 dark:text-white">{title}</p>
                                    <p className="mt-1 text-sm leading-5 text-gray-500">{note}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {loading ? (
                <WidgetSkeleton count={2} />
            ) : (
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <DashboardPanel title="Recent Activity" icon={<Calendar className="h-5 w-5" />}>
                        <div className="space-y-4">
                            {dashboardData?.recent_activity?.length > 0 ? (
                                dashboardData.recent_activity.map((activity: any, index: number) => (
                                    <div key={index} className="flex gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-950/50">
                                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-600" />
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-gray-100">{activity.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(activity.timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState icon={<Activity className="h-12 w-12" />} label="No recent activity" />
                            )}
                        </div>
                    </DashboardPanel>

                    <DashboardPanel title="My Courses" icon={<BookOpen className="h-5 w-5" />}>
                        <div className="space-y-4">
                            {dashboardData?.enrolled_courses?.length > 0 ? (
                                dashboardData.enrolled_courses.map((course: any) => (
                                    <Link key={course.course_id} to={`/courses/${course.course_id}`} className="block rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:bg-white hover:shadow-sm dark:border-gray-800 dark:bg-gray-950/50 dark:hover:bg-gray-800">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <span className="font-bold text-gray-900 dark:text-gray-100">{course.title}</span>
                                            <span className="text-sm font-black text-primary-600 dark:text-primary-400">{course.progress_percent}%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div className="h-full rounded-full bg-linear-to-r from-primary-500 to-emerald-500 transition-all" style={{ width: `${Math.min(course.progress_percent || 0, 100)}%` }} />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center">
                                    <p className="mb-4 text-gray-500 dark:text-gray-400">You have not enrolled in any courses yet.</p>
                                    <Link to="/courses" className="font-bold text-primary-600 dark:text-primary-400">Browse Courses</Link>
                                </div>
                            )}
                        </div>
                    </DashboardPanel>
                </section>
            )}

            {!loading && (
                <section className="mt-6">
                    <DashboardPanel title="Invite Friends, Earn Rewards" icon={<Gift className="h-5 w-5" />}>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950/50">
                                <h3 className="mb-2 font-bold text-gray-900 dark:text-gray-100">Share your invite link</h3>
                                <p className="mb-4 text-sm text-gray-500">When friends sign up and enroll using your link, you both get a discount coupon!</p>
                                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                                    <input
                                        type="text"
                                        readOnly
                                        value={referralInfo?.referral_link || 'Loading...'}
                                        className="flex-1 bg-transparent px-2 text-sm text-gray-600 outline-none dark:text-gray-300"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className="rounded-lg bg-primary-50 p-2 text-primary-600 transition hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-400 dark:hover:bg-primary-900"
                                        title="Copy Link"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                                <form onSubmit={handleInvite} className="mt-4 flex items-center gap-2">
                                    <input
                                        type="email"
                                        placeholder="Friend's email address"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={inviting}
                                        className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {inviting ? 'Sending...' : 'Invite'}
                                    </button>
                                </form>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950/50">
                                <h3 className="mb-4 font-bold text-gray-900 dark:text-gray-100">Your Referrals</h3>
                                <div className="space-y-3">
                                    {(referralInfo?.referrals?.length ?? 0) > 0 ? (
                                        (referralInfo?.referrals ?? []).map((ref, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{ref.email}</p>
                                                    <p className="text-xs text-gray-500">{new Date(ref.date).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`rounded-full px-2 py-1 text-xs font-bold uppercase ${ref.status === 'registered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                        : ref.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                                                    }`}>
                                                    {ref.status}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">No referrals yet. Start inviting friends!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DashboardPanel>
                </section>
            )}
        </div>
    );
};

const DashboardPanel = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-black text-gray-900 dark:text-gray-100">
            <span className="rounded-xl bg-primary-50 p-2 text-primary-600 dark:bg-primary-950 dark:text-primary-300">{icon}</span>
            {title}
        </h2>
        {children}
    </div>
);

const EmptyState = ({ icon, label, fill = false }: { icon: React.ReactNode; label: string; fill?: boolean }) => (
    <div className={`${fill ? 'absolute inset-0' : 'py-10'} flex flex-col items-center justify-center text-gray-400 dark:text-gray-600`}>
        <div className="mb-2 opacity-30">{icon}</div>
        <p>{label}</p>
    </div>
);
