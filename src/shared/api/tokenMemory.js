let accessToken = null;

export const setAccessToken = (t) => (accessToken = t);
export const getAccessToken = () => accessToken;
export const clearAccessToken = () => (accessToken = null);

export const clearToken = () => {
  clearAccessToken();
};