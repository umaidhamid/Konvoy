export type BroadcastAudience = "all" | "verified" | "plan";

export interface SendBroadcastPayload {
  title: string;
  message: string;
  audience: BroadcastAudience;
  planId?: string;
}
