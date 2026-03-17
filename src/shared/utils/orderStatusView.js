import { OrderStatus } from "shared/constants/orderStatus";

// 주문 상태
export const statusLabel = (s) => ({
  [OrderStatus.AWAITING_DEPOSIT]: "입금대기",
  [OrderStatus.DEPOSIT_CONFIRMED]: "입금확인",
  [OrderStatus.SHIPPED]: "배송중",
  [OrderStatus.DELIVERED]: "배송완료",
  [OrderStatus.CANCELED]: "취소",
}[s] || s);

export const statusColor = (s) => {
  switch (s) {
    case OrderStatus.AWAITING_DEPOSIT:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.DEPOSIT_CONFIRMED:
      return "bg-blue-100 text-blue-800";
    case OrderStatus.SHIPPED:
      return "bg-indigo-100 text-indigo-800";
    case OrderStatus.DELIVERED:
      return "bg-emerald-100 text-emerald-800";
    case OrderStatus.CANCELED:
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// 반품 상태
export const returnStatusLabel = (s) =>
  ({
    REQUESTED: "반품요청",
    APPROVED: "반품승인(환불대기)",
    REJECTED: "반품거절",
    REFUNDED: "환불완료",
  }[s] || s);

export const returnStatusColor = (s) => {
  switch (s) {
    case "REQUESTED":
      return "bg-amber-100 text-amber-800";
    case "APPROVED":
      return "bg-sky-100 text-sky-800";
    case "REJECTED":
      return "bg-rose-100 text-rose-800";
    case "REFUNDED":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};