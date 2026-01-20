import { request } from "shared/api/request";
import { SYSTEM } from "shared/api/endpoints";

export const AdminFaqAPI = {
  get() {
    return request(SYSTEM.POLICY("faq"));
  },
  update(value) {
    return request(SYSTEM.POLICY("faq"), { method: "PUT", body: { value } });
  },
};