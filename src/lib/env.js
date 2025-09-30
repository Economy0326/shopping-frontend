const env = (k, fb = "") => (process.env?.[k] ?? fb);

export const E = {
  BANK_NAME: env("REACT_APP_BANK_NAME"),
  BANK_ACCOUNT: env("REACT_APP_BANK_ACCOUNT"),
  BANK_HOLDER: env("REACT_APP_BANK_HOLDER"),
  API_BASE: env("REACT_APP_API_BASE", "http://localhost:8080"),
  API_PREFIX: env("REACT_APP_API_PREFIX", "/api/v1"),
};

// 필요에 따라 개별 export
export const API_BASE = E.API_BASE;
export const API_PREFIX = E.API_PREFIX;

// 최종 루트
export const API_ROOT = `${E.API_BASE}${E.API_PREFIX}`; 

