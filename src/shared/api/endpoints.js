export const AUTH = {
  LOGIN:   `/auth/login`,
  REFRESH: `/auth/refresh`,
  ME:      `/auth/me`,
  LOGOUT:  `/auth/logout`,
  REGISTER:`/auth/register`,
  PW_CHANGE: `/auth/change-password`,
};

export const PRODUCTS = {
  LIST:   `/products`,
  DETAIL: (id) => `/products/${id}`,
};

export const CATEGORIES = { LIST: `/categories` };

export const SYSTEM = { POLICY: (key) => `/system/policies/${key}` };

export const ORDERS = {
  ROOT:    `/orders`,
  ID:      (id) => `/orders/${id}`,
  CONFIRM: (id) => `/orders/${id}/confirm`,
  CANCEL:  (id) => `/orders/${id}/cancel-request`,
  RETURN:  (id) => `/orders/${id}/return-request`,
  TRACK:   (id) => `/orders/${id}/tracking`,
};

export const RETURNS = {
  ROOT:   `/returns`,
  ID:     (id) => `/returns/${id}`,
};

export const USERS = {
  ME:            `/users/me`,
  PROFILE:       `/users/me/profile`,
  DEFAULT_ADDR:  `/users/default-address`,
};

export const ADMIN = {
  UPLOADS: `/admin/uploads`,
  PRODUCTS: {
    ROOT:   `/admin/products`,
    ID:     (id) => `/admin/products/${id}`,
  },
  ORDERS: {
    ROOT:   `/admin/orders`,
    ID:     (id) => `/admin/orders/${id}`,
    DEPOSIT:(id) => `/admin/orders/${id}/deposit-confirm`,
    SHIP:   (id) => `/admin/orders/${id}/ship`,
    REFUND: (id) => `/admin/orders/${id}/refund-log`,
    CANCEL_APPROVE:(id)=>`/admin/orders/${id}/cancel-approve`,
    CANCEL_REJECT: (id)=>`/admin/orders/${id}/cancel-reject`,
  },
  RETURNS: {
    ROOT: `/admin/returns`,
    APPROVE:(id)=>`/admin/returns/${id}/approve`,
    REJECT: (id)=>`/admin/returns/${id}/reject`,
  },
};