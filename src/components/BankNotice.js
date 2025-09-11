//무통장 안내 공통 컴포턴트
import { E } from "../../lib/env";

export default function BankNotice() {
  return (
    <div className="rounded-xl border p-4 bg-gray-50">
      <div>입금은행: {E.BANK_NAME}</div>
      <div>계좌번호: {E.BANK_ACCOUNT}</div>
      <div>예금주: {E.BANK_HOLDER}</div>
    </div>
  );
}