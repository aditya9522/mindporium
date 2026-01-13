
import { useState, useRef, useEffect, type ClipboardEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { BackgroundAnimation } from '../../components/common/BackgroundAnimation';

export const VerifyOTPPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const [isLoading, setIsLoading] = useState(false);
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, [email, navigate]);

    const handleChange = (index: number, value: string) => {
        // Allow only numbers
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Move to previous input on backspace if current is empty
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
        if (pastedData.every(char => /^\d$/.test(char))) {
            const newOtp = [...otp];
            pastedData.forEach((char, index) => {
                if (index < 6) newOtp[index] = char;
            });
            setOtp(newOtp);
            inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length !== 6) {
            toast.error("Please enter a complete 6-digit OTP");
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/auth/verify-otp', {
                email,
                otp: otpString,
            });
            toast.success(response.data.message || 'OTP verified successfully');
            // Navigate to reset password page
            navigate('/reset-password', { state: { email, otp: otpString } });
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
            setOtp(new Array(6).fill(""));
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            toast.error('Failed to resend OTP');
        }
    };

    if (!email) return null;

    return (
        <div className="relative min-h-[90vh] flex items-center justify-center py-12 px-4">
            <BackgroundAnimation />
            <div className="w-full max-w-md p-8 space-y-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-white/50 dark:border-gray-800 relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center mb-6">
                        <Shield className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Verify Identity</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">
                        Enter the 6-digit code sent to <br />
                        <span className="font-bold text-gray-800 dark:text-gray-200">{email}</span>
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-8">
                    <div className="flex justify-center gap-2 sm:gap-4">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm focus:shadow-md"
                            />
                        ))}
                    </div>

                    <Button type="submit" className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary-200 dark:shadow-none hover:shadow-primary-300 dark:hover:shadow-none transition-all transform hover:-translate-y-0.5" size="lg" disabled={isLoading}>
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            "Verify OTP"
                        )}
                    </Button>
                </form>

                <div className="text-center space-y-4">
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-500 transition-colors"
                    >
                        Resend Code
                    </button>
                    <div className="text-sm">
                        <Link to="/login" className="font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                            ← Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
