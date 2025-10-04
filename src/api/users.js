/* 사용자/주소 API(프로필 수정,기본 배송지 조회,기본 배송지 저장/갱신)) */
import { api } from "../lib/request";
import { USERS } from "../constants/apiRoutes";

export const UsersAPI = {
  me: () => api.get(USERS.ME).then(r => r.data),
  updateProfile: (profile) => api.put(USERS.PROFILE, profile).then(r => r.data),
  getDefaultAddress: () => api.get(USERS.DEFAULT_ADDR).then(r => r.data),
  saveDefaultAddress: (addr) => api.put(USERS.DEFAULT_ADDR, addr).then(r => r.data),
};
