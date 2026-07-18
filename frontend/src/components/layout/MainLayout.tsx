import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, Mail, Globe, Shield, BookMarked, Users } from 'lucide-react';

export const MainLayout = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Navbar />
            <main className="grow relative z-10">
                <Outlet />
            </main>

            {isHomePage && (
                <footer className="relative z-10 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Main Footer Content */}
                        <div className="pt-16 pb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                            {/* Brand Column */}
                            <div className="lg:col-span-1 space-y-5">
                                <Link to="/" className="flex items-center gap-3 group w-fit">
                                    <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform">
                                        <span className="text-white font-black text-xl">M</span>
                                    </div>
                                    <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white">
                                        MIND<span className="text-primary-600 dark:text-primary-400">PORIUM</span>
                                    </span>
                                </Link>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                                    A state-of-the-art learning platform crafted for students, educators, and creators who demand excellence.
                                </p>
                                <div className="flex items-center gap-3 pt-1">
                                    <a href="#" aria-label="Twitter" className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                                        <Twitter className="w-4 h-4" />
                                    </a>
                                    <a href="#" aria-label="GitHub" className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                                        <Github className="w-4 h-4" />
                                    </a>
                                    <a href="#" aria-label="LinkedIn" className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                                        <Linkedin className="w-4 h-4" />
                                    </a>
                                    <a href="mailto:support@mindporium.ai" aria-label="Email" className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                                        <Mail className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>

                            {/* Explore Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-5">
                                    <Globe className="w-4 h-4 text-primary-500" />
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-gray-100">Explore</h4>
                                </div>
                                <nav className="space-y-3">
                                    {[
                                        { label: 'Courses', href: '/courses' },
                                        { label: 'Instructors', href: '/instructors' },
                                        { label: 'Community', href: '/community' },
                                        { label: 'News & Updates', href: '/news' },
                                        { label: 'Chatbot AI', href: '/chatbot' },
                                    ].map(link => (
                                        <Link key={link.href} to={link.href} className="flex text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                                            {link.label}
                                        </Link>
                                    ))}
                                </nav>
                            </div>

                            {/* Resources Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-5">
                                    <BookMarked className="w-4 h-4 text-primary-500" />
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-gray-100">For Students</h4>
                                </div>
                                <nav className="space-y-3">
                                    {[
                                        { label: 'My Learning', href: '/my-learning' },
                                        { label: 'My Notes', href: '/notes' },
                                        { label: 'Career Workspace', href: '/career/job-search' },
                                        { label: 'Classrooms', href: '/classrooms' },
                                        { label: 'Dashboard', href: '/dashboard' },
                                    ].map(link => (
                                        <Link key={link.href} to={link.href} className="flex text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                                            {link.label}
                                        </Link>
                                    ))}
                                </nav>
                            </div>

                            {/* Legal & Support Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-5">
                                    <Shield className="w-4 h-4 text-primary-500" />
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-gray-100">Support</h4>
                                </div>
                                <nav className="space-y-3">
                                    {[
                                        { label: 'Help Center', href: '#' },
                                        { label: 'Contact Us', href: '#' },
                                        { label: 'Privacy Policy', href: '#' },
                                        { label: 'Terms of Service', href: '#' },
                                        { label: 'Cookie Policy', href: '#' },
                                    ].map(link => (
                                        <Link key={link.label} to={link.href} className="flex text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                                            {link.label}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="py-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                © {new Date().getFullYear()} Mindporium Inc. All rights reserved.
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                <span>Built with</span>
                                <span className="text-red-400">❤️</span>
                                <span>in India</span>
                                <span className="mx-2 opacity-30">|</span>
                                <Users className="w-3 h-3" />
                                <span className="ml-1">Empowering Learners Worldwide</span>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};
