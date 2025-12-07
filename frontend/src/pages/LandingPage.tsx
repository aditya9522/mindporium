import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, CheckCircle, PlayCircle, Users } from 'lucide-react';

export const LandingPage = () => {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 -z-10" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
                        Unlock Your Potential with <span className="text-primary-600">Mindporium</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                        The premium learning platform designed for the modern era. Master new skills with expert-led courses, live classes, and a vibrant community.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <Button size="lg" className="w-full sm:w-auto gap-2">
                                Get Started <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link to="/courses">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                                Browse Courses <PlayCircle className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Expert Instructors", desc: "Learn from industry leaders and experienced professionals.", icon: Users },
                            { title: "Interactive Learning", desc: "Engage with live classes, quizzes, and hands-on projects.", icon: PlayCircle },
                            { title: "Certified Growth", desc: "Earn certificates and track your progress as you master new skills.", icon: CheckCircle },
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                                    <feature.icon className="h-6 w-6 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
