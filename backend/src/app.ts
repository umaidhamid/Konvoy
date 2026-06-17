import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoutes from "./services/auth/auth.routes";

const app = express();

app.use(
cors({
origin: process.env.FRONTEND_URL,
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

app.use("/api/auth", authRoutes);

export default app;
