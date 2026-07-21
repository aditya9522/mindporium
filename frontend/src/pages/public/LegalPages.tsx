import type React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, FileText, Mail, ShieldCheck } from 'lucide-react';

const updatedAt = 'July 22, 2026';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-bold text-gray-950 dark:text-white">{title}</h2>
        <div className="mt-3 space-y-3 text-sm leading-7 text-gray-600 dark:text-gray-400">{children}</div>
    </section>
);

const LegalShell = ({
    icon: Icon,
    title,
    description,
    summary,
    children,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    summary: string[];
    children: React.ReactNode;
}) => (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 transition-colors dark:bg-gray-950">
        <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <Link
                    to="/"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                </Link>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
                    <div>
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:ring-primary-900/60">
                            <Icon className="h-7 w-7" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-600 dark:text-primary-400">Mindporium Legal</p>
                        <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-950 dark:text-white sm:text-5xl">{title}</h1>
                        <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-400">{description}</p>
                    </div>

                    <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                            <CalendarDays className="h-4 w-4 text-primary-500" />
                            Last updated
                        </div>
                        <p className="mt-2 text-sm font-bold text-gray-950 dark:text-white">{updatedAt}</p>
                        <div className="mt-5 space-y-3">
                            {summary.map(item => (
                                <div key={item} className="flex gap-2 text-sm leading-5 text-gray-600 dark:text-gray-400">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </section>

        <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
            <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="font-bold text-gray-950 dark:text-white">Need help?</p>
                <p className="mt-2 leading-6 text-gray-500 dark:text-gray-400">
                    Questions about account data, terms, or platform access can be sent to support.
                </p>
                <a
                    href="mailto:support@mindporium.ai"
                    className="mt-4 inline-flex items-center gap-2 font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
                >
                    <Mail className="h-4 w-4" />
                    support@mindporium.ai
                </a>
            </aside>

            <div className="space-y-5">{children}</div>
        </main>
    </div>
);

export const PrivacyPolicyPage = () => (
    <LegalShell
        icon={ShieldCheck}
        title="Privacy Policy"
        description="A clear overview of what Mindporium collects, why it is used, how it is protected, and what choices users have."
        summary={['We use data to operate learning features.', 'We do not sell personal information.', 'Users can request access, correction, or deletion where applicable.']}
    >
        <Section title="Information We Collect">
            <p>We collect account details such as name, email address, role, profile information, course activity, uploaded learning content, feedback, and settings needed to operate the platform.</p>
            <p>We may also collect technical information such as device type, browser, IP-derived location, log data, and usage events to keep the service secure and reliable.</p>
        </Section>

        <Section title="How We Use Information">
            <p>We use information to provide authentication, course access, progress tracking, notes, tests, classrooms, notifications, support, personalization, and platform improvements.</p>
            <p>We may use aggregated or de-identified data to understand performance and improve learning experiences without identifying individual users.</p>
        </Section>

        <Section title="Sharing and Service Providers">
            <p>We do not sell personal information. We share data only with service providers, instructors, or administrators where needed for learning workflows, legal compliance, safety, or platform operations.</p>
        </Section>

        <Section title="Security and Retention">
            <p>We use reasonable technical and organizational safeguards to protect user information. We keep information only as long as needed for the service, legal obligations, security, and legitimate business purposes.</p>
        </Section>

        <Section title="Your Choices">
            <p>Users can update profile details, manage account settings, and contact support for privacy requests such as access, correction, export, or deletion where applicable.</p>
        </Section>
    </LegalShell>
);

export const TermsPage = () => (
    <LegalShell
        icon={FileText}
        title="Terms and Conditions"
        description="The basic rules for using Mindporium, including account access, user content, learning materials, and acceptable use."
        summary={['Use Mindporium lawfully and respectfully.', 'Keep account credentials secure.', 'Only upload content you have rights to use.']}
    >
        <Section title="Using Mindporium">
            <p>Users must provide accurate account information, keep credentials secure, and use the platform only for lawful learning, teaching, administration, and community activities.</p>
        </Section>

        <Section title="Accounts and Access">
            <p>Access to some features may depend on account role, enrollment, course availability, subscription status, or administrator approval. We may suspend access when required for safety, security, misuse, or legal reasons.</p>
        </Section>

        <Section title="User Content">
            <p>Users are responsible for notes, uploads, comments, submissions, portfolio content, and other materials they add to the platform. Users should only upload content they own or have permission to use.</p>
        </Section>

        <Section title="Courses and Learning Content">
            <p>Course content, resources, tests, and platform materials are provided for learning purposes. Users may not copy, resell, redistribute, or misuse platform content unless explicitly permitted.</p>
        </Section>

        <Section title="Acceptable Use">
            <p>Users may not attempt unauthorized access, disrupt services, upload harmful code, harass others, impersonate users, scrape the platform, or use Mindporium in a way that violates law or harms the community.</p>
        </Section>

        <Section title="Changes">
            <p>We may update these terms as the platform evolves. Continued use after changes means the updated terms apply.</p>
        </Section>
    </LegalShell>
);
