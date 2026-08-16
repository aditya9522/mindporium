import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import authSignupIllustration from '../../assets/auth-signup-illustration.svg';

interface GoogleCredentialResponse {
    credential: string;
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (error as { response?: { data?: { detail?: string } } }).response;
        return response?.data?.detail || fallback;
    }
    return fallback;
};

const registerSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.literal("student"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const refCode = searchParams.get('ref');
    const registerUser = useAuthStore((state) => state.register);
    const login = useAuthStore((state) => state.login);
    const signupWithGoogle = useAuthStore((state) => state.signupWithGoogle);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const initializeGoogle = () => {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
                    callback: async (response: GoogleCredentialResponse) => {
                        try {
                            const user = await signupWithGoogle(response.credential, refCode || undefined);
                            toast.success('Welcome to Mindporium!');
                            if (user.role === 'admin') {
                                navigate('/admin/dashboard');
                            } else if (user.role === 'instructor') {
                                navigate('/instructor/dashboard');
                            } else {
                                navigate('/dashboard');
                            }
                        } catch (error: unknown) {
                            toast.error(getApiErrorMessage(error, 'Google sign up failed'));
                        }
                    },
                    cancel_on_tap_outside: false
                });

                window.google.accounts.id.renderButton(
                    document.getElementById("googleSignUpButton"),
                    { 
                        theme: "outline", 
                        size: "large", 
                        width: 382,
                        text: "signup_with",
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
    }, [navigate, signupWithGoogle, refCode]);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: "student",
        }
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            await registerUser({
                email: data.email,
                full_name: data.fullName,
                password: data.password,
                role: data.role,
                ...(refCode && { referral_code: refCode })
            });

            // Auto login after register
            await login({ username: data.email, password: data.password });

            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, 'Registration failed'));
        }
    };

    return (
        <div className="min-h-screen flex bg-linear-to-br from-primary-50 via-white to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-primary-950 transition-colors duration-300">
            {/* Left Side: Side Image panel (visible on md and up) */}
            <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_78%_20%,rgba(244,114,182,0.18),transparent_28%)]" />
                
                <div className="absolute inset-0 flex flex-col p-16 z-20 text-gray-950 dark:text-white animate-in fade-in duration-700">
                    <div className="flex flex-1 flex-col justify-center space-y-6">
                        <img
                            src={authSignupIllustration}
                            alt="Growth mindset illustration"
                            className="mx-auto w-full max-w-[420px] xl:max-w-[460px] drop-shadow-[0_24px_40px_rgba(37,99,235,0.18)]"
                        />
                        <div className="space-y-4">
                            <span className="text-xs font-semibold tracking-wider text-primary-700 dark:text-primary-300 uppercase bg-white/80 dark:bg-primary-950/60 px-3 py-1.5 rounded-full border border-primary-100 dark:border-primary-800/40 inline-block">Join 10,000+ Learners</span>
                            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">Start Your Learning Journey Today.</h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Create your free account and get instant access to courses, AI mentoring, interactive classrooms, and a global learning community.</p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 overflow-y-auto">
                <div className="w-full max-w-md space-y-6 animate-in slide-in-from-right duration-500 py-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Create account</h2>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Join Mindporium and start your learning journey</p>
                    </div>

                    {/* Google Signup Container */}
                    <div className="w-full">
                        <div id="googleSignUpButton" className="w-full flex justify-center py-0.5" />
                    </div>

                    <div className="relative flex items-center my-6">
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                        <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest bg-white dark:bg-gray-950 px-2">or sign up with email</span>
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                            <Input
                                {...register('fullName')}
                                placeholder="John Doe"
                                className={`h-11 rounded-xl bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 transition-all ${errors.fullName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                            {errors.fullName && <p className="text-xs text-red-500 font-medium">{errors.fullName.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</label>
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="you@example.com"
                                className={`h-11 rounded-xl bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 transition-all ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Input
                                    {...register('password')}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`h-11 rounded-xl bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 transition-all pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Confirm Password</label>
                            <div className="relative">
                                <Input
                                    {...register('confirmPassword')}
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`h-11 rounded-xl bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 transition-all pr-10 ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
                        </div>

                        <Button type="submit" className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold shadow-md shadow-primary-200/50 dark:shadow-none hover:shadow-primary-300 bg-primary-600 hover:bg-primary-700 text-white transition-all transform hover:-translate-y-0.5 mt-2" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                "Create account"
                            )}
                        </Button>
                    </form>

                    <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                        By creating an account, you agree to our{' '}
                        <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>.
                    </p>

                    <div className="text-center text-sm font-medium">
                        <span className="text-gray-500 dark:text-gray-400">Already have an account? </span>
                        <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
