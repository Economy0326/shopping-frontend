import { request } from "../lib/request";
import { PRODUCTS } from "../constants/apiRoutes";

export const ProductAPI = {
  // list(params) → { items, total }
  list:  (params) => request.get(PRODUCTS.LIST, params),
  // detail(id) → { id, name, price, images, isLook, sizeGuideMd, productInfoMd, lookMd, ... }
  detail:(id)     => request.get(PRODUCTS.DETAIL(id)),
};
