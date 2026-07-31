export type FeatureRequestStatus = "open" | "planned" | "in-progress" | "done" | "declined";

export interface FeatureRequest {
  _id: string;
  title: string;
  description: string;
  status: FeatureRequestStatus;
  createdBy: { _id: string; fullname?: string; email?: string; profileImage?: string } | string;
  createdAt: string;
  voteCount: number;
  hasVoted: boolean;
  isMine: boolean;
}
