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

  // category 변경 시 중앙으로
  useEffect(() => {
    // 레이아웃/폰트 적용 후 스크롤되도록 RAF 2번
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        activeLinkRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      });
    });
  }, [category]);

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
        {/* (모바일) 스냅/스크롤 + (sm+) 스크롤 없이 전체 노출 */}
        <div className="relative w-full sm:w-[80%] mx-auto px-4 py-4 bg-white">
          <div
            className="
              flex flex-nowrap items-center 
              justify-start sm:justify-between
              gap-3 sm:gap-6 xl:gap-10
              overflow-x-auto sm:overflow-x-visible
              scroll-smooth
              [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
              [scroll-snap-type:x_mandatory] sm:[scroll-snap-type:none]
            "
          >
            {categories.map((cat) => (
              <NavLink
                key={cat}
                to={`/category/${cat}`}
                ref={category === cat ? activeLinkRef : null}
                className={({ isActive }) =>
                  `shrink-0 text-2xl sm:text-3xl xl:text-5xl font-bold uppercase px-3 py-2 transition-colors duration-200
                  [scroll-snap-align:center]
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

          {/* 페이드 힌트(오른쪽) */}
          <div className="sm:hidden pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white via-white/90 to-transparent" />
          {/* 페이드 힌트(왼쪽) */}
          <div className="sm:hidden pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white via-white/90 to-transparent" />
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
