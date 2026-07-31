export interface Notification {
  _id: string;
  type: string;
  message: string;
  projectId?: { _id: string; name: string; slug: string } | string;
  actorId?: { _id: string; fullname?: string; email?: string } | string;
  read: boolean;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
