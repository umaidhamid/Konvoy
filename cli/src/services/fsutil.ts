import fs from "fs";
import path from "path";

export function getUniqueFilePath(baseDir: string, relativeName: string): string {
  const dir = path.dirname(relativeName);
  const ext = path.extname(relativeName);
  const base = path.basename(relativeName, ext);

  let candidate = relativeName;
  let counter = 1;

  while (fs.existsSync(path.join(baseDir, candidate))) {
    candidate = path.join(dir === "." ? "" : dir, `${base}-copy${counter}${ext}`);
    counter++;
  }

  return candidate;
}

export function writeFileEnsuringDir(fullPath: string, content: string) {
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
