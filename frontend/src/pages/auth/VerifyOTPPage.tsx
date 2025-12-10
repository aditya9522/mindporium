
import { useState, useRef, useEffect, type ClipboardEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

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
        <div className="flex items-center justify-center min-h-[80vh] py-12">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 mb-4 animate-bounce">
                        <Shield className="h-6 w-6 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Verify Identity</h2>
                    <p className="mt-2 text-gray-600">
                        Enter the 6-digit code sent to <br />
                        <span className="font-semibold text-gray-800">{email}</span>
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
                                className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm focus:shadow-md"
                            />
                        ))}
                    </div>

                    <Button type="submit" className="w-full py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" size="lg" disabled={isLoading}>
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
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                        Resend Code
                    </button>
                    <div className="text-sm">
                        <Link to="/login" className="font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            ← Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
