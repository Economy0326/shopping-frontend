// 가격 문자열에서 숫자만 뽑아 정수로 변환 (₩29,000 -> 29000)
export function parsePrice(priceString) {
  return parseInt(priceString.replace(/[^\d]/g, ""), 10);
}