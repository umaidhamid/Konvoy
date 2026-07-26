import { Resend } from "resend";
import { config } from "../config.js";

const resend = new Resend(config.resendApiKey);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailOptions) => {
  return await resend.emails.send({
    from: config.resendFromEmail,
    to,
    replyTo: config.replyToEmail,
    subject,
    html,
  });
};
