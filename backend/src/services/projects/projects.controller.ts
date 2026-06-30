import Project from "../../models/projects.model";

export const createProject = async (req: any, res: any) => {
  try {
    const { name, description } = req.body;
// console.log(name,description)
    const existingProject = await Project.findOne({
      userId: req.user.userId,
      name,
    }).select("name");

    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: "Project with this name already exists.",
      });
    }

    const project = await Project.create({
      userId: req.user.userId,
      name,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

export const getProjects = async (req: any, res: any) => {
  try {
    const projects = await Project.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 }).select(" -userId createdAt updatedAt" );

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};
export const deleteProject = async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOneAndDelete({ _id: projectId, userId: req.user.userId }).select("name");
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};
export const updateProject = async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;
    const project = await Project.findOneAndUpdate({ _id: projectId, userId: req.user.userId }, {
      name,
      description,
    },{new:true});
    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};
export const getProject = async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({ _id: projectId, userId: req.user.userId }).select(" -userId" );
    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};
