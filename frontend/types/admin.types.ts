export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminUser {
  _id: string;
  fullname?: string;
  email: string;
  role: "user" | "admin" | "moderator";
  isVerified: boolean;
  isDeactivated: boolean;
  deactivationNote?: string;
  profileImage?: string;
  lastLoginAt?: string;
  createdAt: string;
  planId: { _id: string; name: string } | null;
  planExpiresAt: string | null;
}

export interface AdminLog {
  _id: string;
  actorId: { _id: string; fullname?: string; email?: string } | string;
  action: string;
  targetType: "user" | "project" | "plan";
  targetId: string;
  details: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalFiles: number;
  totalSizeBytes: number;
  topProjects: {
    projectId: string;
    name: string;
    slug: string;
    owner: { _id: string; fullname?: string; email?: string } | null;
    fileCount: number;
    sizeBytes: number;
  }[];
}

export interface AdminContactQuery {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminProject {
  _id: string;
  name: string;
  slug: string;
  description: string;
  userId: { _id: string; fullname?: string; email?: string } | string;
  members: { userId: { _id: string; fullname?: string; email?: string } | string; role: string }[];
  fileCount: number;
  createdAt: string;
  updatedAt: string;
}
