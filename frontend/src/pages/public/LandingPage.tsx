import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
    ArrowRight, PlayCircle,
    Globe, Award, BookOpen, Zap, LifeBuoy,
    ChevronRight, Layout, MessageSquare, Brain
} from 'lucide-react';
import { BackgroundAnimation } from '../../components/common/BackgroundAnimation';
import api from '../../lib/axios';

export const LandingPage = () => {
    const [stats, setStats] = useState({
        students: 0,
        courses: 0,
        instructors: 0,
        success_rate: 95
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/public/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        fetchStats();
    }, []);
    return (
        <div className="flex flex-col w-full bg-transparent">
            {/* Background Animation */}
            <BackgroundAnimation />

            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="animate-in fade-in slide-in-from-top-8 duration-1000">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-bold mb-6 border border-primary-200 dark:border-primary-800/50">
                            <Zap className="w-4 h-4" /> The Future of Learning is Here
                        </span>
                        <h1 className="text-5xl md:text-8xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8 leading-[1.1]">
                            Master Your Future with <br />
                            <span className="bg-clip-text text-transparent bg-linear-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">
                                Mindporium
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                            Experience the most advanced learning ecosystem. From live interactive classrooms to AI-powered analytics, we provide everything you need to excel in the digital age.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link to="/register" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full px-10 py-7 text-lg gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-2xl shadow-primary-500/20 transition-all hover:scale-105 active:scale-95">
                                    Start Learning Now <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/courses" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full px-10 py-7 text-lg gap-2 bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-800 rounded-2xl hover:bg-white dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95 backdrop-blur-md">
                                    Explore Catalog <PlayCircle className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 max-w-5xl mx-auto">
                            {[
                                { label: "Students", val: `${stats.students.toLocaleString()}+` },
                                { label: "Courses", val: `${stats.courses.toLocaleString()}+` },
                                { label: "Instructors", val: `${stats.instructors.toLocaleString()}+` },
                                { label: "Success Rate", val: `${stats.success_rate}%` },
                            ].map((stat, i) => (
                                <div key={i} className="text-center group">
                                    <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{stat.val}</div>
                                    <div className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Services Section */}
            <section className="py-24 relative z-10 bg-white/30 dark:bg-gray-900/30 backdrop-blur-3xl border-y border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">A Complete Learning Ecosystem</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">We've built Mindporium with all the tools necessary for a seamless and high-impact educational journey.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Live Classrooms",
                                desc: "Join real-time interactive sessions with high-quality video and low latency streaming.",
                                icon: Globe,
                                color: "bg-blue-500"
                            },
                            {
                                title: "Community QA",
                                desc: "Get your doubts cleared instantly by peers and professional instructors in our vibrant community.",
                                icon: LifeBuoy,
                                color: "bg-indigo-500"
                            },
                            {
                                title: "Expert Assessments",
                                desc: "Evaluate your knowledge with real-world tests, automated grading, and deep performance insights.",
                                icon: Award,
                                color: "bg-purple-500"
                            },
                            {
                                title: "Rich Course Materials",
                                desc: "Access high-quality PDFs, notes, and resources tailored for each module of your course.",
                                icon: BookOpen,
                                color: "bg-amber-500"
                            },
                            {
                                title: "AI Learning Path",
                                desc: "Personalized course recommendations based on your progress and career goals.",
                                icon: Zap,
                                color: "bg-emerald-500"
                            },
                            {
                                title: "Interactive Chatbot",
                                desc: "24/7 AI assistance to help you navigate through concepts and resolve queries instantly.",
                                icon: MessageSquare,
                                color: "bg-rose-500"
                            },
                        ].map((service, i) => (
                            <div
                                key={i}
                                className="group p-8 rounded-3xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary-500/50 transition-all hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-2 duration-500"
                            >
                                <div className={`w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
                                    <service.icon className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{service.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{service.desc}</p>
                                <div className="flex items-center text-primary-600 dark:text-primary-400 font-bold text-sm">
                                    Learn More <ChevronRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-32 relative z-10 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8 animate-in slide-in-from-left-8 duration-1000">
                            <h2 className="text-5xl font-black text-gray-900 dark:text-white leading-tight">
                                Transform Your Life in <br />
                                <span className="text-primary-600 dark:text-primary-400">4 Simple Steps</span>
                            </h2>
                            <div className="space-y-8">
                                {[
                                    { step: "01", title: "Create Account", desc: "Join our platform in seconds and set up your personalized learning profile." },
                                    { step: "02", title: "Pick Your Course", desc: "Browse hundreds of expert-led courses across technology, business, and arts." },
                                    { step: "03", title: "Learn & Interact", desc: "Watch videos, join live classes, and engage with our expert community." },
                                    { step: "04", title: "Track Growth", desc: "Monitor your progress, submit assessments, and achieve your goals with real-time feedback." },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 items-start group">
                                        <div className="text-4xl font-black text-primary-600/20 dark:text-primary-400/20 group-hover:text-primary-600 transition-colors">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-linear-to-r from-primary-500 to-indigo-600 rounded-[3rem] blur-3xl opacity-20 animate-pulse"></div>
                            <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 p-8 shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <div className="w-32 h-32 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                                        <Award className="w-16 h-16 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">Start Your Journey</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto">Mindporium provides the tools. You provide the curiosity.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Smart Progress Tracking Section */}
            <section className="py-24 relative z-10 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-linear-to-br from-indigo-900 to-primary-900 rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform translate-x-24 pointer-events-none"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Smart Progress <br /> & Performance Tracking</h2>
                                <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                                    Visualize your learning journey with our advanced analytics dashboard. Monitor attendance, test scores, and completion rates in real-time.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        { icon: Layout, text: "Comprehensive Student Dashboard" },
                                        { icon: Brain, text: "AI-Powered Strengths Analysis" },
                                        { icon: Zap, text: "Real-time Attendance Monitoring" },
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 font-semibold text-lg">
                                            <div className="p-1 bg-primary-500/30 rounded-lg">
                                                <item.icon className="w-5 h-5 text-primary-300" />
                                            </div>
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-primary-500 rounded-[2rem] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 aspect-video flex items-center justify-center">
                                    <div className="w-full space-y-6">
                                        <div className="h-4 w-3/4 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full w-2/3 bg-primary-400 rounded-full"></div>
                                        </div>
                                        <div className="h-4 w-1/2 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full w-1/2 bg-indigo-400 rounded-full"></div>
                                        </div>
                                        <div className="h-4 w-5/6 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full w-3/4 bg-emerald-400 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 relative z-10 overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-linear-to-br from-primary-600 to-indigo-700 rounded-[3rem] p-16 md:p-24 shadow-2xl relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                    <div className="relative z-10 space-y-8 animate-in zoom-in duration-700">
                        <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
                            Ready to Elevate <br /> Your Learning?
                        </h2>
                        <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                            Join thousands of students who are already mastering new skills. Get started today and get 20% off your first course.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link to="/register">
                                <Button size="lg" className="w-full sm:w-auto px-10 py-7 text-xl bg-white text-primary-700 hover:bg-gray-100 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 border-0 font-black uppercase tracking-tight">
                                    Get Started for Free
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
