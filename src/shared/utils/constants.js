import { OrderStatus } from "shared/utils/orderPolicy";

// 상태 라벨
export function statusLabel(status) {
  const map = {
    [OrderStatus.AWAITING_DEPOSIT]: "입금대기",
    [OrderStatus.PAID]: "결제완료",
    [OrderStatus.SHIPPED]: "배송중",
    [OrderStatus.DELIVERED]: "배송완료",
    [OrderStatus.CANCELED]: "취소",
  };
  return map[status] || status || "-";
}

// 상태 색상(배지용)
export function statusColor(status) {
  const map = {
    [OrderStatus.AWAITING_DEPOSIT]: "bg-amber-100 text-amber-800",
    [OrderStatus.PAID]: "bg-blue-100 text-blue-800",
    [OrderStatus.SHIPPED]: "bg-indigo-100 text-indigo-800",
    [OrderStatus.DELIVERED]: "bg-emerald-100 text-emerald-800",
    [OrderStatus.CANCELED]: "bg-rose-100 text-rose-800",
  };
  return map[status] || "bg-gray-100 text-gray-700";
}
