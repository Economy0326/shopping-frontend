import { request } from "../lib/request";
import { SYSTEM } from "../constants/apiRoutes";

// GET /api/system/policies/:key  → { contentMd }
const SystemAPI = {
  getPolicy: (key) => request.get(SYSTEM.POLICY(key)),
};
export default SystemAPI;

