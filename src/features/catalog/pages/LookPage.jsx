//룩 카테고리 페이지
import { useEffect, useState } from "react";
import LookGrid from "ui/components/look/LookGrid";
import { request, getApiErrorMessage } from "shared/api/request";
import { PRODUCTS } from "shared/api/endpoints";

export default function LookPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      // 예: GET /products?category=look
      const res = await request(PRODUCTS.ROOT, { params: { category: "look" } });
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
  }, []);

  return (
    <>
      <header className="bg-white py-8 text-center">
        <h1
          className={`relative sm:-translate-x-1 md:-translate-x-1 xl:-translate-x-1 text-red-500 
                      text-4xl xl:text-5xl font-bold uppercase px-2 sm:-translate-y-2`}
        >
          LOOK
        </h1>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="min-h-[50vh] grid place-items-center">
            <p>로딩중…</p>
          </div>
        ) : err ? (
          <div className="min-h-[50vh] grid place-items-center">
            <p className="text-rose-600">{err}</p>
          </div>
        ) : list.length > 0 ? (
          <LookGrid products={list} />
        ) : (
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
        )}
      </main>
    </>
  );
}
