export const STATUS_UI = {
  AWAITING_DEPOSIT: { label: "입금대기", color: "bg-yellow-100 text-yellow-800" },
  DEPOSIT_CONFIRMED:{ label: "입금확인", color: "bg-emerald-100 text-emerald-800" },
  SHIPPED:          { label: "발송완료", color: "bg-indigo-100 text-indigo-800" },
  DELIVERED:        { label: "배송완료", color: "bg-gray-100 text-gray-800" },
  CANCELED:         { label: "취소",     color: "bg-rose-100 text-rose-800" },
};

export const statusLabel = (code) => STATUS_UI[code]?.label ?? code;
export const statusColor = (code) => STATUS_UI[code]?.color ?? "bg-gray-100 text-gray-800";
