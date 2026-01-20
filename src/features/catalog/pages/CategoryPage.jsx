import { NavLink, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      const params =
        category === "all" ? { excludeCategory: "look" } : { category };

      const res = await request(PRODUCTS.LIST, { params });
      const data = pickData(res);          // data만 꺼냄
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
              style={({ isActive }) =>
                isActive ? { WebkitTextStroke: "1px red" } : {}
              }
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
