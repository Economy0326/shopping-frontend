import { request } from "shared/api/request";
import { USERS, AUTH } from "shared/api/endpoints";
import { idemHeaders } from "shared/utils/idempotency";

// Users (로그인 필요)
export const UsersAPI = {
  // GET /users/me
  me() {
    return request(USERS.ME);
  },

  // PATCH /users/me/profile
  updateProfile(payload) {
    return request(USERS.PROFILE, {
      method: "PATCH",
      headers: idemHeaders(),
      body: payload,
    });
  },

  // PUT /users/default-address
  saveDefaultAddress(payload) {
    return request(USERS.DEFAULT_ADDR, {
      method: "PUT",
      headers: idemHeaders(),
      body: payload,
    });
  },
};

export default UsersAPI;