import { request } from "shared/api/request";
import { SYSTEM } from "shared/api/endpoints";
import { pickData } from "shared/api/pickers";

export const SystemAPI = {
  async policy(key) {
    const res = await request(SYSTEM.POLICY(key));
    return pickData(res);
  },

  // 은행 계좌 정보 조회
  async bankAccount() {
    return this.policy("bankAccount");
  },

  // FAQ 업데이트 (관리자용)
  async updateFaq(value) {
    const res = await request(SYSTEM.POLICY("faq"), {
      method: "PUT",
      body: { value },
    });
    return pickData(res);
  },
};