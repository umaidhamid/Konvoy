// ============================================
// models/ProjectFile.model.ts
// ============================================
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProjectFile extends Document {
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  path?: string;
  extension: string;
  language: string;
  content: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectFileSchema = new Schema<IProjectFile>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProjectFileSchema.index({ projectId: 1, name: 1, isDeleted: 1 });

export default mongoose.model<IProjectFile>("ProjectFile", ProjectFileSchema);