import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Navbar />
            <main className="grow relative z-10">
                <Outlet />
            </main>
            <footer className="relative z-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                                <span className="text-white font-black text-xl">M</span>
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">
                                MIND<span className="text-primary-600 dark:text-primary-400">PORIUM</span>
                            </span>
                        </div>

                        <div className="h-px w-24 bg-gray-200 dark:bg-gray-800"></div>

                        <p className="text-sm text-gray-500 dark:text-gray-500 font-medium text-center">
                            © {new Date().getFullYear()} Mindporium. All rights reserved. <br />
                            <span className="text-xs mt-2 block opacity-50">Made with ❤️ by India</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
