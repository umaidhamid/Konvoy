export interface ReferredUser {
  fullname: string;
  email: string;
  verified: boolean;
  joinedAt: string;
  rewardEarned: boolean;
}

export interface MyReferralInfo {
  referralCode: string;
  bonusStorageBytes: number;
  rewardBytesPerReferral: number;
  referredUsers: ReferredUser[];
  totalReferred: number;
  totalVerifiedReferrals: number;
}
