import { OrderStatus } from "shared/constants/orderStatus";

export const canCancel = (status) => status === "AWAITING_DEPOSIT";

export const canConfirm = (status) => status === OrderStatus.SHIPPED;
export const canReturn = (status) => status === OrderStatus.DELIVERED;

export const isShippingVisible = (status) =>
  status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED;

export const isBankInfoVisible = (status) =>
  status === OrderStatus.AWAITING_DEPOSIT;
