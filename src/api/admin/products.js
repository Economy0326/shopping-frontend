import { request } from "../../lib/request";
import { ADMIN } from "../../constants/apiRoutes";

const toQS = (params = {}) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    p.set(k, String(v));
  });
  const qs = p.toString();
  return qs ? `?${qs}` : "";
};

export const AdminProductsAPI = {
  list(params = {}) {
    return request(`${ADMIN.PRODUCTS.ROOT}${toQS(params)}`);
  },
  get(id) {
    return request(ADMIN.PRODUCTS.ID(id));
  },
  create(payload) {
    return request(ADMIN.PRODUCTS.ROOT, { method: "POST", body: payload });
  },
  update(id, payload) {
    return request(ADMIN.PRODUCTS.ID(id), { method: "PUT", body: payload });
  },
  upload(file) {
    const fd = new FormData();
    fd.append("file", file);
    return request(ADMIN.UPLOADS, { method: "POST", body: fd });
  },
};
