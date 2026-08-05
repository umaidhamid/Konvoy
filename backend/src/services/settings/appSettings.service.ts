import AppSettings, { IAppSettings } from "../../models/appSettings.model.js";

// Upserts so the very first read/write ever made works even before the
// singleton document exists (fresh deployment, no seed script needed).
export const appSettingsService = {
  async getSettings() {
    return AppSettings.findByIdAndUpdate(
      "global",
      { $setOnInsert: { _id: "global" } },
      { upsert: true, new: true }
    );
  },

  async updateSettings(updates: Partial<Pick<IAppSettings, "referralRewardBytes">>) {
    return AppSettings.findByIdAndUpdate("global", { $set: updates }, { upsert: true, new: true });
  },
};
