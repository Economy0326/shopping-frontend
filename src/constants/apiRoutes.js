export const API_PREFIX = "/api/v1";

export const AUTH = {
  LOGIN:   `${API_PREFIX}/auth/login`,
  REFRESH: `${API_PREFIX}/auth/refresh`,
  ME:      `${API_PREFIX}/auth/me`,
  LOGOUT:  `${API_PREFIX}/auth/logout`,
  REGISTER:`${API_PREFIX}/auth/register`,
  PW_CHANGE: `${API_PREFIX}/auth/password-change`,
};

export const PRODUCTS = {
  LIST:   `${API_PREFIX}/products`,
  DETAIL: (id) => `${API_PREFIX}/products/${id}`,
};

export const SYSTEM = {
  POLICY: (key) => `${API_PREFIX}/system/policies/${key}`,
};