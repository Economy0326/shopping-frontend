import { OrderStatus } from "shared/constants/orderStatus";

export const statusLabel = (s) => ({
  [OrderStatus.AWAITING_DEPOSIT]: "입금대기",
  [OrderStatus.DEPOSIT_CONFIRMED]: "입금확인",
  [OrderStatus.SHIPPED]: "배송중",
  [OrderStatus.DELIVERED]: "배송완료",
  [OrderStatus.CANCELED]: "취소",
}[s] || s);

export const statusColor = (s) => {
  switch (s) {
    case OrderStatus.AWAITING_DEPOSIT: return "bg-yellow-100 text-yellow-800";
    case OrderStatus.DEPOSIT_CONFIRMED: return "bg-blue-100 text-blue-800";
    case OrderStatus.SHIPPED: return "bg-indigo-100 text-indigo-800";
    case OrderStatus.DELIVERED: return "bg-emerald-100 text-emerald-800";
    case OrderStatus.CANCELED: return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
};
