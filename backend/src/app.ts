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
import secretsRoutes from "./services/secrets/secret.routes.js";
import searchRoutes from "./services/search/search.routes.js";
import featureRequestRoutes from "./services/featureRequests/featureRequest.routes.js";
import referralRoutes from "./services/referrals/referral.routes.js";
import diffShareRoutes from "./services/diffShare/diffShare.routes.js";
import dataExportRoutes from "./services/dataExport/dataExport.routes.js";
import envDriftRoutes from "./services/envDrift/envDrift.routes.js";
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
app.use("/api/v1/secrets", secretsRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/feature-requests", featureRequestRoutes);
app.use("/api/v1/referrals", referralRoutes);
app.use("/api/v1/diff-shares", diffShareRoutes);
app.use("/api/v1/data-export", dataExportRoutes);
app.use("/api/v1/env-drift", envDriftRoutes);

app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err?.type === "entity.too.large" || err?.status === 413) {
      return res.status(413).json({
        message: "Upload is too large. Please reduce the file size and try again.",
      });
    }

    const status = err?.statusCode || err?.status || 500;
    const message = err?.message || "Internal server error";
    console.error(err);
    return res.status(status).json({ message });
  }
);

export default app;
