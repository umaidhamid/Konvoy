import { projectFileService } from "../ProjectFile/projectfile.service.js";
import { AppError } from "../../utils/AppError.js";
import { parseEnv } from "../../utils/parseEnv.js";

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
