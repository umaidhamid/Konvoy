import FeatureRequest from "../../models/featureRequest.model.js";

const shape = (doc: any, userId: string) => ({
  _id: doc._id,
  title: doc.title,
  description: doc.description,
  status: doc.status,
  createdBy: doc.createdBy,
  createdAt: doc.createdAt,
  voteCount: doc.votes.length,
  hasVoted: doc.votes.some((v: any) => String(v) === String(userId)),
  isMine: String(doc.createdBy?._id || doc.createdBy) === String(userId),
});

// POST /feature-requests
export const createFeatureRequest = async (req: any, res: any) => {
  try {
    const { title, description } = req.body;

    const request = await FeatureRequest.create({
      title,
      description: description || "",
      createdBy: req.user.userId,
      votes: [req.user.userId], // submitting counts as your own upvote
    });

    return res.status(201).json({ success: true, data: shape(request, req.user.userId) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Something went wrong." });
  }
};

// GET /feature-requests?status=
export const listFeatureRequests = async (req: any, res: any) => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status && status !== "all") filter.status = status;

    const requests = await FeatureRequest.find(filter)
      .populate("createdBy", "fullname email profileImage")
      .sort({ createdAt: -1 });

    const sorted = requests
      .map((r) => shape(r, req.user.userId))
      .sort((a, b) => b.voteCount - a.voteCount);

    return res.status(200).json({ success: true, data: sorted });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Something went wrong." });
  }
};

// POST /feature-requests/:id/vote - toggles the current user's vote
export const toggleVote = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const request = await FeatureRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    const hasVoted = request.votes.some((v: any) => String(v) === String(req.user.userId));
    if (hasVoted) {
      request.votes = request.votes.filter((v: any) => String(v) !== String(req.user.userId)) as any;
    } else {
      request.votes.push(req.user.userId);
    }
    await request.save();
    await request.populate("createdBy", "fullname email profileImage");

    return res.status(200).json({ success: true, data: shape(request, req.user.userId) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Something went wrong." });
  }
};

// DELETE /feature-requests/:id - owner or admin
export const deleteFeatureRequest = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const request = await FeatureRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }
    if (String(request.createdBy) !== String(req.user.userId) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You can only delete your own requests." });
    }

    await request.deleteOne();
    return res.status(200).json({ success: true, message: "Deleted." });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Something went wrong." });
  }
};

// PATCH /feature-requests/:id/status - admin only
export const setFeatureRequestStatus = async (req: any, res: any) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required." });
    }
    const { id } = req.params;
    const { status } = req.body;

    const request = await FeatureRequest.findByIdAndUpdate(id, { status }, { new: true }).populate(
      "createdBy",
      "fullname email profileImage"
    );
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    return res.status(200).json({ success: true, data: shape(request, req.user.userId) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Something went wrong." });
  }
};
