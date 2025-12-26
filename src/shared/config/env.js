const env = (k, fb = "") => (process.env?.[k] ?? fb);

export const E = {
  API_BASE: env("REACT_APP_API_BASE", "http://localhost:8080"),
  API_PREFIX: env("REACT_APP_API_PREFIX", "/api/v1"),
};

export const API_ROOT = `${E.API_BASE}${E.API_PREFIX}`;

// 편의용 개별 네임드 export
export const API_PREFIX = E.API_PREFIX;
export const API_BASE = E.API_BASE;