export interface CouponValidationResponse {
    valid: boolean;
    discount_percent: number;
    code: string;
}

export interface CouponCreatePayload {
    code: string;
    discount_percent: number;
    valid_until?: string | null;
    max_uses: number;
}

export interface CouponCreateResponse {
    message: string;
    coupon: {
        code: string;
        discount: number;
    };
}
