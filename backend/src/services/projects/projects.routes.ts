import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createProjectSchema } from "../../validations/project.validation";
import { createProject, getProjects, deleteProject, updateProject, getProject } from "./projects.controller";

const projectRouter = express.Router();

projectRouter.post("/create", authMiddleware, validate(createProjectSchema), createProject);
projectRouter.get("/users-projects", authMiddleware, getProjects);
projectRouter.delete("/delete/:projectId", authMiddleware, deleteProject);
projectRouter.get("/project/:projectId", authMiddleware, getProject);
projectRouter.put("/update/:projectId", authMiddleware, updateProject);
export default projectRouter;