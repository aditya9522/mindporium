import api from '../lib/axios';
import type { CouponCreatePayload, CouponCreateResponse, CouponValidationResponse } from '../types/coupon';

export const couponService = {
    validate: async (code: string): Promise<CouponValidationResponse> => {
        const response = await api.post<CouponValidationResponse>('/courses/coupons/validate', { code });
        return response.data;
    },

    create: async (payload: CouponCreatePayload): Promise<CouponCreateResponse> => {
        const response = await api.post<CouponCreateResponse>('/courses/coupons/create', payload);
        return response.data;
    },
};
