import api from '../lib/axios';
import type { ReferralInfo, ReferralInviteResponse } from '../types/referral';

export const referralService = {
    getInfo: async (): Promise<ReferralInfo> => {
        const response = await api.get<ReferralInfo>('/auth/referrals/info');
        return response.data;
    },

    invite: async (email: string): Promise<ReferralInviteResponse> => {
        const response = await api.post<ReferralInviteResponse>('/auth/referrals/invite', { email });
        return response.data;
    },
};
