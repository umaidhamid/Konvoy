import mongoose from "mongoose";

export interface IProject extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new mongoose.Schema<IProject>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

projectSchema.index(
  { userId: 1, name: 1 },
  { unique: true }
);

const Project =
  mongoose.models.Project ||
  mongoose.model<IProject>("Project", projectSchema);

export default Project;