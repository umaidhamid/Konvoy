import { Response } from "express";
import { dataExportService } from "./dataExport.service.js";

// GET /data-export
export const exportMyData = async (req: any, res: Response) => {
  try {
    const data = await dataExportService.generateUserDataExport(req.user.userId);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="konvoy-export-${Date.now()}.json"`);
    return res.status(200).send(JSON.stringify(data, null, 2));
  } catch (error) {
    const status = (error as any)?.statusCode || 500;
    const message = (error as any)?.message || "Could not generate your data export.";
    return res.status(status).json({ success: false, message });
  }
};
