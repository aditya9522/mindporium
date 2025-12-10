import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/forgot-password', data);
            toast.success(response.data.message || 'OTP sent to your email');
            // Navigate to OTP verification page with email
            navigate('/verify-otp', { state: { email: data.email } });
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] py-12">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 mb-4">
                        <Mail className="h-6 w-6 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
                    <p className="mt-2 text-gray-600">Enter your email to receive an OTP</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <Input
                            {...register('email')}
                            type="email"
                            placeholder="you@example.com"
                            className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    <Button type="submit" className="w-full flex items-center justify-center gap-2" size="lg" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Sending...</span>
                            </>
                        ) : (
                            "Send OTP"
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
