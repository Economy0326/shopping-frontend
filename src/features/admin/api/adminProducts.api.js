import { request } from "shared/api/request";
import { ADMIN } from "shared/api/endpoints";

export const AdminProductsAPI = {
  // GET /admin/products
  list(params = {}) {
    return request(ADMIN.PRODUCTS.ROOT, { params });
  },

  // GET /admin/products/{id}
  get(id) {
    return request(ADMIN.PRODUCTS.ID(id));
  },

  // POST /admin/products
  create(payload) {
    return request(ADMIN.PRODUCTS.ROOT, { method: "POST", body: payload });
  },

  // PATCH /admin/products/{id} (명세 기준)
  update(id, payload) {
    return request(ADMIN.PRODUCTS.ID(id), { method: "PATCH", body: payload });
  },

  // DELETE /admin/products/{id} (명세 기준)
  remove(id) {
    return request(ADMIN.PRODUCTS.ID(id), { method: "DELETE" });
  },

  // POST /admin/uploads (multipart/form-data)
  uploadImage(file) {
    const fd = new FormData();
    fd.append("file", file);
    return request(ADMIN.UPLOADS, { method: "POST", body: fd });
  },
};
