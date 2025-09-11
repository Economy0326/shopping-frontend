import { request } from "../lib/request";   // 상대경로로
const idem = () => ({
  "Idempotency-Key": (crypto?.randomUUID?.() || String(Date.now()))
});

export const PaymentsAPI = {
  getBankAccounts: () => request.get("/api/payments/bank-accounts"),
  // request.post(url, body, headers) 는 3번째 인자에 'headers 객체'를 직접 넘깁니다.
  depositNotice: (body) => request.post("/api/payments/deposit-notice", body, idem()),
};
