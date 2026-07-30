import mongoose from "mongoose";

export interface IContactQuery extends mongoose.Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const contactQuerySchema = new mongoose.Schema<IContactQuery>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

const ContactQuery =
  mongoose.models.ContactQuery || mongoose.model<IContactQuery>("ContactQuery", contactQuerySchema);

export default ContactQuery;
