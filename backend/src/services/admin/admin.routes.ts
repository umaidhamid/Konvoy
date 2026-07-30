import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminMiddleware } from "../../middlewares/admin.middleware.js";
import {
  getAllUsers,
  getAllProjects,
  adminDeleteProject,
  setUserDeactivation,
  setUserRole,
  getAdminLogs,
  getStats,
  bulkSetUserDeactivation,
  bulkDeleteProjects,
  exportUsersCsv,
  exportProjectsCsv,
} from "./admin.controller.js";

const adminRouter = express.Router();

adminRouter.use(authMiddleware, adminMiddleware);

adminRouter.get("/stats", getStats);
adminRouter.get("/users", getAllUsers);
adminRouter.get("/users/export", exportUsersCsv);
adminRouter.patch("/users/bulk-deactivate", bulkSetUserDeactivation);
adminRouter.patch("/users/:userId/deactivate", setUserDeactivation);
adminRouter.patch("/users/:userId/role", setUserRole);
adminRouter.get("/projects", getAllProjects);
adminRouter.get("/projects/export", exportProjectsCsv);
adminRouter.delete("/projects/bulk", bulkDeleteProjects);
adminRouter.delete("/projects/:projectId", adminDeleteProject);
adminRouter.get("/logs", getAdminLogs);

export default adminRouter;
