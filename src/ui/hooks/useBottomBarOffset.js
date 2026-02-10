import { useEffect, useState } from "react";

/**
 * 모바일 키보드/하단 safe-area 때문에 fixed bottom bar가 가리는 문제 해결용
 * - iOS Safari/Chrome: visualViewport로 키보드 올라온 만큼 bottom offset을 올림
 * - visualViewport 없으면 0
 */
export function useBottomBarOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const onResize = () => {
      // 화면(레이아웃) 높이 - visualViewport 높이 = 키보드/브라우저 UI로 가려진 영역(대략)
      const keyboardLike = Math.max(0, window.innerHeight - vv.height - (vv.offsetTop || 0));
      setOffset(Math.round(keyboardLike));
    };

    onResize();
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize); // iOS에서 주소창/키보드 변화 때 도움됨

    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, []);

  return offset; // px
}
