import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import toast from 'react-hot-toast';
import { ArrowUpRight, Award, BriefcaseBusiness, CheckCircle2, Code2, Copy, Edit3, ExternalLink, Github, Globe2, GraduationCap, Linkedin, Link2, Mail, MapPin, Rocket, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { careerToolsService, type PortfolioResult, type PublishedPortfolio } from '../../../services/career-tools.service';
import { getResumeDraft, listItems, toText } from './utils';

export const PortfolioBuilderPage = () => {
    const resumeData = useMemo(() => getResumeDraft(), []);
    const [headline, setHeadline] = useState('');
    const [portfolioGoal, setPortfolioGoal] = useState('');
    const [result, setResult] = useState<PortfolioResult | null>(null);
    const [publishedUrl, setPublishedUrl] = useState('');
    const [publishedPortfolios, setPublishedPortfolios] = useState<PublishedPortfolio[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    useEffect(() => {
        careerToolsService.listMyPortfolios()
            .then(setPublishedPortfolios)
            .catch(() => setPublishedPortfolios([]));
    }, []);

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
        const portfolioName = toText(result.hero?.name) || 'portfolio';
        setIsPublishing(true);
        try {
            const published = await careerToolsService.publishPortfolio(result, portfolioName);
            const url = `${window.location.origin}/portfolio/${published.slug}`;
            setPublishedUrl(url);
            setPublishedPortfolios((current) => [published, ...current]);
            await navigator.clipboard.writeText(url);
            toast.success('Public portfolio link copied');
        } catch (error) {
            console.error(error);
            toast.error('Unable to publish portfolio');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleEditPublished = (slug: string) => {
        const portfolio = publishedPortfolios.find((item) => item.slug === slug)?.content;
        if (!portfolio) return;
        setResult(portfolio);
        setPublishedUrl(`${window.location.origin}/portfolio/${slug}`);
        toast.success('Loaded published portfolio for editing');
    };

    const handleRemovePublished = async (slug: string) => {
        try {
            await careerToolsService.deletePortfolio(slug);
            setPublishedPortfolios((current) => current.filter((item) => item.slug !== slug));
            if (publishedUrl.endsWith(`/portfolio/${slug}`)) {
                setPublishedUrl('');
            }
            toast.success('Published preview removed');
        } catch (error) {
            console.error(error);
            toast.error('Unable to remove portfolio');
        }
    };

    const publishedEntries = publishedPortfolios.map(({ slug, content }) => ({
        slug,
        portfolio: content,
        url: `${window.location.origin}/portfolio/${slug}`,
    }));

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
                            <Metric label="Projects" value={String(result ? listItems(result.featuredProjects).length : 0)} />
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
                                <Button variant="outline" onClick={handlePublishPreview} isLoading={isPublishing} className="gap-2">
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
                        {publishedEntries.length > 0 && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950/50">
                                <p className="text-xs font-bold uppercase text-gray-500">Previously Published</p>
                                <div className="mt-3 space-y-2">
                                    {publishedEntries.slice(0, 5).map(({ slug, portfolio, url }) => (
                                        <div key={slug} className="rounded-lg bg-white p-2 dark:bg-gray-900">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="min-w-0 truncate text-sm font-semibold text-gray-700 dark:text-gray-300">{toText(portfolio.hero?.name) || slug}</span>
                                                <div className="flex shrink-0 items-center gap-1">
                                                    <a href={url} target="_blank" rel="noreferrer" className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800" title="Open preview">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                    <button type="button" onClick={() => handleEditPublished(slug)} className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800" title="Edit this portfolio">
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" onClick={() => handleRemovePublished(slug)} className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" title="Remove preview">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
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

export const PortfolioPreview = ({ result }: { result: PortfolioResult }) => {
    const name = toText(result.hero?.name) || 'Portfolio';
    const headline = toText(result.hero?.headline) || 'Building useful digital products';
    const summary = toText(result.hero?.summary);
    const ctaText = toText(result.hero?.ctaText) || 'Let us work together';
    const skills = listItems(result.skills);
    const projects = Array.isArray(result.featuredProjects) ? result.featuredProjects : [];
    const experience = listItems(result.experienceHighlights);
    const achievements = listItems(result.achievements);
    const education = listItems(result.education);
    const contact = result.contact ?? {};
    const email = toText(contact.email);
    const linkedin = toText(contact.linkedin);
    const github = toText(contact.github);
    const location = toText(contact.location);

    return (
        <div className="overflow-hidden rounded-lg bg-white text-gray-950 shadow-sm ring-1 ring-gray-200 dark:bg-gray-950 dark:text-white dark:ring-gray-800">
            <section className="relative bg-gray-950 px-6 py-10 text-white sm:px-8 lg:px-10">
                <div className="absolute inset-x-0 top-0 h-1 bg-primary-500" />
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-primary-300">{name}</p>
                        <h2 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">{headline}</h2>
                        {summary && <p className="mt-5 max-w-3xl text-base leading-7 text-gray-300">{summary}</p>}
                        <div className="mt-7 flex flex-wrap gap-3">
                            {email && (
                                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-400">
                                    <Mail className="h-4 w-4" /> {ctaText}
                                </a>
                            )}
                            {github && <ContactLink href={github} icon={<Github className="h-4 w-4" />} label="GitHub" />}
                            {linkedin && <ContactLink href={linkedin} icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />}
                        </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Profile Snapshot</p>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                            <Snapshot value={String(projects.length)} label="Projects" />
                            <Snapshot value={String(skills.length)} label="Skills" />
                            <Snapshot value={String(achievements.length)} label="Wins" />
                        </div>
                        {location && (
                            <p className="mt-5 flex items-center gap-2 text-sm text-gray-300">
                                <MapPin className="h-4 w-4 text-primary-300" /> {location}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <section className="border-b border-gray-200 bg-gray-50 px-6 py-5 dark:border-gray-800 dark:bg-gray-900/70 sm:px-8 lg:px-10">
                <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 14).map((skill) => (
                        <span key={skill} className="rounded-full border border-primary-100 bg-white px-3 py-1 text-xs font-bold text-primary-700 dark:border-primary-900 dark:bg-gray-950 dark:text-primary-300">
                            {skill}
                        </span>
                    ))}
                </div>
            </section>

            <div className="space-y-10 px-6 py-10 sm:px-8 lg:px-10">
                <PortfolioSection icon={<Code2 className="h-5 w-5" />} title="Featured Work" subtitle="Selected projects framed as product outcomes and implementation proof.">
                    <div className="grid gap-5 lg:grid-cols-2">
                        {projects.map((project, index) => {
                            const title = toText(project?.title) || `Project ${index + 1}`;
                            return (
                                <article key={`${title}-${index}`} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wide text-primary-600 dark:text-primary-300">Case Study {index + 1}</p>
                                            <h3 className="mt-2 text-xl font-bold text-gray-950 dark:text-white">{title}</h3>
                                        </div>
                                        <ArrowUpRight className="h-5 w-5 shrink-0 text-gray-400" />
                                    </div>
                                    {toText(project?.techStack) && <p className="mt-3 text-sm font-semibold text-gray-500 dark:text-gray-400">{toText(project?.techStack)}</p>}
                                    {toText(project?.description) && <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">{toText(project?.description)}</p>}
                                    <ul className="mt-5 space-y-2">
                                        {listItems(project?.highlights).map((item) => (
                                            <li key={item} className="flex gap-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" /> <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            );
                        })}
                    </div>
                </PortfolioSection>

                <div className="grid gap-6 lg:grid-cols-2">
                    <PortfolioPanel icon={<BriefcaseBusiness className="h-5 w-5" />} title="Experience Highlights" items={experience} />
                    <PortfolioPanel icon={<Award className="h-5 w-5" />} title="Achievements" items={achievements} />
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <PortfolioPanel icon={<GraduationCap className="h-5 w-5" />} title="Education" items={education} />
                    <section className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-300">
                            <Mail className="h-5 w-5" />
                            <h3 className="text-lg font-bold text-gray-950 dark:text-white">Contact</h3>
                        </div>
                        <div className="mt-5 space-y-3 text-sm">
                            {email && <ContactRow icon={<Mail className="h-4 w-4" />} label={email} href={`mailto:${email}`} />}
                            {location && <ContactRow icon={<MapPin className="h-4 w-4" />} label={location} />}
                            {linkedin && <ContactRow icon={<Linkedin className="h-4 w-4" />} label="LinkedIn Profile" href={linkedin} />}
                            {github && <ContactRow icon={<Github className="h-4 w-4" />} label="GitHub Profile" href={github} />}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

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

const Snapshot = ({ value, label }: { value: string; label: string }) => (
    <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
    </div>
);

const PortfolioSection = ({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) => (
    <section>
        <div className="mb-5 flex items-start gap-3">
            <div className="rounded-lg bg-primary-50 p-2 text-primary-600 dark:bg-primary-950 dark:text-primary-300">{icon}</div>
            <div>
                <h3 className="text-2xl font-bold text-gray-950 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            </div>
        </div>
        {children}
    </section>
);

const PortfolioPanel = ({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) => (
    <section className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-300">
            {icon}
            <h3 className="text-lg font-bold text-gray-950 dark:text-white">{title}</h3>
        </div>
        <ul className="mt-4 space-y-3">
            {listItems(items).map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary-500" /> <span>{item}</span>
                </li>
            ))}
        </ul>
    </section>
);

const normalizeUrl = (href: string) => {
    if (!href) return '';
    if (/^https?:\/\//i.test(href) || href.startsWith('mailto:')) return href;
    return `https://${href}`;
};

const ContactLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
    <a href={normalizeUrl(href)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10">
        {icon} {label}
    </a>
);

const ContactRow = ({ icon, label, href }: { icon: React.ReactNode; label: string; href?: string }) => {
    const content = (
        <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <span className="text-primary-600 dark:text-primary-300">{icon}</span>
            <span className="min-w-0 break-words">{label}</span>
        </span>
    );

    if (!href) {
        return content;
    }

    return (
        <a href={normalizeUrl(href)} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer" className="block rounded-lg transition hover:text-primary-600">
            {content}
        </a>
    );
};
