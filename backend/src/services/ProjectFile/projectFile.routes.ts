// ============================================
// routes/projectfile.routes.ts
// ============================================
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js"; // adjust path to your actual auth middleware
import {
  getProjectFiles,
  createProjectFile,
  getProjectFileById,
  updateProjectFile,
  deleteProjectFile,
} from "./projectFile.controller.js";

const router = Router();

router.use(authMiddleware);

// IMPORTANT: /single/:id must come before /:slug or Express will match "single" as a slug
router.get("/single/:id", getProjectFileById);
router.put("/:id", updateProjectFile);
router.delete("/:id", deleteProjectFile);

router.get("/:slug", getProjectFiles);
router.post("/:slug", createProjectFile);

export default router;