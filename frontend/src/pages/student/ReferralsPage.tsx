import { useCallback, useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Award, CheckCircle2, Clipboard, Copy, Gift, MailPlus, RefreshCw, Send, Sparkles, Ticket, UserPlus, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { referralService } from '../../services/referral.service';
import type { ReferralInfo, ReferralRecord } from '../../types/referral';

const statusStyles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40',
    registered: 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900/40',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40',
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (error as { response?: { data?: { detail?: string } } }).response;
        return response?.data?.detail || fallback;
    }
    return fallback;
};

export const ReferralsPage = () => {
    const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadReferrals = useCallback(async (quiet = false) => {
        if (quiet) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const data = await referralService.getInfo();
            setReferralInfo(data);
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, 'Failed to load referrals'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadReferrals();
    }, [loadReferrals]);

    const stats = useMemo(() => {
        const referrals = referralInfo?.referrals ?? [];
        return {
            total: referrals.length,
            pending: referrals.filter((item) => item.status === 'pending').length,
            registered: referrals.filter((item) => item.status === 'registered').length,
            completed: referrals.filter((item) => item.status === 'completed').length,
        };
    }, [referralInfo]);

    const handleCopy = async (value: string, label: string) => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copied`);
        } catch {
            toast.error('Clipboard access is unavailable');
        }
    };

    const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const email = inviteEmail.trim();
        if (!email) return;

        setInviting(true);
        try {
            await referralService.invite(email);
            toast.success(`Invitation queued for ${email}`);
            setInviteEmail('');
            await loadReferrals(true);
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, 'Failed to send invite'));
        } finally {
            setInviting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 text-gray-950 transition-colors dark:bg-gray-950 dark:text-gray-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                    <div className="grid gap-0 lg:grid-cols-[1fr_380px]">
                        <div className="p-6 sm:p-8">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                                    <Gift className="h-3.5 w-3.5" />
                                    Referral Rewards
                                </span>
                                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                                    Coupon enabled
                                </span>
                            </div>
                            <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl">Invite friends to Mindporium</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                                Share your personal referral code or send an email invite. The backend tracks pending, registered, and completed referral states for your reward flow.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Button asChild>
                                    <Link to="/courses">
                                        <Ticket className="mr-2 h-4 w-4" />
                                        Browse Courses
                                    </Link>
                                </Button>
                                <Button variant="outline" onClick={() => loadReferrals(true)} isLoading={refreshing}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-950/50 sm:p-8 lg:border-l lg:border-t-0">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Referral Code</p>
                            <div className="mt-4 rounded-2xl border border-dashed border-primary-200 bg-white p-5 dark:border-primary-900/60 dark:bg-gray-900">
                                <div className="flex items-center justify-between gap-3">
                                    <code className="break-all text-2xl font-black tracking-wide text-primary-700 dark:text-primary-300">
                                        {loading ? 'Loading...' : referralInfo?.referral_code}
                                    </code>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        title="Copy code"
                                        aria-label="Copy referral code"
                                        onClick={() => handleCopy(referralInfo?.referral_code ?? '', 'Referral code')}
                                    >
                                        <Clipboard className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-4">
                    <MetricCard icon={<Users className="h-5 w-5" />} label="Total Invites" value={stats.total} tone="primary" />
                    <MetricCard icon={<MailPlus className="h-5 w-5" />} label="Pending" value={stats.pending} tone="amber" />
                    <MetricCard icon={<UserPlus className="h-5 w-5" />} label="Registered" value={stats.registered} tone="sky" />
                    <MetricCard icon={<Award className="h-5 w-5" />} label="Completed" value={stats.completed} tone="emerald" />
                </section>

                <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="flex items-center gap-2 text-lg font-black text-gray-900 dark:text-gray-100">
                            <span className="rounded-xl bg-primary-50 p-2 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
                                <Copy className="h-5 w-5" />
                            </span>
                            Share Link
                        </h2>
                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <Input
                                readOnly
                                value={loading ? 'Loading...' : referralInfo?.referral_link ?? ''}
                                className="h-12 rounded-xl bg-gray-50 font-medium dark:bg-gray-950/50"
                            />
                            <Button
                                type="button"
                                className="h-12 shrink-0"
                                disabled={!referralInfo?.referral_link}
                                onClick={() => handleCopy(referralInfo?.referral_link ?? '', 'Referral link')}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Link
                            </Button>
                        </div>

                        <form onSubmit={handleInvite} className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/50">
                            <label className="text-xs font-black uppercase tracking-wide text-gray-500 dark:text-gray-400">Invite by Email</label>
                            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                                <Input
                                    type="email"
                                    required
                                    value={inviteEmail}
                                    onChange={(event) => setInviteEmail(event.target.value)}
                                    placeholder="friend@example.com"
                                    className="h-12 rounded-xl bg-white dark:bg-gray-900"
                                />
                                <Button type="submit" className="h-12 shrink-0" isLoading={inviting}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Invite
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="flex items-center gap-2 text-lg font-black text-gray-900 dark:text-gray-100">
                            <span className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <Sparkles className="h-5 w-5" />
                            </span>
                            Reward Path
                        </h2>
                        <div className="mt-5 space-y-3">
                            {[
                                ['Invite sent', 'A pending referral is created for your friend.'],
                                ['Friend registers', 'The referral moves to registered after signup with your code.'],
                                ['Enrollment completed', 'Completed referrals become eligible for coupon rewards.'],
                            ].map(([title, note], index) => (
                                <div key={title} className="flex gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-950/50">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-black text-white">{index + 1}</span>
                                    <div>
                                        <p className="font-bold text-gray-950 dark:text-white">{title}</p>
                                        <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">{note}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="flex items-center gap-2 text-lg font-black text-gray-900 dark:text-gray-100">
                        <span className="rounded-xl bg-sky-50 p-2 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300">
                            <Users className="h-5 w-5" />
                        </span>
                        Referral History
                    </h2>

                    <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
                        {loading ? (
                            <div className="space-y-3 p-4">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                                ))}
                            </div>
                        ) : referralInfo?.referrals.length ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {referralInfo.referrals.map((referral, index) => (
                                    <ReferralRow key={`${referral.email}-${referral.date}-${index}`} referral={referral} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                                <Gift className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                                <h3 className="mt-3 font-black text-gray-950 dark:text-white">No referrals yet</h3>
                                <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">Send your first invite above or copy your link into your own message.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

const MetricCard = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: 'primary' | 'amber' | 'sky' | 'emerald' }) => {
    const tones = {
        primary: 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300',
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
        emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    };

    return (
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-black uppercase tracking-wide text-gray-400">{label}</p>
                    <p className="mt-2 text-3xl font-black text-gray-950 dark:text-white">{value}</p>
                </div>
                <span className={`rounded-2xl p-3 ${tones[tone]}`}>{icon}</span>
            </div>
        </div>
    );
};

const ReferralRow = ({ referral }: { referral: ReferralRecord }) => {
    const statusClass = statusStyles[referral.status] ?? 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';

    return (
        <div className="flex flex-col gap-3 bg-white p-4 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
                    <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                    <p className="font-bold text-gray-950 dark:text-white">{referral.email || 'Pending signup'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{referral.date ? new Date(referral.date).toLocaleDateString() : 'Recently'}</p>
                </div>
            </div>
            <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${statusClass}`}>
                {referral.status}
            </span>
        </div>
    );
};
