import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { BackgroundAnimation } from '../../components/common/BackgroundAnimation';

const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const otp = location.state?.otp;
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
    });

    if (!email || !otp) {
        navigate('/forgot-password');
        return null;
    }

    const onSubmit = async (data: ResetPasswordFormValues) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/reset-password', {
                email,
                otp,
                new_password: data.newPassword,
            });
            toast.success(response.data.message || 'Password reset successfully');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-[90vh] flex items-center justify-center py-12 px-4">
            <BackgroundAnimation />
            <div className="w-full max-w-md p-8 space-y-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center mb-6">
                        <Lock className="h-12 w-12 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Reset Password</h2>
                    <p className="mt-2 text-gray-500 font-medium">Enter your new password</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <Input
                            {...register('newPassword')}
                            type="password"
                            placeholder="••••••••"
                            className={errors.newPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                        <Input
                            {...register('confirmPassword')}
                            type="password"
                            placeholder="••••••••"
                            className={errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                    </div>

                    <Button type="submit" className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary-200 hover:shadow-primary-300 transition-all transform hover:-translate-y-0.5" size="lg" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Resetting...</span>
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};
