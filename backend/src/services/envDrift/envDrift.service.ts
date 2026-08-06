import { projectFileService } from "../ProjectFile/projectfile.service.js";
import { AppError } from "../../utils/AppError.js";

function parseEnv(content: string): Record<string, string> {
  const map: Record<string, string> = {};
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    // Strip a leading "export " so bash-sourced env files (export KEY=value) parse like plain KEY=value
    const key = trimmed.slice(0, eq).trim().replace(/^export\s+/, "");
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) map[key] = value;
  });
  return map;
}

export const envDriftService = {
  async compare(fileIdA: string, fileIdB: string, userId: string, reveal: boolean) {
    if (fileIdA === fileIdB) throw new AppError("Pick two different files to compare", 400);

    // Reuses the same access-controlled, decrypting file read used by the file viewer -
    // revealing a value here grants nothing beyond what opening the file directly already would.
    const [fileA, fileB] = await Promise.all([
      projectFileService.getProjectFileById(fileIdA, userId),
      projectFileService.getProjectFileById(fileIdB, userId),
    ]);

    const mapA = parseEnv(fileA.content || "");
    const mapB = parseEnv(fileB.content || "");

    const keysA = Object.keys(mapA);
    const keysB = Object.keys(mapB);

    const onlyInA = keysA.filter((k) => !(k in mapB)).sort();
    const onlyInB = keysB.filter((k) => !(k in mapA)).sort();
    const shared = keysA.filter((k) => k in mapB);
    const changed = shared.filter((k) => mapA[k] !== mapB[k]).sort();
    const identicalCount = shared.length - changed.length;

    return {
      fileA: { id: String(fileA._id), name: fileA.name, parsedKeyCount: keysA.length },
      fileB: { id: String(fileB._id), name: fileB.name, parsedKeyCount: keysB.length },
      onlyInA: onlyInA.map((key) => ({ key, value: reveal ? mapA[key] : undefined })),
      onlyInB: onlyInB.map((key) => ({ key, value: reveal ? mapB[key] : undefined })),
      changed: changed.map((key) => ({
        key,
        valueA: reveal ? mapA[key] : undefined,
        valueB: reveal ? mapB[key] : undefined,
      })),
      identicalCount,
    };
  },
};
