export const EXPIRY_OPTIONS = [
  { minutes: 10, label: "10 minutes" },
  { minutes: 60, label: "1 hour" },
  { minutes: 1440, label: "1 day" },
  { minutes: 10080, label: "7 days" },
] as const;

export const MAX_VIEWS_OPTIONS = [
  { value: 1, label: "1 view (single use)" },
  { value: 3, label: "3 views" },
  { value: 5, label: "5 views" },
  { value: 10, label: "10 views" },
  { value: null, label: "Unlimited (until expiry)" },
] as const;

export interface CreatedSecret {
  token: string;
  expiresAt: string;
  maxViews: number | null;
}

export interface MySecret {
  _id: string;
  token: string;
  label: string;
  expiresAt: string;
  maxViews: number | null;
  viewCount: number;
  viewLog: string[];
  viewedAt: string | null;
  isRevoked: boolean;
  requireAuth: boolean;
  hasPassphrase: boolean;
  createdAt: string;
}

export interface SecretPeek {
  maxViews: number | null;
  viewCount: number;
  expiresAt: string;
  hasPassphrase: boolean;
  requireAuth: boolean;
}

export interface RevealedSecret {
  content: string;
  viewCount: number;
  maxViews: number | null;
}
