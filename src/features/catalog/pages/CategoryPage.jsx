import { NavLink, useParams } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import ProductGrid from "ui/components/ProductGrid";
import { request, getApiErrorMessage } from "shared/api/request";
import { PRODUCTS } from "shared/api/endpoints";
import { pickData } from "shared/api/pickers";

export default function CategoryPage() {
  const { categoryName } = useParams();
  const categories = ["all", "outer", "top", "bottom", "acc", "for-artist"];

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const category = categoryName || "all";

  const activeLinkRef = useRef(null);
  const scrollRef = useRef(null);
  const dragRef = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
  });

  // category 변경 시 현재 탭이 보이도록만 이동
  // center로 두면 오른쪽 탭 클릭 시 왼쪽이 과하게 잘려 보일 수 있어서 nearest로 변경
  useEffect(() => {
    // 레이아웃/폰트 적용 후 스크롤되도록 RAF 2번
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        activeLinkRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      });
    });
  }, [category]);

  const onDragStart = (e) => {
    if (!scrollRef.current) return;
    dragRef.current.isDown = true;
    dragRef.current.startX = e.pageX;
    dragRef.current.scrollLeft = scrollRef.current.scrollLeft;
  };

  const onDragMove = (e) => {
    if (!dragRef.current.isDown || !scrollRef.current) return;
    e.preventDefault();
    const dx = e.pageX - dragRef.current.startX;
    scrollRef.current.scrollLeft = dragRef.current.scrollLeft - dx;
  };

  const onDragEnd = () => {
    dragRef.current.isDown = false;
  };

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      const params =
        category === "all" ? { excludeCategory: "look" } : { category };

      const res = await request(PRODUCTS.LIST, { params });
      const data = pickData(res); // data만 꺼냄
      const rows = Array.isArray(data) ? data : [];

      setList(rows);
    } catch (e) {
      setErr(getApiErrorMessage(e));
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [category]);

  const filtered = useMemo(() => {
    if (!Array.isArray(list)) return [];
    if (category === "all") return list.filter((p) => p.categorySlug !== "look");
    return list.filter((p) => p.categorySlug === category);
  }, [list, category]);

  return (
    <>
      <header>
        {/* 한 줄 유지 + 현재 본문 폭 안에서만 자연스럽게 스크롤 */}
        {/* 카테고리 바만 억지로 전체폭 확장하지 않아서 아래 상품영역이 비어 보이지 않음 */}
        <div className="relative w-full sm:w-[80%] mx-auto py-4 bg-white">
          <div
            ref={scrollRef}
            className="
              flex flex-nowrap items-center justify-start
              gap-3 sm:gap-6 lg:gap-8 xl:gap-10
              overflow-x-auto
              px-2 sm:px-3
              scroll-smooth cursor-grab active:cursor-grabbing
              [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
              [scroll-snap-type:x_proximity]
            "
            onMouseDown={onDragStart}
            onMouseMove={onDragMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
          >
            {categories.map((cat) => (
              <NavLink
                key={cat}
                to={`/category/${cat}`}
                ref={category === cat ? activeLinkRef : null}
                className={({ isActive }) =>
                  `shrink-0 text-xl sm:text-2xl lg:text-3xl xl:text-5xl font-bold uppercase px-1 py-2 transition-colors duration-200
                  [scroll-snap-align:start]
                  ${isActive ? "text-white" : "text-red-500"}`
                }
                style={({ isActive }) =>
                  isActive ? { WebkitTextStroke: "1px red" } : {}
                }
              >
                {cat}
              </NavLink>
            ))}
          </div>

          {/* 페이드 힌트
              폭을 줄여서 양끝 텍스트를 과하게 가리지 않게 조정 */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 sm:w-8 bg-gradient-to-r from-white via-white/90 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-10 bg-gradient-to-l from-white via-white/90 to-transparent" />
        </div>
      </header>

      <main>
        {loading ? (
          <div className="min-h-[50vh] grid place-items-center">
            <p>로딩중…</p>
          </div>
        ) : err ? (
          <div className="min-h-[50vh] grid place-items-center">
            <p className="text-rose-600">{err}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="min-h-[50vh] grid place-items-center">
            <img
              src="/mood/nothing.png"
              alt="nothing"
              className="w-[320px] sm:w-[370px] md:w-[420px] xl:w-[470px] object-contain"
            />
          </div>
        ) : (
          <div className="p-6 max-w-7xl mx-auto">
            <ProductGrid products={filtered} />
          </div>
        )}
      </main>
    </>
  );
}