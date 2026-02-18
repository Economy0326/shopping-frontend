import { ShippingCarriers } from "shared/constants/shippingCarriers";

export function buildTrackingUrl(carrier, trackingNo) {
  const noRaw = String(trackingNo ?? "").trim();
  if (!noRaw) return null;

  const no = encodeURIComponent(noRaw);

  const c = String(carrier ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s|-/g, "_"); // "korea-post" 같은 케이스도 흡수

  // 우체국: 표준은 KOREA_POST, 별칭 KOREAPOST도 허용
  if (c === ShippingCarriers.KOREA_POST || c === "KOREAPOST") {
    return `https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${no}`;
  }

  return null;
}
