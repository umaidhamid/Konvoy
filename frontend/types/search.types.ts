export interface SearchProjectResult {
  _id: string;
  name: string;
  slug: string;
  description: string;
}

export interface SearchFileResult {
  _id: string;
  name: string;
  projectId: string;
  projectName: string;
  projectSlug: string;
}

export interface SearchResults {
  projects: SearchProjectResult[];
  files: SearchFileResult[];
}
