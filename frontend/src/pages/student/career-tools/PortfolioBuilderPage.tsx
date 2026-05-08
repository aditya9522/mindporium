import { useMemo, useState } from 'react';
import type React from 'react';
import toast from 'react-hot-toast';
import { Copy, ExternalLink, Globe2, Link2, Rocket, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { careerToolsService, type PortfolioResult } from '../../../services/career-tools.service';
import { getResumeDraft, listItems } from './utils';

const PORTFOLIO_STORAGE_KEY = 'mindporium_public_portfolios';

export const PortfolioBuilderPage = () => {
    const resumeData = useMemo(() => getResumeDraft(), []);
    const [headline, setHeadline] = useState('');
    const [portfolioGoal, setPortfolioGoal] = useState('');
    const [result, setResult] = useState<PortfolioResult | null>(null);
    const [publishedUrl, setPublishedUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setPublishedUrl('');
        try {
            const response = await careerToolsService.generatePortfolio(resumeData, headline, portfolioGoal);
            setResult(response);
            toast.success('Portfolio workspace generated');
        } catch (error) {
            console.error(error);
            toast.error('Unable to generate portfolio');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async () => {
        if (!result) return;
        await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
        toast.success('Portfolio content copied');
    };

    const handlePublishPreview = async () => {
        if (!result) return;
        const slug = `${(result.hero.name || 'portfolio').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'portfolio'}-${Date.now().toString(36)}`;
        const portfolios = JSON.parse(localStorage.getItem(PORTFOLIO_STORAGE_KEY) || '{}');
        portfolios[slug] = result;
        localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolios));
        const url = `${window.location.origin}/portfolio/${slug}`;
        setPublishedUrl(url);
        await navigator.clipboard.writeText(url);
        toast.success('Public preview link copied');
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
                    <div className="p-6">
                        <div className="flex items-center gap-2">
                            <Globe2 className="h-5 w-5 text-primary-600" />
                            <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300">Beta</span>
                        </div>
                        <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">Portfolio Builder</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                            Build a recruiter-ready public portfolio from your resume: hero, proof points, project case studies, skills, and contact.
                        </p>
                    </div>
                    <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-950/40 lg:border-l lg:border-t-0">
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <Metric label="Sections" value={result ? '6' : '0'} />
                            <Metric label="Projects" value={String(result?.featuredProjects.length ?? 0)} />
                            <Metric label="Status" value={publishedUrl ? 'Live' : 'Draft'} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                <aside className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                        <Rocket className="h-4 w-4 text-primary-600" /> Publishing Brief
                    </h2>
                    <div className="mt-4 space-y-4">
                        <Field label="Preferred Headline">
                            <input
                                value={headline}
                                onChange={(event) => setHeadline(event.target.value)}
                                placeholder="AI/ML Developer, Full Stack Engineer..."
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
                            />
                        </Field>
                        <Field label="Portfolio Goal">
                            <textarea
                                value={portfolioGoal}
                                onChange={(event) => setPortfolioGoal(event.target.value)}
                                rows={9}
                                placeholder="Example: Public portfolio for AI internships focused on RAG, agents, and full-stack projects."
                                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
                            />
                        </Field>
                        <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full gap-2">
                            <Sparkles className="h-4 w-4" /> Generate Portfolio
                        </Button>
                        {result && (
                            <div className="grid gap-2">
                                <Button variant="outline" onClick={handlePublishPreview} className="gap-2">
                                    <Link2 className="h-4 w-4" /> Publish Public Preview
                                </Button>
                                <Button variant="ghost" onClick={handleCopy} className="gap-2">
                                    <Copy className="h-4 w-4" /> Copy Content JSON
                                </Button>
                            </div>
                        )}
                        {publishedUrl && (
                            <a href={publishedUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                                <ExternalLink className="h-4 w-4" /> Open public preview
                            </a>
                        )}
                    </div>
                </aside>

                <main className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                    {result ? <PortfolioPreview result={result} /> : (
                        <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
                            <Globe2 className="h-14 w-14 text-gray-300" />
                            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Portfolio workspace is empty</h2>
                            <p className="mt-2 max-w-sm text-sm text-gray-500">
                                Generate a portfolio, review the page preview, then publish a public preview link.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export const PortfolioPreview = ({ result }: { result: PortfolioResult }) => (
    <div className="space-y-8">
        <section className="rounded-lg bg-gray-950 p-8 text-white">
            <p className="text-sm font-semibold text-primary-300">{result.hero.name}</p>
            <h2 className="mt-2 max-w-4xl text-4xl font-bold leading-tight">{result.hero.headline}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-300">{result.hero.summary}</p>
            <p className="mt-6 text-sm font-bold text-primary-200">{result.hero.ctaText}</p>
        </section>

        <Section title="Core Skills">
            <div className="flex flex-wrap gap-2">
                {listItems(result.skills).map((skill) => (
                    <span key={skill} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">{skill}</span>
                ))}
            </div>
        </Section>

        <Section title="Featured Work">
            <div className="grid gap-4 md:grid-cols-2">
                {result.featuredProjects.map((project) => (
                    <article key={project.title} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{project.title}</h3>
                        <p className="mt-1 text-xs font-semibold text-primary-600">{project.techStack}</p>
                        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">{project.description}</p>
                        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                            {project.highlights.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                    </article>
                ))}
            </div>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
            <Section title="Experience Highlights">
                <BulletList items={result.experienceHighlights} />
            </Section>
            <Section title="Achievements">
                <BulletList items={result.achievements} />
            </Section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
            <Section title="Education">
                <BulletList items={result.education} />
            </Section>
            <Section title="Contact">
                <div className="grid gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>{result.contact.email}</p>
                    <p>{result.contact.location}</p>
                    <p>{result.contact.linkedin}</p>
                    <p>{result.contact.github}</p>
                </div>
            </Section>
        </div>
    </div>
);

const Metric = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-lg bg-white p-3 dark:bg-gray-900">
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-[10px] font-bold uppercase text-gray-500">{label}</p>
    </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
        <label className="mb-1 block text-xs font-bold uppercase text-gray-500">{label}</label>
        {children}
    </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">{title}</h2>
        {children}
    </section>
);

const BulletList = ({ items }: { items: string[] }) => (
    <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-gray-700 dark:text-gray-300">
        {listItems(items).map((item) => <li key={item}>{item}</li>)}
    </ul>
);
