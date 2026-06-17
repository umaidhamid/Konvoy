    import { transporter } from "../config/mailer";
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
  await transporter.sendMail({
    from: `"Konvoy" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};