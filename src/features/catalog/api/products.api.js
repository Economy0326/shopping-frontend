/* 카탈로그 API(상품 목록, 상품 상세, 카테고리 목록) */
import { request } from "shared/api/request";
import { PRODUCTS, CATEGORIES } from "shared/api/endpoints";

export const ProductsAPI = {
  list: (params) => request(PRODUCTS.LIST, { params }),
  byId: (id) => request(PRODUCTS.DETAIL(id)),
};

export const CategoriesAPI = {
  list: () => request(CATEGORIES.LIST),
};