import { request } from "../lib/request";
import { AUTH } from "../constants/apiRoutes";

const F = {
  id:      process.env.REACT_APP_FIELD_ID      || "mid",
  pw:      process.env.REACT_APP_FIELD_PASSWORD|| "mpw",
  name:    process.env.REACT_APP_FIELD_NAME    || "mname",
  email:   process.env.REACT_APP_FIELD_EMAIL   || "email",
};

export const AuthAPI = {
  login:   ({ username, password }) => request.post(AUTH.LOGIN, { [F.id]: username, [F.pw]: password }),
  me:      () => request.get(AUTH.ME),
  logout:  () => request.post(AUTH.LOGOUT),
  register:(p) => request.post(AUTH.REGISTER, {
              [F.id]: p.username, [F.pw]: p.password,
              ...(p.name  ? { [F.name]:  p.name }  : {}),
              ...(p.email ? { [F.email]: p.email } : {}),
            }),
  changePassword: ({ currentPassword, newPassword }) =>
            request.post(AUTH.PW_CHANGE, { current: currentPassword, next: newPassword }),
};
