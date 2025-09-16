export const API_PREFIX = "/api"; 

export const AUTH = {
  LOGIN:   `${API_PREFIX}/auth/login`,
  REFRESH: `${API_PREFIX}/auth/refresh`,
  ME:      `${API_PREFIX}/auth/me`,
  LOGOUT:  `${API_PREFIX}/auth/logout`,
  REGISTER:`${API_PREFIX}/auth/register`,
  PW_CHANGE: `${API_PREFIX}/auth/password-change`,
};

export const PRODUCTS = {
  LIST:   `${API_PREFIX}/products`,
  DETAIL: (id) => `${API_PREFIX}/products/${id}`,
};

export const SYSTEM = {
  POLICY: (key) => `${API_PREFIX}/system/policies/${key}`,
};

export const ORDERS = {
  ROOT:   `${API_PREFIX}/orders`,
  ID:     (id) => `${API_PREFIX}/orders/${id}`,
  CONFIRM:(id) => `${API_PREFIX}/orders/${id}/confirm`,
};

export const RETURNS = {
  ROOT:   `${API_PREFIX}/returns`,
  ID:     (id) => `${API_PREFIX}/returns/${id}`,
};

export const PAYMENTS = {
  BANKS:  `${API_PREFIX}/payments/bank-accounts`,
  DEPOSIT:`${API_PREFIX}/payments/deposit-notice`,
};

export const USERS = {
  ME:           `${API_PREFIX}/users/me`,
  DEFAULT_ADDR: `${API_PREFIX}/users/default-address`,
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
    APPROVE:(id)=>`${API_PREFIX}/admin/returns/${id}/approve`,
    REJECT: (id)=>`${API_PREFIX}/admin/returns/${id}/reject`,
  },
};

export const CATEGORIES = {
  LIST: `${API_PREFIX}/categories`,
};