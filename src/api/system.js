import { request } from "../lib/request";

export const SystemAPI = {
  getPolicy: (key) => request.get(`/api/system/policies/${key}`), // "returns" 등
};
