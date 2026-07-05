// ============================================
// controllers/projectfile.controller.ts
// ============================================
import { Request, Response } from "express";
import { projectFileService } from "./projectfile.service";

const handleError = (res: Response, error: unknown) => {
  console.error(error);
  const status = (error as any)?.statusCode || 500;
  const message = (error as any)?.message || "Internal server error";
  return res.status(status).json({ message });
};

// GET /projectfile/:slug
// Frontend: projectfilesService.getProjectFiles(slug) -> res.project, res.files
export const getProjectFiles = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const userId = req.user!.userId;

    const { project, files } = await projectFileService.getProjectFiles(slug, userId);
    return res.status(200).json({ project, files });
  } catch (error) {
    return handleError(res, error);
  }
};

// POST /projectfile/:slug
// Frontend: createProjectFile(slug, inputValue, content) -> res.data._id
export const createProjectFile = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const userId = req.user!.userId;

    const file = await projectFileService.createProjectFile(slug, userId, req.body);
    // returned flat (not nested under `data`) since WebIDE reads res.data._id directly
    return res.status(201).json(file);
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /projectfile/single/:id
// Frontend: api.get(`/projectfile/single/${fileId}`) -> res.data.content
export const getProjectFileById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const file = await projectFileService.getProjectFileById(id, userId);
    return res.status(200).json(file); // file.content is read directly by frontend
  } catch (error) {
    return handleError(res, error);
  }
};

// PUT /projectfile/:id
// Frontend uses this for BOTH save (content) and rename (name)
export const updateProjectFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { content, name } = req.body;

    const file = name !== undefined
      ? await projectFileService.renameProjectFile(id, userId, name)
      : await projectFileService.updateProjectFileContent(id, userId, content);

    return res.status(200).json(file);
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE /projectfile/:id
export const deleteProjectFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    await projectFileService.deleteProjectFile(id, userId);
    return res.status(200).json({ message: "File deleted" });
  } catch (error) {
    return handleError(res, error);
  }
};