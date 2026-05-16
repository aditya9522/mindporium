import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Globe2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { PortfolioResult } from '../../services/career-tools.service';
import { PortfolioPreview } from '../student/career-tools/PortfolioBuilderPage';
import { toText } from '../student/career-tools/utils';

const PORTFOLIO_STORAGE_KEY = 'mindporium_public_portfolios';

const getPublishedPortfolios = (): Record<string, PortfolioResult> => {
    try {
        const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
};

export const PublicPortfolioPage = () => {
    const { slug } = useParams();
    const portfolios = getPublishedPortfolios();
    const portfolio = slug ? portfolios[slug] : null;

    if (!portfolio) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
                <div className="max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <Globe2 className="mx-auto h-12 w-12 text-gray-300" />
                    <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Portfolio preview not found</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">This preview may have been removed from this browser.</p>
                    <Button asChild className="mt-6">
                        <Link to="/">Go Home</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const name = toText(portfolio.hero?.name) || 'Portfolio';

    return (
        <div className="min-h-screen bg-gray-100 text-gray-950 dark:bg-gray-950 dark:text-white">
            <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
                    <div className="flex items-center gap-2">
                        <Globe2 className="h-5 w-5 text-primary-600" />
                        <span className="min-w-0 truncate text-sm font-bold text-gray-900 dark:text-white">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm">
                            <Link to="/" className="gap-2">
                                <ArrowLeft className="h-4 w-4" /> Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
                <PortfolioPreview result={portfolio} />
            </main>
        </div>
    );
};
