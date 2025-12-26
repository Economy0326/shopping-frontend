import { request } from "shared/api/request";

export const CategoryAPI = {
  // GET /api/categories
  list() {
    return request("/api/categories");
  },
};
