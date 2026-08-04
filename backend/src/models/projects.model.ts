import mongoose from "mongoose";
import slugify from "slugify";

export interface IProjectMember {
  userId: mongoose.Types.ObjectId;
  role: "member";
  // Empty/undefined = access to all files in the project. Non-empty = restricted to just these files.
  fileIds: mongoose.Types.ObjectId[];
}

export interface IProject extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  members: IProjectMember[];
  // Users (owner or member) who've pinned this project to the top of their list.
  pinnedBy: mongoose.Types.ObjectId[];
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
    members: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
          role: { type: String, enum: ["member"], default: "member" },
          fileIds: { type: [mongoose.Schema.Types.ObjectId], ref: "ProjectFile", default: [] },
          _id: false,
        },
      ],
      default: [],
    },
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    pinnedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Generate slug before saving
projectSchema.pre("validate", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});

// Prevent duplicate project names/slugs per user
projectSchema.index(
  { userId: 1, slug: 1 },
  { unique: true }
);

const Project =
  mongoose.models.Project ||
  mongoose.model<IProject>("Project", projectSchema);

export default Project;