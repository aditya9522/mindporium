import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    Award,
    BookOpen,
    Bot,
    BriefcaseBusiness,
    CheckCircle2,
    Clock3,
    Compass,
    ExternalLink,
    FileText,
    Globe2,
    GraduationCap,
    LayoutDashboard,
    Search,
    Send,
    Sparkles,
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
import { getResumeDraft } from './utils';
import { careerToolsService, type JobSearchExperience, type JobSearchResult } from '../../../services/career-tools.service';

const CAREER_PROFILE_KEY = 'mindporium_career_profile';
const JOB_APPLICATIONS_KEY = 'mindporium_job_applications';

type CareerTab = 'overview' | 'career-selection' | 'skill-improvement' | 'resume-builder' | 'job-search' | 'interview-simulator' | 'portfolio-builder';

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
    { id: 'overview', label: 'Command Center', description: 'Roadmap, readiness, and next actions', icon: LayoutDashboard },
    { id: 'career-selection', label: 'Career Path', description: 'Choose a realistic target path', icon: Compass },
    { id: 'skill-improvement', label: 'Skill Growth', description: 'Courses and weekly skill plan', icon: BookOpen },
    { id: 'resume-builder', label: 'Resume Studio', description: 'ATS resume and job tailoring', icon: FileText },
    { id: 'job-search', label: 'Job Search', description: 'Find current openings from the web', icon: Search },
    { id: 'interview-simulator', label: 'AI Interview', description: 'Voice mock interview and feedback', icon: Bot, badge: 'AI' },
    { id: 'portfolio-builder', label: 'Portfolio Studio', description: 'Public project portfolio', icon: Globe2, badge: 'AI' },
];

const careerPaths = [
    { role: 'Frontend Developer', demand: 'High', fit: 'UI logic, React, accessibility', starter: 'React, TypeScript, testing, API integration' },
    { role: 'Backend Developer', demand: 'High', fit: 'APIs, databases, system design', starter: 'Node/FastAPI, SQL, auth, deployment' },
    { role: 'Data Analyst', demand: 'High', fit: 'Insights, dashboards, reporting', starter: 'SQL, Excel, Python, BI dashboards' },
    { role: 'AI Engineer', demand: 'Emerging', fit: 'LLM apps, RAG, model integration', starter: 'Python, vectors, agents, evaluation' },
    { role: 'Product Designer', demand: 'Steady', fit: 'UX, research, prototyping', starter: 'Figma, UX writing, usability testing' },
];

const skillTracks = [
    { title: 'Foundation', items: ['Core programming refresh', 'Git workflow', 'Debugging discipline'], link: '/courses?search=programming' },
    { title: 'Role Skills', items: ['Role-specific projects', 'Framework depth', 'Testing and documentation'], link: '/courses' },
    { title: 'Hiring Proof', items: ['Portfolio case study', 'Resume metrics', 'Interview stories'], link: '/career/portfolio-builder' },
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

const getCareerSnapshot = () => {
    const profile = loadJson<CareerProfile>(CAREER_PROFILE_KEY, defaultProfile);
    const resume = getResumeDraft();
    const readinessItems = [
        { label: 'Career profile', done: Boolean(profile.targetRole) },
        { label: 'Resume contact', done: Boolean(resume.personalInfo.email) },
        { label: 'Portfolio ready', done: false },
        { label: 'Interview practice', done: false },
    ];

    return { profile, readinessItems };
};

const useCareerSnapshot = () => {
    const [snapshot, setSnapshot] = useState(() => getCareerSnapshot());
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const refresh = () => setSnapshot(getCareerSnapshot());
        const interval = window.setInterval(() => {
            refresh();
            setNow(new Date());
        }, 5000);

        window.addEventListener('storage', refresh);
        window.addEventListener('focus', refresh);
        return () => {
            window.clearInterval(interval);
            window.removeEventListener('storage', refresh);
            window.removeEventListener('focus', refresh);
        };
    }, []);

    return { ...snapshot, now };
};

