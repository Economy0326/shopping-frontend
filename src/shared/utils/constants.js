export const STATUS_UI = {
  AWAITING_DEPOSIT: { label: '입금대기', color: 'bg-yellow-100 text-yellow-800' },
  DEPOSIT_CONFIRMED:{ label: '입금확인', color: 'bg-emerald-100 text-emerald-800' },
  FULFILLING:       { label: '준비중',   color: 'bg-blue-100 text-blue-800' },
  SHIPPED:          { label: '발송완료', color: 'bg-indigo-100 text-indigo-800' },
  DELIVERED:        { label: '배송완료', color: 'bg-gray-100 text-gray-800' },
};

export const LABEL_TO_STATUS = {
  '입금대기': 'AWAITING_DEPOSIT',
  '입금확인': 'DEPOSIT_CONFIRMED',
  '준비중':   'FULFILLING',
  '발송완료': 'SHIPPED',
  '배송완료': 'DELIVERED',
};

export const CARRIERS = {
  KOREA_POST: {
    label: '우체국',
    trackUrl: (no) =>
      `https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${encodeURIComponent(no)}`
  },
};

export const statusLabel = (code) => STATUS_UI[code]?.label ?? code;
export const statusColor = (code) => STATUS_UI[code]?.color ?? 'bg-gray-100 text-gray-800';
