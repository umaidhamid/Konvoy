import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { contactSchema } from "../../validations/contact.validation.js";
import { sendContactMessage } from "./contact.controller.js";

const router = express.Router();

router.post("/send", validate(contactSchema), sendContactMessage);

export default router;
