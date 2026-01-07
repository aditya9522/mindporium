import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ArrowRight, CheckCircle, PlayCircle, Users } from 'lucide-react';
import { BackgroundAnimation } from '../../components/common/BackgroundAnimation';

export const LandingPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-900">
            {/* Background Animation */}
            <BackgroundAnimation />

            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-in fade-in zoom-in duration-700">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
                            Unlock Your Potential with <span className="text-primary-400">Mindporium</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                            The premium learning platform designed for the modern era. Master new skills with expert-led courses, live classes, and a vibrant community.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <div className="transition-transform hover:scale-105 active:scale-95">
                                <Link to="/register">
                                    <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary-600 hover:bg-primary-700 text-white border-0 shadow-lg shadow-primary-500/30">
                                        Get Started <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                            <div className="transition-transform hover:scale-105 active:scale-95">
                                <Link to="/courses">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white backdrop-blur-sm transition-all duration-300">
                                        Browse Courses <PlayCircle className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Expert Instructors", desc: "Learn from industry leaders and experienced professionals.", icon: Users },
                            { title: "Interactive Learning", desc: "Engage with live classes, quizzes, and hands-on projects.", icon: PlayCircle },
                            { title: "Certified Growth", desc: "Earn certificates and track your progress as you master new skills.", icon: CheckCircle },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-1 duration-300 animate-in slide-in-from-bottom-4 fade-in fill-mode-backwards"
                                style={{ animationDelay: `${i * 150}ms` }}
                            >
                                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-6">
                                    <feature.icon className="h-6 w-6 text-primary-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
