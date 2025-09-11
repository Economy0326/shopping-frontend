import { request } from "../lib/request";

export const UserAPI = {
  updateProfile: (payload /* {name, email, phone} */) =>
    request.put("/api/users/me", payload), // { user }

  getDefaultAddress: () =>
    request.get("/api/users/default-address"), // { address }

  saveDefaultAddress: ({ receiver, phone, zip, address1, address2 }) =>
    request.put("/api/users/default-address", { receiver, phone, zip, address1, address2 }), // { address }
};
