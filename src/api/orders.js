import { request } from "../lib/request";

export const OrdersAPI = {
  // POST /api/orders -> { id }
  create(order) {
    return request(`/api/orders`, {method: "POST", body:order});
  },

  // GET /api/orders/:id
  get(id) {
    return request(`/api/orders/${id}`);
  },

  //PATCH /api/orders/:id
  patch(id, patch) {
    return request(`/api/orders/${id}`, {method: "PATCH", body: patch});
  },

  // GET /api/orders?me[&cursor=&limit=&q=]
  listMine(cursor, q, limit) {
    const p = new URLSearchParams();
    p.set("me",""); //=> `?me`형태
    if (cursor) p.set("cursor",cursor);
    if (q) p.set("q",q);
    if (limit) p.set("limit",limit);
    const qs = p.toString().replace(/=%20?/g,""); //me= -> me
    return request(`/api/orders?${qs}`);
  },
  
  // GET /api/orders[?q=&cursor=&limit=&status=] (admin)
  listAdmin({ q, cursor, limit, status } = {}) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (cursor) p.set("cursor", cursor);
    if (limit) p.set("limit", limit);
    if (status) p.set("status", status);
    const qs = p.toString();
    return request(`/api/orders${qs ? `?${qs}` : ""}`);
  },


}