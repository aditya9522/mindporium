import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';
import { useState } from 'react';

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

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
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 mb-4">
                        <BookOpen className="h-6 w-6 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                    <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <Input
                            {...register('email')}
                            type="email"
                            placeholder="you@example.com"
                            className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                {...register('password')}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={errors.password ? "border-red-500 focus-visible:ring-red-500 pr-10" : "pr-10"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-gray-600">Don't have an account? </span>
                    <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
};
