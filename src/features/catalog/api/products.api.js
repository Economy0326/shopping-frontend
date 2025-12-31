import { request } from "shared/api/request";
import { PRODUCTS, CATEGORIES } from "shared/api/endpoints";

export const ProductsAPI = {
  // GET /products?page=...&size=...&categoryId=...&sort=...
  list(params = {}) {
    return request(PRODUCTS.LIST, { params });
  },

  // GET /products/{id}
  get(id) {
    return request(PRODUCTS.DETAIL(id));
  },
};

export const CategoriesAPI = {
  // GET /categories
  list() {
    return request(CATEGORIES.LIST);
  },
};