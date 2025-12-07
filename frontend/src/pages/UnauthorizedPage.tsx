import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldAlert } from 'lucide-react';

export const UnauthorizedPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                    <ShieldAlert className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
                <p className="text-lg text-gray-600 mb-8">
                    You don't have permission to access this page.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link to="/dashboard">
                        <Button>Go to Dashboard</Button>
                    </Link>
                    <Link to="/">
                        <Button variant="outline">Go Home</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
