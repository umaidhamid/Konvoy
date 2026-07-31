import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createProjectSchema } from "../../validations/project.validation.js";
import {
  createProject,
  getProjects,
  getMyTeam,
  deleteProject,
  updateProject,
  getProject,
  addProjectMember,
  removeProjectMember,
  leaveProject,
} from "./projects.controller.js";

const projectRouter = express.Router();

projectRouter.post("/create", authMiddleware, validate(createProjectSchema), createProject);
projectRouter.get("/users-projects", authMiddleware, getProjects);
projectRouter.get("/team", authMiddleware, getMyTeam);
projectRouter.delete("/delete/:projectId", authMiddleware, deleteProject);
projectRouter.get("/project/:projectId", authMiddleware, getProject);
projectRouter.put("/update/:projectId", authMiddleware, updateProject);
projectRouter.post("/:projectId/members", authMiddleware, addProjectMember);
projectRouter.delete("/:projectId/members/:memberId", authMiddleware, removeProjectMember);
projectRouter.post("/:projectId/leave", authMiddleware, leaveProject);
export default projectRouter;