export interface ProjectMember {
  userId: string | { _id: string; fullname?: string; email?: string };
  role: "member";
}
export interface Project {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
  members?: ProjectMember[];
  myRole?: "owner" | "member" | null;
  fileCount?: number;
  sizeBytes?: number;
  memberCount?: number;
  limits?: { maxFilesPerProject: number; maxMembersPerProject: number };
}
export interface ProjectData {
  _id: string;
  name: string;
  description: string;
  slug: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}