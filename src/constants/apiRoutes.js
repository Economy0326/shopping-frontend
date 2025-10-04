export const API_PREFIX = ""; 

export const AUTH = {
  LOGIN:   `${API_PREFIX}/auth/login`,
  REFRESH: `${API_PREFIX}/auth/refresh`,
  ME:      `${API_PREFIX}/auth/me`,
  LOGOUT:  `${API_PREFIX}/auth/logout`,
  REGISTER:`${API_PREFIX}/auth/register`,
  PW_CHANGE: `${API_PREFIX}/auth/change-password`,
};

export const PRODUCTS = {
  LIST:   `${API_PREFIX}/products`,
  DETAIL: (id) => `${API_PREFIX}/products/${id}`,
};

export const CATEGORIES = {
  LIST: `${API_PREFIX}/categories`,
};

export const SYSTEM = {
  POLICY: (key) => `${API_PREFIX}/system/policies/${key}`,
};

// ===== 체크아웃 =====
// 주석만 남겨두고 실제로는 OrdersAPI.checkout을 쓰고 있으므로
// CHECKOUT 상수는 없어도 됩니다. 계속 쓸 계획이면 유지해도 OK.
// export const CHECKOUT = {
//   SUMMARY:        `/checkout/summary`,
//   BANK_ACCOUNTS:  `/checkout/bank-accounts`,
//   CREATE:         `/checkout`,
//   DEPOSIT_NOTICE: `/checkout/deposit-notice`,
// };

export const ORDERS = {
  ROOT:    `${API_PREFIX}/orders`,             // 내 주문 목록
  ID:      (id) => `${API_PREFIX}/orders/${id}`, 
  CONFIRM: (id) => `${API_PREFIX}/orders/${id}/confirm`,
  CANCEL:  (id) => `${API_PREFIX}/orders/${id}/cancel-request`,
  RETURN:  (id) => `${API_PREFIX}/orders/${id}/return-request`,
  TRACK:   (id) => `${API_PREFIX}/orders/${id}/tracking`, // (선택)
};

export const RETURNS = {
  ROOT:   `${API_PREFIX}/returns`,
  ID:     (id) => `${API_PREFIX}/returns/${id}`,
};

export const USERS = {
  ME:            `${API_PREFIX}/users/me`,
  PROFILE:       `${API_PREFIX}/users/me/profile`,
  DEFAULT_ADDR:  `${API_PREFIX}/users/default-address`,
};

export const ADMIN = {
  UPLOADS: `${API_PREFIX}/admin/uploads`,
  PRODUCTS: {
    ROOT:   `${API_PREFIX}/admin/products`,
    ID:     (id) => `${API_PREFIX}/admin/products/${id}`,
  },
  ORDERS: {
    ROOT:   `${API_PREFIX}/admin/orders`,
    ID:     (id) => `${API_PREFIX}/admin/orders/${id}`,
    DEPOSIT:(id) => `${API_PREFIX}/admin/orders/${id}/deposit-confirm`,
    SHIP:   (id) => `${API_PREFIX}/admin/orders/${id}/ship`,
    REFUND: (id) => `${API_PREFIX}/admin/orders/${id}/refund-log`,
    CANCEL_APPROVE:(id)=>`${API_PREFIX}/admin/orders/${id}/cancel-approve`,
    CANCEL_REJECT: (id)=>`${API_PREFIX}/admin/orders/${id}/cancel-reject`,
  },
  RETURNS: {
    ROOT: `${API_PREFIX}/admin/returns`, // (선택) 반품 목록/조회 필요 시
    APPROVE:(id)=>`${API_PREFIX}/admin/returns/${id}/approve`,
    REJECT: (id)=>`${API_PREFIX}/admin/returns/${id}/reject`,
  },
};
