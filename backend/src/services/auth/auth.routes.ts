import express from "express";

import {
login,
refresh,
logout,
} from "./auth.controller";

import { validate } from "../../middlewares/validate.middleware";

import {
loginSchema,
} from "../../validations/auth.validation";

const router = express.Router();

router.post(
"/login",
validate(loginSchema),
login
);

router.post("/refresh", refresh);

router.post("/logout", logout);

export default router;
