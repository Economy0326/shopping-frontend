import { request } from "../lib/request";
import { idKey } from "../lib/idempotency";

export const CheckoutAPI = {
  createOrder: (payload /* {items[], receiver{}, payment{}, ...} */) =>
    request.post("/api/checkout", payload, { "Idempotency-Key": idKey() }),
};