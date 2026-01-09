import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 py-12 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Mindporium. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};
