export type AwsPushKeyStatus = "created" | "updated" | "failed" | "skipped";

export interface AwsPushKeyResult {
  key: string;
  name: string;
  status: AwsPushKeyStatus;
  error?: string;
}

export interface AwsPushResult {
  file: { id: string; name: string };
  prefix: string;
  results: AwsPushKeyResult[];
}
