import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createSecretSchema,
  recreateSecretSchema,
  revealSecretSchema,
  extendSecretSchema,
} from "../../validations/secret.validation.js";
import {
  createSecret,
  recreateSecret,
  extendSecret,
  listMySecrets,
  exportMySecretsCsv,
  revokeSecret,
  deleteSecretHistory,
  peekSecret,
  revealSecret,
  burnSecret,
} from "./secret.controller.js";

const secretsRouter = express.Router();

// Public - no auth, the recipient of a share link may not have an account
// (an individual secret can still require sign-in via its own requireAuth flag)
secretsRouter.get("/peek/:token", peekSecret);
secretsRouter.post("/reveal/:token", validate(revealSecretSchema), revealSecret);
secretsRouter.post("/burn/:token", burnSecret);

secretsRouter.post("/", authMiddleware, validate(createSecretSchema), createSecret);
secretsRouter.get("/mine", authMiddleware, listMySecrets);
secretsRouter.get("/export.csv", authMiddleware, exportMySecretsCsv);
secretsRouter.post("/:id/recreate", authMiddleware, validate(recreateSecretSchema), recreateSecret);
secretsRouter.patch("/:id/extend", authMiddleware, validate(extendSecretSchema), extendSecret);
secretsRouter.delete("/:id/history", authMiddleware, deleteSecretHistory);
secretsRouter.delete("/:id", authMiddleware, revokeSecret);

export default secretsRouter;
