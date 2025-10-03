// access토큰 관련 코드
let accessToken = null;
let refreshToken = null;

export const setAccessToken = (t) => (accessToken = t);
export const clearAccessToken = () => (accessToken = null);
export const getAccessToken = () => accessToken;

export const setRefreshToken = (t) => (refreshToken = t);
export const getRefreshToken = () => refreshToken;
export const clearRefreshToken = () => (refreshToken = null);