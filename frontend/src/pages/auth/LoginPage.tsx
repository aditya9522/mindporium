import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BookOpen, Eye, EyeOff, Loader2, Compass, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import loginSideImage from '../../assets/login_side_image.png';

declare global {
    interface Window {
        google?: any;
    }
}

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    useEffect(() => {
        const initializeGoogle = () => {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
                    callback: async (response: any) => {
                        try {
                            const user = await loginWithGoogle(response.credential);
                            toast.success('Welcome to Mindporium!');
                            if (user.role === 'admin') {
                                navigate('/admin/dashboard');
                            } else if (user.role === 'instructor') {
                                navigate('/instructor/dashboard');
                            } else {
                                navigate('/dashboard');
                            }
                        } catch (err: any) {
                            toast.error(err.response?.data?.detail || 'Google sign in failed');
                        }
                    },
                    cancel_on_tap_outside: false
                });

                window.google.accounts.id.renderButton(
                    document.getElementById("googleSignInButton"),
                    { 
                        theme: "outline", 
                        size: "large", 
                        width: 382,
                        text: "signin_with",
                        shape: "rectangular"
                    }
                );
            }
        };

        initializeGoogle();

        const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (script) {
            script.addEventListener('load', initializeGoogle);
        }

        return () => {
            if (script) {
                script.removeEventListener('load', initializeGoogle);
            }
        };
    }, [navigate, loginWithGoogle]);

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const user = await login({ username: data.email, password: data.password });
            toast.success('Welcome back!');

            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role === 'instructor') {
                navigate('/instructor/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            {/* Left Side: Side Image panel (visible on md and up) */}
            <div className="hidden md:flex md:w-1/2 relative bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${loginSideImage})` }}>
                {/* Visual overlays to give premium contrast */}
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-950/90 via-gray-950/70 to-indigo-950/50 backdrop-blur-[2px]" />
                
                {/* Content Panel */}
                <div className="absolute inset-0 flex flex-col justify-between p-16 z-20 text-white animate-in fade-in duration-700">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-600/20 p-2.5 rounded-2xl backdrop-blur-xl border border-white/10">
                            <BookOpen className="h-8 w-8 text-primary-400" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-primary-300 bg-clip-text text-transparent">Mindporium</span>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <span className="text-xs font-semibold tracking-wider text-primary-300 uppercase bg-primary-950/60 px-3 py-1.5 rounded-full border border-primary-800/40 inline-block">Elevate Your Learning</span>
                            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">Unlock Your Cognitive Potential.</h1>
                            <p className="text-lg text-gray-300 font-medium">A state-of-the-art learning platform crafted for students, educators, and creators who demand visual excellence and high performance.</p>
                        </div>

                        <div className="grid gap-4 mt-8">
                            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                                <Compass className="h-6 w-6 text-primary-400 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-sm">Interactive Classrooms</h4>
                                    <p className="text-xs text-gray-400">Engage in collaborative workspace learning</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                                <CheckCircle2 className="h-6 w-6 text-primary-400 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-sm">Custom AI Mentoring</h4>
                                    <p className="text-xs text-gray-400">Personalized feedback tailored to your goals</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                                <ShieldCheck className="h-6 w-6 text-primary-400 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-sm">Enterprise Security</h4>
                                    <p className="text-xs text-gray-400">Safe payments, verifiable credentials & SSO</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-gray-400 font-medium">
                        © {new Date().getFullYear()} Mindporium Inc. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
                <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right duration-500">
                    <div className="text-center md:text-left">
                        {/* Logo for mobile view */}
                        <div className="inline-flex md:hidden items-center gap-2 mb-6">
                            <BookOpen className="h-10 w-10 text-primary-600" />
                            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Mindporium</span>
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Welcome back</h2>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Sign in to your account to continue your learning journey</p>
                    </div>

                    {/* Google Login Container */}
                    <div className="w-full">
                        <div id="googleSignInButton" className="w-full flex justify-center py-0.5" />
                    </div>

                    <div className="relative flex items-center my-6">
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                        <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest bg-gray-50 dark:bg-gray-950 px-2">or continue with</span>
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</label>
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="you@example.com"
                                className={`h-11 rounded-xl bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-all ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                            {errors.email && <p className="text-xs text-red-500 font-medium mt-1">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Password</label>
                                <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    {...register('password')}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`h-11 rounded-xl bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-all pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 font-medium mt-1">{errors.password.message}</p>}
                        </div>

                        <Button type="submit" className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold shadow-md shadow-primary-200/50 dark:shadow-none hover:shadow-primary-300 dark:hover:shadow-none bg-primary-600 hover:bg-primary-700 text-white transition-all transform hover:-translate-y-0.5" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm font-medium">
                        <span className="text-gray-500 dark:text-gray-400">Don't have an account? </span>
                        <Link to="/register" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
