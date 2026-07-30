import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { search } from "./search.controller.js";

const searchRouter = express.Router();

searchRouter.get("/", authMiddleware, search);

export default searchRouter;
