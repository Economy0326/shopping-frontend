const env = (k, fb = "") => (process.env?.[k] ?? fb);

export const E = {
  BANK_NAME: env("REACT_APP_BANK_NAME"),
  BANK_ACCOUNT: env("REACT_APP_BANK_ACCOUNT"),
  BANK_HOLDER: env("REACT_APP_BANK_HOLDER"),
  API_BASE: env("REACT_APP_API_BASE", ""),
};

export const API_BASE = E.API_BASE;