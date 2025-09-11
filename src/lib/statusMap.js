// src/lib/statusMap.js
export const ORDER_STATUS = {
  AWAITING_DEPOSIT: "입금대기",
  DEPOSIT_CONFIRMED: "입금확인",
  FULFILLING: "준비중",
  SHIPPED: "발송완료",
  DELIVERED: "배송완료",
};
export const labelOfStatus = (code) => ORDER_STATUS[code] ?? code ?? "-";
