import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { config } from "./config.js";
import authRoutes from "./services/auth/auth.routes.js";
import projectRoutes from "./services/projects/projects.routes.js";
import projectFileRoutes from "./services/ProjectFile/projectFile.routes.js";
import contactRoutes from "./services/contact/contact.routes.js";
import notificationRoutes from "./services/notifications/notification.routes.js";
import adminRoutes from "./services/admin/admin.routes.js";
import plansRoutes from "./services/plans/plans.routes.js";
const app = express();

app.use(
cors({
origin: config.FRONTEND_URL,
credentials: true,
})
);

app.use(morgan("dev"));
// 20mb comfortably covers the largest per-file limit any Plan should realistically
// set (see backend/src/services/plans/plan.service.ts) - revisit if a plan ever needs more.
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

app.get("/", (_, res) => {
res.status(200).json({
success: true,
message: "API is running",
});
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/projectfile", projectFileRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/plans", plansRoutes);

export default app;
