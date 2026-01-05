import { NavLink, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ProductGrid from "ui/components/ProductGrid";
import { request, getApiErrorMessage } from "shared/api/request";
import { PRODUCTS } from "shared/api/endpoints";

export default function CategoryPage() {
  const { categoryName } = useParams();

  const categories = ["all", "outer", "top", "bottom", "acc", "for-artist"];

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const category = categoryName || "all";

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      // 명세 우선: 서버에서 category 필터링 지원하면 이 방식이 최선
      // - all: look 제외
      // - 특정 카테고리: category=xxx
      const params =
        category === "all"
          ? { excludeCategory: "look" }
          : { category };

      // 예: GET /products?category=top or /products?excludeCategory=look
      const res = await request(PRODUCTS.ROOT, { params });

      // 명세 형태 가정: { data: [...], meta?: {...} }
      const rows = res?.data ?? res ?? [];
      setList(Array.isArray(rows) ? rows : []);
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

  // 서버가 excludeCategory를 지원하지 않는 경우를 대비한 안전장치(프론트 2차 필터)
  const filtered = useMemo(() => {
    if (!Array.isArray(list)) return [];
    if (category === "all") return list.filter((p) => p.category !== "look");
    return list.filter((p) => p.category === category);
  }, [list, category]);

  return (
    <>
      <header>
        <div className="flex justify-between gap-2 xl:gap-4 w-full xl:w-4/5 mx-auto p-5 bg-white">
          {categories.map((cat) => (
            <NavLink
              key={cat}
              to={`/category/${cat}`}
              className={({ isActive }) =>
                `text-2xl xl:text-5xl font-bold uppercase mb-5 px-3 py-2 transition-colors duration-200 ${
                  isActive ? "text-white" : "text-red-500"
                }`
              }
              style={({ isActive }) => (isActive ? { WebkitTextStroke: "1px red" } : {})}
            >
              {cat}
            </NavLink>
          ))}
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
              className="
                w-[320px] sm:w-[370px] md:w-[420px] xl:w-[470px] object-contain
                -translate-x-2 -translate-y-14
                sm:-translate-x-6 sm:-translate-y-12
                md:-translate-x-10 md:-translate-y-10
                xl:-translate-x-8 xl:-translate-y-20
              "
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
