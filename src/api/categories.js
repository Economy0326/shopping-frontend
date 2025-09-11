// src/api/categories.js
import { request } from "../lib/request";

export const CategoryAPI = {
  // GET /api/categories
  list() {
    return request("/api/categories");
  },
};
