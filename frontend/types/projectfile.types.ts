// ============================================
// types/projectfile.types.ts
// ============================================
export interface ProjectFile {
  _id: string;
  name: string;
  path?: string;
  extension?: string;
  language?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  _id: string;
  name: string;
  slug: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}