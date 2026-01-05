export const OrderStatus = {
  AWAITING_DEPOSIT: "AWAITING_DEPOSIT",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELED: "CANCELED",
};

// 취소 요청 가능 조건
export const canCancel = (status) => status === OrderStatus.AWAITING_DEPOSIT;

// 반품 신청은 delivered 이후(명세에 따라 shipped 허용이면 여기 바꾸면 됨)
export const canReturn = (status) => status === OrderStatus.DELIVERED;

// 구매확정 버튼 노출 조건
export const canConfirm = (status) => status === OrderStatus.SHIPPED;

// 배송정보 섹션 노출 조건
export const isShippingVisible = (status) =>
  status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED;

// 입금 안내 노출 조건
export const isBankInfoVisible = (status) =>
  status === OrderStatus.AWAITING_DEPOSIT;