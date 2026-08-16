import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/auth.service';
import { BackgroundAnimation } from '../../components/common/BackgroundAnimation';

const setupPasswordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type SetupPasswordValues = z.infer<typeof setupPasswordSchema>;

const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (error as { response?: { data?: { detail?: string } } }).response;
        return response?.data?.detail || fallback;
    }
    return fallback;
};

export const SetupPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [completed, setCompleted] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SetupPasswordValues>({
        resolver: zodResolver(setupPasswordSchema),
    });

    const onSubmit = async (data: SetupPasswordValues) => {
        if (!token) {
            toast.error('Setup link is missing a token');
            return;
        }

        try {
            await authService.setupPassword(token, data.password);
            setCompleted(true);
            toast.success('Password set successfully');
            setTimeout(() => navigate('/login'), 1200);
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, 'This setup link is invalid or expired'));
        }
    };

    return (
        <div className="relative flex min-h-[90vh] items-center justify-center px-4 py-12">
            <BackgroundAnimation />
            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white/85 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/85 dark:shadow-none">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
                        {completed ? <CheckCircle2 className="h-8 w-8" /> : <KeyRound className="h-8 w-8" />}
                    </div>
                    <h1 className="mt-6 text-3xl font-black tracking-tight text-gray-950 dark:text-white">Set up your password</h1>
                    <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        Use the secure invite link from your welcome email to activate your staff account.
                    </p>
                </div>

                {!token && (
                    <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                        This setup link is missing a token. Please open the original welcome email link.
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wide text-gray-500 dark:text-gray-400">New Password</label>
                        <div className="relative">
                            <Input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter at least 8 characters"
                                className={`h-12 rounded-xl pr-11 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                disabled={!token || completed}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((current) => !current)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700 dark:hover:text-gray-200"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-sm font-medium text-red-500">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wide text-gray-500 dark:text-gray-400">Confirm Password</label>
                        <div className="relative">
                            <Input
                                {...register('confirmPassword')}
                                type={showConfirm ? 'text' : 'password'}
                                placeholder="Re-enter your password"
                                className={`h-12 rounded-xl pr-11 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                disabled={!token || completed}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((current) => !current)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700 dark:hover:text-gray-200"
                                aria-label={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'}
                                title={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'}
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-sm font-medium text-red-500">{errors.confirmPassword.message}</p>}
                    </div>

                    <Button type="submit" className="h-12 w-full rounded-xl text-base font-bold" disabled={!token || completed} isLoading={isSubmitting}>
                        {!isSubmitting && <ShieldCheck className="mr-2 h-5 w-5" />}
                        {isSubmitting ? 'Setting password' : 'Activate Account'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <Link to="/login" className="font-bold text-primary-600 transition hover:text-primary-500 dark:text-primary-400">
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};
