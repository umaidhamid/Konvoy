export const DIFF_EXPIRY_OPTIONS = [
  { minutes: 10, label: "10 minutes" },
  { minutes: 60, label: "1 hour" },
  { minutes: 1440, label: "1 day" },
  { minutes: 10080, label: "7 days" },
  { minutes: 43200, label: "30 days" },
] as const;

export const DIFF_MAX_VIEWS_OPTIONS = [
  { value: 1, label: "1 view (one-time)" },
  { value: 3, label: "3 views" },
  { value: 5, label: "5 views" },
  { value: 10, label: "10 views" },
  { value: null, label: "Unlimited (until expiry)" },
] as const;

export interface CreatedDiffShare {
  token: string;
  expiresAt: string;
  maxViews: number | null;
}

export interface MyDiffShare {
  _id: string;
  token: string;
  title: string;
  leftLabel: string;
  rightLabel: string;
  language: string;
  viewCount: number;
  maxViews: number | null;
  createdAt: string;
  expiresAt: string;
}

export interface DiffShareContent {
  title: string;
  leftLabel: string;
  rightLabel: string;
  leftContent: string;
  rightContent: string;
  language: string;
  viewCount: number;
  maxViews: number | null;
  createdAt: string;
  expiresAt: string;
}
