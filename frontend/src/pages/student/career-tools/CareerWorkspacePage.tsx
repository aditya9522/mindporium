import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    Bot,
    BriefcaseBusiness,
    ExternalLink,
    FileText,
    Globe2,
    Search,
    Send,
    Target,
    Trash2,
    Eye,
    EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { ResumeBuilderPage } from '../resume-builder/ResumeBuilderPage';
import { AIInterviewSimulatorPage } from './AIInterviewSimulatorPage';
import { PortfolioBuilderPage } from './PortfolioBuilderPage';
import { careerToolsService, type JobSearchExperience, type JobSearchResult } from '../../../services/career-tools.service';

const CAREER_PROFILE_KEY = 'mindporium_career_profile';
const JOB_APPLICATIONS_KEY = 'mindporium_job_applications';

type CareerTab = 'resume-builder' | 'job-search' | 'interview-simulator' | 'portfolio-builder' | 'job-tracker';

interface CareerProfile {
    targetRole: string;
    targetIndustry: string;
    experienceLevel: string;
    weeklyHours: string;
    strengths: string;
    gaps: string;
    updatedAt?: string;
}

interface JobApplication {
    id: string;
    company: string;
    role: string;
    status: string;
    source: string;
    nextStep: string;
    updatedAt?: string;
}

const defaultProfile: CareerProfile = {
    targetRole: '',
    targetIndustry: '',
    experienceLevel: 'Entry',
    weeklyHours: '6',
    strengths: '',
    gaps: '',
};

const tabs: { id: CareerTab; label: string; description: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'resume-builder', label: 'Resume Studio', description: 'ATS resume and job tailoring', icon: FileText },
    { id: 'job-search', label: 'Job Search', description: 'Find current openings from the web', icon: Search },
    { id: 'job-tracker', label: 'Application Tracker', description: 'Track your job applications', icon: BriefcaseBusiness },
    { id: 'interview-simulator', label: 'AI Interview', description: 'Voice mock interview and feedback', icon: Bot, badge: 'AI' },
    { id: 'portfolio-builder', label: 'Portfolio Studio', description: 'Public project portfolio', icon: Globe2, badge: 'AI' },
];

const experienceOptions: { value: JobSearchExperience; label: string }[] = [
    { value: 'any', label: 'Any experience' },
    { value: 'internship', label: 'Internship' },
    { value: 'entry-level', label: 'Entry level' },
    { value: 'mid-level', label: 'Mid level' },
    { value: 'senior-level', label: 'Senior level' },
    { value: 'leadership', label: 'Leadership' },
];

const normalizeExperience = (value: string): JobSearchExperience => {
    const normalized = value.toLowerCase().replace(/\s+/g, '-');
    return experienceOptions.some((item) => item.value === normalized) ? normalized as JobSearchExperience : 'any';
};

const loadJson = <T,>(key: string, fallback: T): T => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch {
        return fallback;
    }
};

