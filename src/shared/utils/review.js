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

// 리뷰별 반응 함수
export function getRatingReaction(rating) {
            if (rating >= 4.5) return "꼭 사야돼";
            if (rating >= 4.0) return "꽤 괜찮음";
            if (rating >= 3.0) return "슬슬 애매해";
            if (rating >= 2.0) return "이거 살거야?";
            return "이 옷은 포기";
          }