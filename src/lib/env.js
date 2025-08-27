// /lib/env.js
const env = (k, fb = "") => process.env[k] ?? fb;

export const E = {
  ADMIN_PASS:   env("REACT_APP_ADMIN_PASS"),
  BANK_NAME:    env("REACT_APP_BANK_NAME"),
  BANK_ACCOUNT: env("REACT_APP_BANK_ACCOUNT"),
  BANK_HOLDER:  env("REACT_APP_BANK_HOLDER"),
  API_BASE:     env("REACT_APP_API_BASE", ""), // 기본값 공백
};

export const API_BASE = E.API_BASE;
