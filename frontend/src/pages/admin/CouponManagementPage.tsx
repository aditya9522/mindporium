import { useMemo, useState } from 'react';
import type React from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Clipboard, Copy, Percent, RefreshCw, ShieldCheck, Sparkles, Ticket, Wand2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { couponService } from '../../services/coupon.service';
import type { CouponCreatePayload, CouponValidationResponse } from '../../types/coupon';

const makeCouponCode = () => {
    const chunk = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `MIND-${chunk}`;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (error as { response?: { data?: { detail?: string } } }).response;
        return response?.data?.detail || fallback;
    }
    return fallback;
};

export const CouponManagementPage = () => {
    const [formData, setFormData] = useState<CouponCreatePayload>({
        code: makeCouponCode(),
        discount_percent: 10,
        valid_until: '',
        max_uses: 1,
    });
    const [validateCode, setValidateCode] = useState('');
    const [validation, setValidation] = useState<CouponValidationResponse | null>(null);
    const [creating, setCreating] = useState(false);
    const [validating, setValidating] = useState(false);
    const [lastCreated, setLastCreated] = useState<CouponValidationResponse | null>(null);

    const payload = useMemo<CouponCreatePayload>(() => ({
        code: formData.code.trim().toUpperCase(),
        discount_percent: Number(formData.discount_percent),
        valid_until: formData.valid_until ? `${formData.valid_until}T23:59:59` : null,
        max_uses: Number(formData.max_uses),
    }), [formData]);

    const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setCreating(true);
        try {
            const response = await couponService.create(payload);
            const created = {
                valid: true,
                code: response.coupon.code,
                discount_percent: response.coupon.discount,
            };
            setLastCreated(created);
            setValidateCode(response.coupon.code);
            toast.success('Coupon created successfully');
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, 'Failed to create coupon'));
        } finally {
            setCreating(false);
        }
    };

    const handleValidate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validateCode.trim()) return;
        setValidating(true);
        setValidation(null);
        try {
            const result = await couponService.validate(validateCode.trim().toUpperCase());
            setValidation(result);
            toast.success(`${result.code} is valid`);
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, 'Coupon is not valid'));
        } finally {
            setValidating(false);
        }
    };

    const handleCopy = async (code: string) => {
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
            toast.success('Coupon code copied');
        } catch {
            toast.error('Clipboard access is unavailable');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 text-gray-950 transition-colors dark:bg-gray-950 dark:text-gray-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                    <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
                        <div className="p-6 sm:p-8">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                                    <Ticket className="h-3.5 w-3.5" />
                                    Coupon System
                                </span>
                                <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300">
                                    Admin only
                                </span>
                            </div>
                            <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl">Create and verify discount coupons</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                                Generate backend-backed coupon codes for enrollment checkout. Use validation to confirm active status, expiry, and usage limits before sharing a code.
                            </p>
                        </div>
                        <div className="border-t border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-950/50 sm:p-8 lg:border-l lg:border-t-0">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Current Draft</p>
                            <div className="mt-4 rounded-2xl border border-dashed border-primary-200 bg-white p-5 dark:border-primary-900/60 dark:bg-gray-900">
                                <div className="flex items-center justify-between gap-3">
                                    <code className="break-all text-2xl font-black tracking-wide text-primary-700 dark:text-primary-300">{payload.code || 'CODE'}</code>
                                    <Button type="button" size="icon" variant="outline" title="Copy draft code" aria-label="Copy draft code" onClick={() => handleCopy(payload.code)}>
                                        <Clipboard className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="mt-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    {payload.discount_percent || 0}% off, {payload.max_uses || 0} use{payload.max_uses === 1 ? '' : 's'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                    <form onSubmit={handleCreate} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="flex items-center gap-2 text-lg font-black text-gray-900 dark:text-gray-100">
                            <span className="rounded-xl bg-primary-50 p-2 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
                                <Wand2 className="h-5 w-5" />
                            </span>
                            Generate Coupon
                        </h2>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="text-xs font-black uppercase tracking-wide text-gray-500 dark:text-gray-400">Code</label>
                                <div className="mt-2 flex gap-2">
                                    <Input
                                        required
                                        value={formData.code}
                                        onChange={(event) => setFormData((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
                                        className="h-12 rounded-xl font-bold uppercase"
                                        placeholder="MIND-SAVE10"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-12 w-12 shrink-0"
                                        title="Generate code"
                                        aria-label="Generate code"
                                        onClick={() => setFormData((current) => ({ ...current, code: makeCouponCode() }))}
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-wide text-gray-500 dark:text-gray-400">Discount Percent</label>
                                <Input
                                    required
                                    type="number"
                                    min={1}
                                    max={100}
                                    step={0.5}
                                    value={formData.discount_percent}
                                    onChange={(event) => setFormData((current) => ({ ...current, discount_percent: Number(event.target.value) }))}
                                    className="mt-2 h-12 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-wide text-gray-500 dark:text-gray-400">Max Uses</label>
                                <Input
                                    required
                                    type="number"
                                    min={1}
                                    value={formData.max_uses}
                                    onChange={(event) => setFormData((current) => ({ ...current, max_uses: Number(event.target.value) }))}
                                    className="mt-2 h-12 rounded-xl"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-black uppercase tracking-wide text-gray-500 dark:text-gray-400">Valid Until</label>
                                <Input
                                    type="date"
                                    value={formData.valid_until ?? ''}
                                    onChange={(event) => setFormData((current) => ({ ...current, valid_until: event.target.value }))}
                                    className="mt-2 h-12 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/50">
                            <p className="text-xs font-black uppercase tracking-wide text-gray-500 dark:text-gray-400">Backend Payload</p>
                            <pre className="mt-3 overflow-auto rounded-xl bg-gray-950 p-4 text-xs text-gray-100">
                                {JSON.stringify(payload, null, 2)}
                            </pre>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setFormData({ code: makeCouponCode(), discount_percent: 10, valid_until: '', max_uses: 1 })}>
                                Reset
                            </Button>
                            <Button type="submit" isLoading={creating}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Create Coupon
                            </Button>
                        </div>
                    </form>

                    <div className="space-y-6">
                        <form onSubmit={handleValidate} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                            <h2 className="flex items-center gap-2 text-lg font-black text-gray-900 dark:text-gray-100">
                                <span className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                                    <ShieldCheck className="h-5 w-5" />
                                </span>
                                Validate Code
                            </h2>
                            <div className="mt-5 flex gap-2">
                                <Input
                                    value={validateCode}
                                    onChange={(event) => setValidateCode(event.target.value.toUpperCase())}
                                    placeholder="MIND-SAVE10"
                                    className="h-12 rounded-xl font-bold uppercase"
                                />
                                <Button type="submit" className="h-12 shrink-0" isLoading={validating}>
                                    Check
                                </Button>
                            </div>

                            {validation && (
                                <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <div>
                                            <p className="font-black">{validation.code} is valid</p>
                                            <p className="text-sm font-semibold opacity-80">{validation.discount_percent}% discount available</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                            <h2 className="flex items-center gap-2 text-lg font-black text-gray-900 dark:text-gray-100">
                                <span className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
                                    <Percent className="h-5 w-5" />
                                </span>
                                Last Created
                            </h2>
                            {lastCreated ? (
                                <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/50">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-wide text-gray-500">Coupon Code</p>
                                            <p className="mt-1 break-all text-2xl font-black text-gray-950 dark:text-white">{lastCreated.code}</p>
                                        </div>
                                        <Button type="button" size="icon" variant="outline" title="Copy coupon code" aria-label="Copy coupon code" onClick={() => handleCopy(lastCreated.code)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-gray-500 dark:text-gray-400">{lastCreated.discount_percent}% off at enrollment checkout.</p>
                                </div>
                            ) : (
                                <p className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-950/50 dark:text-gray-400">
                                    Created coupons will appear here for quick copying during this session.
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
