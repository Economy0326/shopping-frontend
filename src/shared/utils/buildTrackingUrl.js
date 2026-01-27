export function buildTrackingUrl(carrier, trackingNo) {
  if (!trackingNo) return null;

  const no = encodeURIComponent(String(trackingNo).trim());

  // 우체국
  if (carrier === "KOREA_POST" || carrier === "KOREAPOST") {
    return `https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${no}`;
  }

  return null;
}
