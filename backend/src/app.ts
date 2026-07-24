import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { config } from "./config.js";
import authRoutes from "./services/auth/auth.routes.js";
import projectRoutes from "./services/projects/projects.routes.js";
import projectFileRoutes from "./services/ProjectFile/projectFile.routes.js";
import contactRoutes from "./services/contact/contact.routes.js";
const app = express();

app.use(
cors({
origin: config.FRONTEND_URL,
credentials: true,
})
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

export default app;
