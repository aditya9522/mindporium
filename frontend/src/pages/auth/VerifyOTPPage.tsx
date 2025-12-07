import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

const verifyOTPSchema = z.object({
    otp: z.string().length(6, "OTP must be 6 digits"),
});

type VerifyOTPFormValues = z.infer<typeof verifyOTPSchema>;

export const VerifyOTPPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<VerifyOTPFormValues>({
        resolver: zodResolver(verifyOTPSchema),
    });

    if (!email) {
        navigate('/forgot-password');
        return null;
    }

    const onSubmit = async (data: VerifyOTPFormValues) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/verify-otp', {
                email,
                otp: data.otp,
            });
            toast.success(response.data.message || 'OTP verified successfully');
            // Navigate to reset password page
            navigate('/reset-password', { state: { email, otp: data.otp } });
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('New OTP sent to your email');
        } catch (error: any) {
            toast.error('Failed to resend OTP');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] py-12">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 mb-4">
                        <Shield className="h-6 w-6 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Verify OTP</h2>
                    <p className="mt-2 text-gray-600">
                        Enter the 6-digit code sent to <br />
                        <span className="font-semibold">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">OTP Code</label>
                        <Input
                            {...register('otp')}
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            className={`text-center text-2xl tracking-widest ${errors.otp ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                        {errors.otp && <p className="text-sm text-red-500">{errors.otp.message}</p>}
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>
                </form>

                <div className="text-center space-y-2">
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-sm font-medium text-primary-600 hover:text-primary-500"
                    >
                        Resend OTP
                    </button>
                    <div className="text-sm">
                        <Link to="/login" className="font-medium text-gray-600 hover:text-gray-900">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
