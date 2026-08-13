export type ActivityAction =
  | "project_created"
  | "project_updated"
  | "member_added"
  | "member_removed"
  | "member_left"
  | "file_created"
  | "file_renamed"
  | "file_deleted"
  | "file_version_restored";

export interface ActivityEntry {
  _id: string;
  projectId: string;
  action: ActivityAction;
  message: string;
  createdAt: string;
  isMine: boolean;
  actor: { _id: string; name: string } | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
