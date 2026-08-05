import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { exportMyData } from "./dataExport.controller.js";

const dataExportRouter = express.Router();

dataExportRouter.get("/", authMiddleware, exportMyData);

export default dataExportRouter;
