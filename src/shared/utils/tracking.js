// 우체국 반품 추적 url 생성 유틸
export function buildTrackingUrl(carrier, trackingNo) {
  if (!trackingNo) return null;
  const no = encodeURIComponent(String(trackingNo).trim());
  if (carrier === "KOREA_POST" || carrier === "KOREAPOST") {
    // 우체국 국내우편/소포 조회
    return `https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?displayHeader=N&sid1=${no}`;
  }
  return null; // 다른 택배사는 필요해지면 추가
}
