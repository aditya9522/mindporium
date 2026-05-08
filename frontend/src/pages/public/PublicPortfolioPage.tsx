import { Link, useParams } from 'react-router-dom';
import { Globe2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { PortfolioResult } from '../../services/career-tools.service';
import { PortfolioPreview } from '../student/career-tools/PortfolioBuilderPage';

const PORTFOLIO_STORAGE_KEY = 'mindporium_public_portfolios';

export const PublicPortfolioPage = () => {
    const { slug } = useParams();
    const portfolios = JSON.parse(localStorage.getItem(PORTFOLIO_STORAGE_KEY) || '{}') as Record<string, PortfolioResult>;
    const portfolio = slug ? portfolios[slug] : null;

    if (!portfolio) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <Globe2 className="mx-auto h-12 w-12 text-gray-300" />
                    <h1 className="mt-4 text-xl font-bold text-gray-900">Portfolio preview not found</h1>
                    <p className="mt-2 text-sm text-gray-500">This preview may have been removed from this browser.</p>
                    <Button asChild className="mt-6">
                        <Link to="/">Go Home</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-2">
                        <Globe2 className="h-5 w-5 text-primary-600" />
                        <span className="text-sm font-bold text-gray-900">Mindporium Portfolio</span>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link to="/login">Sign In</Link>
                    </Button>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <PortfolioPreview result={portfolio} />
                </div>
            </main>
        </div>
    );
};
