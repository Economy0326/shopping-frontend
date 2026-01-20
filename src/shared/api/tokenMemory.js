let accessToken = null;

// 메모리 전용 accessToken 관리
export const setAccessToken = (t) => {
  accessToken = t || null;
};

export const getAccessToken = () => accessToken;

export const clearToken = () => {
  accessToken = null;
};