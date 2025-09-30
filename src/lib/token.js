// access토큰 관련 코드
let accessToken = null;

export const setAccessToken = (t) => (accessToken = t);
export const clearAccessToken = () => (accessToken = null);
export const getAccessToken = () => accessToken;
