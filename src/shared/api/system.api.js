import { request } from "shared/api/request";
import { SYSTEM } from "shared/api/endpoints";
import { pickData } from "shared/api/pickers";

export const SystemAPI = {
  async policy(key) {
    const res = await request(SYSTEM.POLICY(key));
    return pickData(res); // data만 반환
  },
  async bankAccount() {
    return this.policy("bankAccount");
  },
};