export const CareerWorkspacePage = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const activeTab = (tab ?? 'overview') as CareerTab;
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
        return <Navigate to="/career/overview" replace />;
    }

    const title = tabs.find((item) => item.id === activeTab)?.label ?? 'Career Workspace';

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <section className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="p-6">
                        <div className="flex items-center gap-2">
                            <BriefcaseBusiness className="h-5 w-5 text-primary-600" />
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">New</span>
                        </div>
                        <h1 className="mt-3 text-2xl font-bold text-gray-950 dark:text-white">Career Workspace</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400">
                            One workspace for choosing a career path, improving skills with courses, preparing job materials, practicing interviews, applying to roles, and publishing a portfolio.
                        </p>
                    </div>
                    <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-950/50 xl:border-l xl:border-t-0">
                        <p className="text-xs font-bold uppercase text-gray-500">Current Workspace</p>
                        <p className="mt-2 text-lg font-bold text-gray-950 dark:text-white">{title}</p>
                        <p className="mt-1 text-sm text-gray-500">Move through the hiring workflow from one focused workspace.</p>
                    </div>
                </div>
            </section>

            <div className={`grid gap-6 ${compactNav ? 'xl:grid-cols-[80px_minmax(0,1fr)]' : 'xl:grid-cols-[300px_minmax(0,1fr)]'}`}>
                <aside className={`xl:sticky xl:top-20 xl:self-start ${compactNav ? 'xl:w-20' : ''}`}>
                    <div className={`mb-3 flex items-center ${compactNav ? 'justify-center' : 'justify-between'} rounded-lg border border-gray-200 bg-white p-3 text-sm dark:border-gray-800 dark:bg-gray-900`}>
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
                    <nav className={`rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 ${compactNav ? 'w-20' : ''}`}>
                        {tabs.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    title={item.label}
                                    onClick={() => navigate(`/career/${item.id}`)}
                                    className={`mb-1 flex w-full ${compactNav ? 'justify-center' : 'items-start'} gap-3 rounded-lg ${compactNav ? 'px-2 py-3' : 'px-3 py-3 text-left'} transition ${isActive
                                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                                    {!compactNav && (
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center gap-2 text-sm font-bold">
                                                {item.label}
                                                {item.badge && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">{item.badge}</span>}
                                            </span>
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <main className="min-w-0">
                    {activeTab === 'overview' && <CareerOverview />}
                    {activeTab === 'career-selection' && <CareerSelection />}
                    {activeTab === 'skill-improvement' && <SkillImprovement />}
                    {activeTab === 'resume-builder' && <EmbeddedFeature path={location.pathname}><ResumeBuilderPage embedded /></EmbeddedFeature>}
                    {activeTab === 'job-search' && <JobSearchTool />}
                    {activeTab === 'interview-simulator' && <AIInterviewSimulatorPage />}
                    {activeTab === 'portfolio-builder' && <PortfolioBuilderPage />}
                </main>
            </div>
        </div>
    );
};

const CareerOverview = () => {
    const { profile, readinessItems, now } = useCareerSnapshot();
    const [portfolioCount, setPortfolioCount] = useState(0);
    const liveReadinessItems = readinessItems.map((item) => (
        item.label === 'Portfolio ready' ? { ...item, done: portfolioCount > 0 } : item
    ));
    const readiness = liveReadinessItems.filter((item) => item.done).length;
    const readinessPercent = Math.round((readiness / liveReadinessItems.length) * 100);
    const workspaceSteps = [
        { label: 'Profile', value: profile.targetRole ? 100 : 30, color: 'bg-emerald-500' },
        { label: 'Resume', value: readinessItems[1]?.done ? 100 : 35, color: 'bg-sky-500' },
        { label: 'Portfolio', value: Math.min(100, portfolioCount * 50), color: 'bg-primary-500' },
        { label: 'Interview', value: 25, color: 'bg-amber-500' },
    ];

    useEffect(() => {
        careerToolsService.listMyPortfolios()
            .then((items) => setPortfolioCount(items.length))
            .catch(() => setPortfolioCount(0));
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
                <MetricCard label="Readiness" value={`${readiness}/4`} note="Profile, resume, portfolio, interview" />
                <MetricCard label="Target Role" value={profile.targetRole || 'Unset'} note={profile.targetIndustry || 'Pick a focused market'} />
                <MetricCard label="Portfolios" value={String(portfolioCount)} note="Public links stored on server" />
                <MetricCard label="Live Check" value={now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} note="Workspace state refreshed" />
            </div>
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
                <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-xs font-bold uppercase text-gray-500">Career Readiness</p>
                    <div className="relative mx-auto mt-5 h-44 w-44 rounded-full" style={{ background: `conic-gradient(#6366f1 ${readinessPercent * 3.6}deg, #e5e7eb 0deg)` }}>
                        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white dark:bg-gray-900">
                            <span className="text-4xl font-black text-gray-950 dark:text-white">{readinessPercent}%</span>
                            <span className="text-xs font-bold uppercase text-gray-400">Ready</span>
                        </div>
                    </div>
                    <p className="mt-4 text-center text-xs text-gray-500">Circle updates from your profile, resume, portfolio, and practice readiness.</p>
                </section>

                <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-bold uppercase text-gray-500">Workspace Progress</p>
                            <h3 className="mt-1 text-xl font-bold text-gray-950 dark:text-white">Hiring Assets</h3>
                        </div>
                        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300">Live</span>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-4">
                        {workspaceSteps.map((step) => (
                                <div key={step.label} className="flex flex-col items-center gap-2">
                                    <div className="flex h-32 w-full items-end rounded-xl bg-gray-50 p-2 dark:bg-gray-800">
                                        <div className={`w-full rounded-lg ${step.color} transition-all`} style={{ height: `${Math.max(18, step.value)}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{step.label}</span>
                                    <span className="text-lg font-black text-gray-950 dark:text-white">{step.value}%</span>
                                </div>
                            ))}
                    </div>
                </section>

                <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-xs font-bold uppercase text-gray-500">Proof Assets</p>
                    <div className="mt-5 space-y-4">
                        <ProofAsset label="Resume Contact" value={readinessItems[1]?.done ? 100 : 25} color="bg-emerald-500" />
                        <ProofAsset label="Portfolio Links" value={Math.min(100, portfolioCount * 50)} color="bg-primary-500" />
                        <ProofAsset label="Interview Practice" value={25} color="bg-amber-500" />
                    </div>
                    <div className="mt-6 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                        <p className="text-sm font-bold text-gray-950 dark:text-white">{portfolioCount} portfolios published</p>
                        <p className="mt-1 text-xs text-gray-500">Publish links from Portfolio Studio and share them across devices.</p>
                    </div>
                </section>
            </div>
            <InfoPanel title="Live Readiness Monitor" icon={<Clock3 className="h-5 w-5" />}>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-full bg-primary-600 transition-all" style={{ width: `${readinessPercent}%` }} />
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {liveReadinessItems.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                            <CheckCircle2 className={`h-4 w-4 ${item.done ? 'text-emerald-500' : 'text-gray-300'}`} />
                            <span className={item.done ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500'}>{item.label}</span>
                        </div>
                    ))}
                </div>
                <p className="mt-3 text-xs text-gray-500">This dashboard refreshes automatically while you work across resume, portfolio, interview, and application tabs.</p>
            </InfoPanel>
            <InfoPanel title="Recommended Next Actions" icon={<Sparkles className="h-5 w-5" />}>
                <ActionList items={[
                    'Choose one target role before applying. Recruiters read focus as confidence.',
                    'Use Skill Improvement to select courses and close only the gaps required by your target role.',
                    'Tailor your resume for each serious job application before submitting.',
                    'Practice the first five interview questions aloud and review the AI feedback before applying widely.',
                ]} />
            </InfoPanel>
            <div className="grid gap-6 lg:grid-cols-2">
                <WorkflowCard title="Build Proof" icon={<Award className="h-5 w-5" />} links={[
                    ['Create resume', '/career/resume-builder'],
                    ['Generate portfolio', '/career/portfolio-builder'],
                    ['Browse courses', '/career/skill-improvement'],
                ]} />
                <WorkflowCard title="Get Hired" icon={<Target className="h-5 w-5" />} links={[
                    ['Search jobs', '/career/job-search'],
                    ['Practice interview', '/career/interview-simulator'],
                ]} />
            </div>
        </div>
    );
};

const CareerSelection = () => {
    const [profile, setProfile] = useState<CareerProfile>(() => loadJson(CAREER_PROFILE_KEY, defaultProfile));
    const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved');

    useEffect(() => {
        setSaveState('saving');
        const timeout = window.setTimeout(() => {
            localStorage.setItem(CAREER_PROFILE_KEY, JSON.stringify({ ...profile, updatedAt: new Date().toISOString() }));
            setSaveState('saved');
        }, 450);

        return () => window.clearTimeout(timeout);
    }, [profile]);

    return (
        <div className="space-y-6">
            <InfoPanel title="Career Selection" icon={<Compass className="h-5 w-5" />}>
                <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                    Pick a role by matching interest, proof you can show, market demand, and time available. Avoid applying to five unrelated roles with one generic resume.
                </p>
            </InfoPanel>
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="grid gap-4">
                    {careerPaths.map((path) => (
                        <button key={path.role} type="button" onClick={() => setProfile((current) => ({ ...current, targetRole: path.role }))} className="rounded-lg border border-gray-200 bg-white p-5 text-left transition hover:border-primary-200 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-950 dark:text-white">{path.role}</h3>
                                    <p className="mt-1 text-sm text-gray-500">{path.fit}</p>
                                </div>
                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{path.demand}</span>
                            </div>
                            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Starter stack: {path.starter}</p>
                        </button>
                    ))}
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-bold text-gray-950 dark:text-white">Career Profile</h3>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-500 dark:bg-gray-800">
                            {saveState === 'saving' ? 'Saving...' : 'Saved'}
                        </span>
                    </div>
                    <div className="mt-4 space-y-3">
                        <CareerInput label="Target Role" value={profile.targetRole} onChange={(value) => setProfile({ ...profile, targetRole: value })} />
                        <CareerInput label="Industry" value={profile.targetIndustry} onChange={(value) => setProfile({ ...profile, targetIndustry: value })} placeholder="Fintech, EdTech, SaaS..." />
                        <CareerInput label="Experience Level" value={profile.experienceLevel} onChange={(value) => setProfile({ ...profile, experienceLevel: value })} />
                        <CareerInput label="Weekly Hours" value={profile.weeklyHours} onChange={(value) => setProfile({ ...profile, weeklyHours: value })} />
                        <CareerTextArea label="Strengths" value={profile.strengths} onChange={(value) => setProfile({ ...profile, strengths: value })} />
                        <CareerTextArea label="Skill Gaps" value={profile.gaps} onChange={(value) => setProfile({ ...profile, gaps: value })} />
                        <p className="text-xs text-gray-500">Autosaves as you type, so the dashboard and job tools stay in sync.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SkillImprovement = () => (
    <div className="space-y-6">
        <InfoPanel title="Skill Improvement Plan" icon={<BookOpen className="h-5 w-5" />}>
            <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">Learn in hiring loops: study one concept, build one proof artifact, publish or document it, then practice explaining tradeoffs.</p>
        </InfoPanel>
        <div className="grid gap-5 lg:grid-cols-3">
            {skillTracks.map((track) => (
                <div key={track.title} className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                    <h3 className="text-lg font-bold text-gray-950 dark:text-white">{track.title}</h3>
                    <ActionList items={track.items} />
                    <Button asChild variant="outline" className="mt-5 w-full gap-2">
                        <Link to={track.link}>Open Learning Path <ExternalLink className="h-4 w-4" /></Link>
                    </Button>
                </div>
            ))}
        </div>
        <InfoPanel title="Course Recommendation Rule" icon={<GraduationCap className="h-5 w-5" />}>
            <ActionList items={[
                'Choose courses that end with a project, not only passive video watching.',
                'For every two hours of learning, spend at least one hour applying it to your portfolio or resume.',
                'Stop adding courses once you can prove the skill with a small shipped artifact.',
            ]} />
        </InfoPanel>
    </div>
);

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

const ProofAsset = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div>
        <div className="mb-1 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
            <span className="text-xs font-bold text-gray-400">{value}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
        </div>
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

const ActionList = ({ items }: { items: string[] }) => (
    <ul className="space-y-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
        {items.map((item) => (
            <li key={item} className="flex gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{item}</span>
            </li>
        ))}
    </ul>
);

const WorkflowCard = ({ title, icon, links }: { title: string; icon: React.ReactNode; links: [string, string][] }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-300">
            {icon}
            <h3 className="text-lg font-bold text-gray-950 dark:text-white">{title}</h3>
        </div>
        <div className="mt-4 grid gap-2">
            {links.map(([label, href]) => (
                <Link key={href} to={href} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:text-primary-600 dark:bg-gray-800 dark:text-gray-300">
                    {label}
                    <ExternalLink className="h-4 w-4" />
                </Link>
            ))}
        </div>
    </div>
);

const CareerInput = ({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) => (
    <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-gray-500">{label}{required && <span className="text-red-500"> *</span>}</span>
        <input required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800" />
    </label>
);

const CareerTextArea = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
    <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-gray-500">{label}</span>
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800" />
    </label>
);
