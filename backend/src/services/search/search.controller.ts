import { Response } from "express";
import { searchService } from "./search.service.js";

// GET /search?q=...
export const search = async (req: any, res: Response) => {
  try {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!query) {
      return res.status(200).json({ success: true, data: { projects: [], files: [] } });
    }

    const result = await searchService.search(req.user.userId, query);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Something went wrong." });
  }
};
