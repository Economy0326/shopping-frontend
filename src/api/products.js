import { request } from "../lib/request";

export const ProductAPI = {
  list(params) {
    return request.get("/api/products", params); 
  },
  detail(id) {
    return request.get(`/api/products/${id}`); 
  },
};
