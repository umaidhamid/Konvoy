import nodemailer from "nodemailer";
import { config } from "../config";
 console.log(config.emailUser);
  console.log(config.emailPassword);
export const transporter = nodemailer.createTransport({
 
  service: "gmail",
  auth: {
    user: config.emailUser,
    pass: config.emailPassword,
  },
});