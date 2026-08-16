export interface ReferralRecord {
    email: string | null;
    status: 'pending' | 'registered' | 'completed' | string;
    date: string;
}

export interface ReferralInfo {
    referral_code: string;
    referral_link: string;
    referrals: ReferralRecord[];
}

export interface ReferralInviteResponse {
    message: string;
    success: boolean;
    referral_link: string;
}
