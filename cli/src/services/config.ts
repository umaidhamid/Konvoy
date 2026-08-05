import Conf from "conf";

// Matches the backend's cookie names (see backend/src/config/auth.config.ts)
// even though these are stored locally, not sent as cookies - keeps the two
// token stores named consistently.
export const ACCESS_TOKEN_KEY = "konvoy_access_token";
export const REFRESH_TOKEN_KEY = "konvoy_refresh_token";

const config = new Conf({
  projectName: "konvoy",
});

export default config;
