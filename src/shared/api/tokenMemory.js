const KEY = "accessToken";
let accessToken = null;

export const setAccessToken = (t) => {
  accessToken = t || null;
  if (t) localStorage.setItem(KEY, t);
  else localStorage.removeItem(KEY);
};

export const getAccessToken = () => {
  if (accessToken) return accessToken;
  const t = localStorage.getItem(KEY);
  accessToken = t || null;
  return accessToken;
};

export const clearToken = () => {
  accessToken = null;
  localStorage.removeItem(KEY);
};
