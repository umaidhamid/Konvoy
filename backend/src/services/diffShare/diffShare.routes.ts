import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createDiffShareSchema } from "../../validations/diffShare.validation.js";
import { createDiffShare, listMyDiffShares, deleteDiffShare, getDiffShare } from "./diffShare.controller.js";

const diffShareRouter = express.Router();

diffShareRouter.post("/", authMiddleware, validate(createDiffShareSchema), createDiffShare);
diffShareRouter.get("/mine", authMiddleware, listMyDiffShares);
diffShareRouter.delete("/:id", authMiddleware, deleteDiffShare);

// Public - no auth, recipients of a share link may not have an account
diffShareRouter.get("/:token", getDiffShare);

export default diffShareRouter;
