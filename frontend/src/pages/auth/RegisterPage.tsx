import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BookOpen, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';
import { BackgroundAnimation } from '../../components/common/BackgroundAnimation';

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
    const registerUser = useAuthStore((state) => state.register);
    const login = useAuthStore((state) => state.login);

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
            });

            // Auto login after register
            await login({ username: data.email, password: data.password });

            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="relative min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <BackgroundAnimation />
            <div className="w-full max-w-md p-8 space-y-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-white/50 dark:border-gray-800 relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center mb-6">
                        <BookOpen className="h-12 w-12 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Create an account</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">Join Mindporium to start learning</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <Input
                            {...register('fullName')}
                            placeholder="John Doe"
                            className={`h-11 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-all ${errors.fullName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <Input
                            {...register('email')}
                            type="email"
                            placeholder="you@example.com"
                            className={`h-11 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-all ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>



                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <Input
                            {...register('password')}
                            type="password"
                            placeholder="••••••••"
                            className={`h-11 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-all ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                        <Input
                            {...register('confirmPassword')}
                            type="password"
                            placeholder="••••••••"
                            className={`h-11 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-all ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                    </div>

                    <Button type="submit" className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary-200 hover:shadow-primary-300 transition-all transform hover:-translate-y-0.5" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Creating account...</span>
                            </>
                        ) : (
                            "Create account"
                        )}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                    <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};
