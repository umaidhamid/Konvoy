import config from "./config.js";

export interface ProjectLink {
  projectId: string;
  slug: string;
  name: string;
  // Access (role/file scope) is never cached here - it's fetched live from
  // the server (see projectLink.ts).
}

// Folder-to-project links live in the CLI's own global config store
// (keyed by the folder's absolute path), not in a file inside the project
// folder itself - a file sitting in the repo could be hand-edited by anyone
// with access to the folder (or committed/shared by mistake).
function readLinks(): Record<string, ProjectLink> {
  return (config.get("links") as Record<string, ProjectLink>) || {};
}

export function readLink(cwd: string): ProjectLink | null {
  return readLinks()[cwd] || null;
}

export function writeLink(cwd: string, link: ProjectLink) {
  const links = readLinks();
  links[cwd] = link;
  config.set("links", links);
}

export function removeLink(cwd: string) {
  const links = readLinks();
  delete links[cwd];
  config.set("links", links);
}
