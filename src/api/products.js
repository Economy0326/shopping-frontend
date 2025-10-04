/* 카탈로그 API(상품 목록, 상품 상세, 카테고리 목록) */
import { api } from "../lib/request";
import { PRODUCTS, CATEGORIES } from "../constants/apiRoutes";

export const ProductsAPI = {
  list: (params) => api.get(PRODUCTS.LIST, { params }).then(r => r.data),
  byId: (id) => api.get(PRODUCTS.DETAIL(id)).then(r => r.data),
};

export const CategoriesAPI = {
  list: () => api.get(CATEGORIES.LIST).then(r => r.data),
};