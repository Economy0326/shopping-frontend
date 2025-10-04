let accessToken = null;
let refreshToken = null;

export const setAccessToken = (t) => (accessToken = t);
export const getAccessToken  = () => accessToken;
export const clearAccessToken = () => (accessToken = null);

export const setRefreshToken = (t) => (refreshToken = t);
export const getRefreshToken  = () => refreshToken;
export const clearRefreshToken = () => (refreshToken = null);

export const clearToken = () => {
  clearAccessToken();
  clearRefreshToken();
};