export const CareerWorkspacePage = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const activeTab = (tab ?? 'job-search') as CareerTab;
    const [compactNav, setCompactNav] = useState<boolean>(() => {
        try {
            return JSON.parse(localStorage.getItem('mindporium_career_sidebar_compact') ?? 'false');
        } catch {
            return false;
        }
    });

    useEffect(() => {
        localStorage.setItem('mindporium_career_sidebar_compact', JSON.stringify(compactNav));
    }, [compactNav]);

    if (!tabs.some((item) => item.id === activeTab)) {
        return <Navigate to="/career/job-search" replace />;
    }

    const title = tabs.find((item) => item.id === activeTab)?.label ?? 'Career Workspace';

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 transition-colors sm:px-6 lg:px-8">
            <section className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="p-6">
                        <div className="flex items-center gap-2">
                            <BriefcaseBusiness className="h-5 w-5 text-primary-600" />
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">New</span>
                        </div>
                        <h1 className="mt-3 text-2xl font-bold text-gray-950 dark:text-white">Career Workspace</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400">
                            A focused hiring workspace for preparing job materials, searching current roles, practicing interviews, and publishing a portfolio.
                        </p>
                    </div>
                    <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-950/50 xl:border-l xl:border-t-0">
                        <p className="text-xs font-bold uppercase text-gray-500">Current Workspace</p>
                        <p className="mt-2 text-lg font-bold text-gray-950 dark:text-white">{title}</p>
                        <p className="mt-1 text-sm text-gray-500">Move through the hiring workflow from one focused workspace.</p>
                    </div>
                </div>
            </section>

            <div className={`grid min-w-0 gap-6 ${compactNav ? 'xl:grid-cols-[80px_minmax(0,1fr)]' : 'xl:grid-cols-[300px_minmax(0,1fr)]'}`}>
                <aside className={`min-w-0 xl:sticky xl:top-20 xl:self-start ${compactNav ? 'xl:w-20' : ''}`}>
                    <div className={`mb-3 hidden items-center ${compactNav ? 'justify-center' : 'justify-between'} rounded-lg border border-gray-200 bg-white p-3 text-sm dark:border-gray-800 dark:bg-gray-900 xl:flex`}>
                        {!compactNav && <span className="font-semibold text-gray-700 dark:text-gray-200">Sidebar</span>}
                        <button
                            type="button"
                            onClick={() => setCompactNav((current) => !current)}
                            className={`inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white ${compactNav ? 'w-12 px-2' : 'px-3'} py-2 text-xs font-semibold text-gray-600 transition hover:border-primary-200 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-primary-600 dark:hover:text-primary-200`}
                        >
                            {compactNav ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {!compactNav && <span>{compactNav ? 'Expanded' : 'Compact'}</span>}
                        </button>
                    </div>
                    <nav className={`flex min-w-0 gap-2 overflow-x-auto rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-900 xl:block xl:overflow-visible xl:p-3 ${compactNav ? 'xl:w-20' : ''}`}>
                        {tabs.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    title={item.label}
                                    onClick={() => navigate(`/career/${item.id}`)}
                                    className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm transition xl:mb-1 xl:w-full ${compactNav ? 'xl:justify-center xl:px-2 xl:py-3' : 'xl:items-start xl:gap-3 xl:px-3 xl:py-3 xl:text-left'} ${isActive
                                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <Icon className={`h-5 w-5 shrink-0 xl:mt-0.5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                                    <span className={`min-w-0 flex-1 ${compactNav ? 'xl:hidden' : ''}`}>
                                        <span className="flex items-center gap-2 text-sm font-bold">
                                            {item.label}
                                            {item.badge && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">{item.badge}</span>}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <main className="min-w-0">
                    {activeTab === 'resume-builder' && <EmbeddedFeature path={location.pathname}><ResumeBuilderPage embedded /></EmbeddedFeature>}
                    {activeTab === 'job-search' && <JobSearchTool />}
                    {activeTab === 'job-tracker' && <JobApplyTracker />}
                    {activeTab === 'interview-simulator' && <AIInterviewSimulatorPage />}
                    {activeTab === 'portfolio-builder' && <PortfolioBuilderPage />}
                </main>
            </div>
        </div>
    );
};

const JobSearchTool = () => {
    const profile = loadJson<CareerProfile>(CAREER_PROFILE_KEY, defaultProfile);
    const [query, setQuery] = useState(profile.targetRole);
    const [location, setLocation] = useState('');
    const [experience, setExperience] = useState<JobSearchExperience>(() => normalizeExperience(profile.experienceLevel));
    const [remote, setRemote] = useState(false);
    const [result, setResult] = useState<JobSearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const runSearch = async (event?: React.FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
            toast.error('Enter a role or keyword to search');
            return;
        }
        setIsSearching(true);
        try {
            const response = await careerToolsService.searchJobs(trimmedQuery, location.trim(), remote, experience);
            setResult(response);
        } catch (error) {
            console.error(error);
            toast.error('Job search agent failed');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={runSearch} className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-2 text-primary-600 dark:text-primary-300">
                    <Search className="h-5 w-5" />
                    <h3 className="text-lg font-bold text-gray-950 dark:text-white">Job Search Agent</h3>
                </div>
                <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_160px_auto]">
                    <CareerInput label="Role or keywords" value={query} onChange={setQuery} placeholder="Frontend developer, data analyst..." required />
                    <CareerInput label="Location" value={location} onChange={setLocation} placeholder="Bengaluru, Remote, USA" />
                    <label className="block">
                        <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Experience</span>
                        <select value={experience} onChange={(event) => setExperience(event.target.value as JobSearchExperience)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800">
                            {experienceOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>
                    <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                        <input type="checkbox" checked={remote} onChange={(event) => setRemote(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        Remote
                    </label>
                </div>
                <Button type="submit" isLoading={isSearching} className="mt-4 gap-2">
                    <Search className="h-4 w-4" /> Search Current Jobs
                </Button>
                <p className="mt-3 text-xs text-gray-500">The backend agent searches current public hiring pages and normalizes matching vacancies. Always verify salary, company identity, and application requirements on the source page.</p>
            </form>

            {result && (
                <div className="grid gap-3">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{result.jobs.length} current results</p>
                        <p className="text-xs text-gray-500">Updated {new Date(result.generatedAt).toLocaleString()}</p>
                    </div>
                    {result.jobs.length === 0 ? (
                        <InfoPanel title="No Live Matches" icon={<Target className="h-5 w-5" />}>
                            <p className="text-sm text-gray-500">Try a broader role title, a different location, or remove the experience filter.</p>
                        </InfoPanel>
                    ) : result.jobs.map((job) => (
                        <a key={`${job.id}-${job.url}`} href={job.url} target="_blank" rel="noreferrer" className="rounded-lg border border-gray-200 bg-white p-5 transition hover:border-primary-200 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-gray-950 dark:text-white">{job.title}</h3>
                                    <p className="mt-1 text-sm font-semibold text-gray-500">{job.company} · {job.location}</p>
                                </div>
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                    {job.source} <ExternalLink className="h-3.5 w-3.5" />
                                </span>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">{job.summary}</p>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export const JobApplyTracker = () => {
    const [applications, setApplications] = useState<JobApplication[]>(() => loadJson(JOB_APPLICATIONS_KEY, []));
    const [draft, setDraft] = useState({ company: '', role: '', source: '', nextStep: '', status: 'Saved' });

    const saveApplications = (items: JobApplication[]) => {
        setApplications(items);
        localStorage.setItem(JOB_APPLICATIONS_KEY, JSON.stringify(items));
    };

    const addApplication = () => {
        if (!draft.company.trim() || !draft.role.trim()) {
            toast.error('Add company and role first');
            return;
        }
        saveApplications([{ ...draft, id: Date.now().toString(36), updatedAt: new Date().toISOString() }, ...applications]);
        setDraft({ company: '', role: '', source: '', nextStep: '', status: 'Saved' });
        toast.success('Application added');
    };

    const updateApplication = (id: string, patch: Partial<JobApplication>) => {
        saveApplications(applications.map((item) => (
            item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item
        )));
    };

    const removeApplication = (id: string) => {
        saveApplications(applications.filter((item) => item.id !== id));
        toast.success('Application removed');
    };

    const statusCounts = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'].map((status) => ({
        status,
        count: applications.filter((item) => item.status === status).length,
    }));

    return (
        <div className="space-y-6">
            <div className="grid gap-3 md:grid-cols-5">
                {statusCounts.map((item) => (
                    <MetricCard key={item.status} label={item.status} value={String(item.count)} note="Live pipeline" />
                ))}
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-bold text-gray-950 dark:text-white">Add Application</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <CareerInput label="Company" value={draft.company} onChange={(value) => setDraft({ ...draft, company: value })} />
                    <CareerInput label="Role" value={draft.role} onChange={(value) => setDraft({ ...draft, role: value })} />
                    <CareerInput label="Source" value={draft.source} onChange={(value) => setDraft({ ...draft, source: value })} placeholder="LinkedIn, referral, company site" />
                    <CareerInput label="Next Step" value={draft.nextStep} onChange={(value) => setDraft({ ...draft, nextStep: value })} placeholder="Follow up on Friday" />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
                        {['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'].map((status) => <option key={status}>{status}</option>)}
                    </select>
                    <Button onClick={addApplication} className="gap-2"><Send className="h-4 w-4" /> Add To Pipeline</Button>
                </div>
            </div>
            <div className="grid gap-3">
                {applications.length === 0 ? (
                    <InfoPanel title="No Applications Yet" icon={<BriefcaseBusiness className="h-5 w-5" />}>
                        <p className="text-sm text-gray-500">Start with 5 carefully matched roles. Quality beats mass applying when your resume and portfolio are still improving.</p>
                    </InfoPanel>
                ) : applications.map((item) => (
                    <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="font-bold text-gray-950 dark:text-white">{item.role} at {item.company}</p>
                                <p className="mt-1 text-xs font-semibold text-gray-400">Updated {formatRelativeTime(item.updatedAt)}</p>
                                <p className="mt-1 text-sm text-gray-500">{item.source || 'Source not set'} · Next: {item.nextStep || 'Define follow-up'}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <select value={item.status} onChange={(event) => updateApplication(item.id, { status: event.target.value })} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
                                    {['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'].map((status) => <option key={status}>{status}</option>)}
                                </select>
                                <button type="button" onClick={() => removeApplication(item.id)} className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" title="Remove application">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <label className="mt-3 block">
                            <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Next Step</span>
                            <input value={item.nextStep} onChange={(event) => updateApplication(item.id, { nextStep: event.target.value })} placeholder="Follow up, prep screen, send portfolio..." className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800" />
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EmbeddedFeature = ({ children }: { path: string; children: React.ReactNode }) => (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        {children}
    </div>
);

const MetricCard = ({ label, value, note }: { label: string; value: string; note: string }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
        <p className="mt-2 truncate text-2xl font-bold text-gray-950 dark:text-white">{value}</p>
        <p className="mt-1 text-xs text-gray-500">{note}</p>
    </div>
);

const formatRelativeTime = (value?: string) => {
    if (!value) return 'just now';
    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) return 'just now';
    const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
};

const InfoPanel = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-2 text-primary-600 dark:text-primary-300">
            {icon}
            <h3 className="text-lg font-bold text-gray-950 dark:text-white">{title}</h3>
        </div>
        {children}
    </section>
);

const CareerInput = ({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) => (
    <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-gray-500">{label}{required && <span className="text-red-500"> *</span>}</span>
        <input required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800" />
    </label>
);

