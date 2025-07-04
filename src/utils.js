// 별점 렌더링 (기존에 있던 renderStars도 여기에 같이)
export function renderStars(rating) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push("★");
  }
  if (hasHalfStar) {
    stars.push("☆"); // 또는 반 별 아이콘
  }
  while (stars.length < 5) {
    stars.push("☆");
  }

  return stars.join("");
}

// 가격 문자열에서 숫자만 뽑아 정수로 변환 (₩29,000 -> 29000)
export function parsePrice(priceString) {
  return parseInt(priceString.replace(/[^\d]/g, ""), 10);
}