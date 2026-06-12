export const AUTH = {
  LOGIN: "/auth/login",
  ME: "/auth/me",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",

  REGISTER: "/auth/register",
  PW_CHANGE: "/auth/change-password",
  PW_RESET_REQUEST: "/auth/password-reset/request",
  PW_RESET_CONFIRM: "/auth/password-reset/confirm",
};

export const PRODUCTS = {
  LIST: `/products`,
  DETAIL: (id) => `/products/${id}`,
};

export const CATEGORIES = { LIST: `/categories` };

export const SYSTEM = { POLICY: (key) => `/system/policies/${key}` };

export const ORDERS = {
  ROOT: "/orders",
  ID: (id) => `/orders/${id}`,

  GUEST_LOOKUP: "/orders/guest/lookup",

  CONFIRM: (id) => `/orders/${id}/confirm`,
  CANCEL: (id) => `/orders/${id}/cancel-request`,
  RETURN: (id) => `/orders/${id}/return-request`,
  // (선택) 배송 추적 정보
  TRACK: (id) => `/orders/${id}/tracking`,
};

export const NOTICES = {
  ROOT: "/notices",
  BY_ID: (id) => `/notices/${id}`,
};

export const ASKS = {
  ROOT: "/asks",
  BY_ID: (id) => `/asks/${id}`,
  REPLIES: (id) => `/asks/${id}/replies`,
};

export const RETURNS = {
  ROOT: `/returns`,
  ID: (id) => `/returns/${id}`,
};

export const USERS = {
  ME: `/users/me`,
  PROFILE: `/users/me/profile`,
  DEFAULT_ADDR: `/users/default-address`,
};

export const ADMIN = {
  UPLOADS: `/admin/uploads`,
  PRODUCTS: {
    ROOT: `/admin/products`,
    ID: (id) => `/admin/products/${id}`,
  },
  ORDERS: {
    ROOT: `/admin/orders`,
    ID: (id) => `/admin/orders/${id}`,
    DEPOSIT: (id) => `/admin/orders/${id}/deposit-confirm`,
    SHIP: (id) => `/admin/orders/${id}/ship`,
    REFUND: (id) => `/admin/orders/${id}/refund-log`,
    DELIVER: (id) => `/admin/orders/${id}/deliver`,
  },
  RETURNS: {
    ROOT: `/admin/returns`,
    APPROVE: (id) => `/admin/returns/${id}/approve`,
    REJECT: (id) => `/admin/returns/${id}/reject`,
  },
  NOTICES: {
    ROOT: `/admin/notices`,
    ID: (id) => `/admin/notices/${id}`,
  }
};
