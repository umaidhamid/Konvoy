import { Request, Response } from "express";
import { config } from "../../config.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { contactMessageTemplate } from "../../utils/emailTemplates.js";
import ContactQuery from "../../models/contactQuery.model.js";

export const sendContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    // Save first so the query survives even if the notification email fails to send.
    await ContactQuery.create({ name, email, subject, message });

    const { subject: emailSubject, html } = contactMessageTemplate(
      name,
      email,
      subject,
      message
    );

    try {
      await sendEmail({
        to: config.contactEmail,
        subject: emailSubject,
        html,
      });
    } catch (emailError) {
      console.error("Failed to send contact notification email:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Your message has been sent. We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Failed to save contact message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send your message. Please try again later.",
    });
  }
};
