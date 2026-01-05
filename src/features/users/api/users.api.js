import { request } from "shared/api/request";
import { USERS } from "shared/api/endpoints";
import { idemHeaders } from "shared/utils/idempotency";
import { pickData } from "shared/api/pickers";

export const UsersAPI = {
  async me() {
    return pickData(await request(USERS.ME));
  },

  // 프로필 수정
  async updateProfile(payload) {
    return pickData(
      await request(USERS.PROFILE, {
        method: "PATCH",
        headers: idemHeaders(),
        body: payload,
      })
    );
  },

  // 기본 배송지 저장
  async saveDefaultAddress(payload) {
    return pickData(
      await request(USERS.DEFAULT_ADDR, {
        method: "PUT",
        headers: idemHeaders(),
        body: payload,
      })
    );
  },
};

export default UsersAPI;
