import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createFeatureRequestSchema, setStatusSchema } from "../../validations/featureRequest.validation.js";
import {
  createFeatureRequest,
  listFeatureRequests,
  toggleVote,
  deleteFeatureRequest,
  setFeatureRequestStatus,
} from "./featureRequest.controller.js";

const featureRequestRouter = express.Router();

featureRequestRouter.use(authMiddleware);

featureRequestRouter.get("/", listFeatureRequests);
featureRequestRouter.post("/", validate(createFeatureRequestSchema), createFeatureRequest);
featureRequestRouter.post("/:id/vote", toggleVote);
featureRequestRouter.patch("/:id/status", validate(setStatusSchema), setFeatureRequestStatus);
featureRequestRouter.delete("/:id", deleteFeatureRequest);

export default featureRequestRouter;
