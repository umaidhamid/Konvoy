import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { config } from "./config";
import authRoutes from "./services/auth/auth.routes";
import projectRoutes from "./services/projects/projects.routes";
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

export default app;
