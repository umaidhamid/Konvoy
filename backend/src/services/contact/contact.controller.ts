import { Request, Response } from "express";
import { config } from "../../config.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { contactMessageTemplate } from "../../utils/emailTemplates.js";

export const sendContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    const { subject: emailSubject, html } = contactMessageTemplate(
      name,
      email,
      subject,
      message
    );

    await sendEmail({
      to: config.contactEmail,
      subject: emailSubject,
      html,
    });

    return res.status(200).json({
      success: true,
      message: "Your message has been sent. We'll get back to you soon.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send your message. Please try again later.",
    });
  }
};
