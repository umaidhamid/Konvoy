import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminMiddleware } from "../../middlewares/admin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createPlanSchema, updatePlanSchema } from "../../validations/plan.validation.js";
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
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  setUserPlan,
  getContactQueries,
  setContactQueryRead,
} from "./admin.controller.js";

const adminRouter = express.Router();

adminRouter.use(authMiddleware, adminMiddleware);

adminRouter.get("/stats", getStats);
adminRouter.get("/users", getAllUsers);
adminRouter.get("/users/export", exportUsersCsv);
adminRouter.patch("/users/bulk-deactivate", bulkSetUserDeactivation);
adminRouter.patch("/users/:userId/deactivate", setUserDeactivation);
adminRouter.patch("/users/:userId/role", setUserRole);
adminRouter.patch("/users/:userId/plan", setUserPlan);
adminRouter.get("/projects", getAllProjects);
adminRouter.get("/projects/export", exportProjectsCsv);
adminRouter.delete("/projects/bulk", bulkDeleteProjects);
adminRouter.delete("/projects/:projectId", adminDeleteProject);
adminRouter.get("/logs", getAdminLogs);
adminRouter.get("/plans", getAllPlans);
adminRouter.post("/plans", validate(createPlanSchema), createPlan);
adminRouter.put("/plans/:planId", validate(updatePlanSchema), updatePlan);
adminRouter.delete("/plans/:planId", deletePlan);
adminRouter.get("/contact", getContactQueries);
adminRouter.patch("/contact/:queryId/read", setContactQueryRead);

export default adminRouter;
