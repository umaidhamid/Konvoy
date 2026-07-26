import fs from "fs";
import path from "path";

const EXCLUDED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "out",
  ".konvoy",
]);

const EXCLUDED_FILES = new Set([".konvoy.json", ".env", ".DS_Store"]);

const EXCLUDED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp",
  ".mp4", ".mov", ".avi", ".mp3", ".wav",
  ".zip", ".tar", ".gz", ".rar", ".7z",
  ".exe", ".dll", ".so", ".dylib",
  ".woff", ".woff2", ".ttf", ".eot",
  ".pdf",
]);

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export interface LocalFile {
  relativePath: string;
  content: string;
}

export function listFiles(cwd: string): string[] {
  const relativePaths: string[] = [];

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (EXCLUDED_DIRS.has(entry.name)) continue;
        walk(fullPath);
        continue;
      }

      if (EXCLUDED_FILES.has(entry.name)) continue;
      if (EXCLUDED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;

      const stat = fs.statSync(fullPath);
      if (stat.size > MAX_FILE_SIZE) continue;

      relativePaths.push(path.relative(cwd, fullPath).split(path.sep).join("/"));
    }
  };

  walk(cwd);

  return relativePaths.sort();
}

export function walkFiles(cwd: string): LocalFile[] {
  return listFiles(cwd).map((relativePath) => ({
    relativePath,
    content: fs.readFileSync(path.join(cwd, relativePath), "utf8"),
  }));
}
