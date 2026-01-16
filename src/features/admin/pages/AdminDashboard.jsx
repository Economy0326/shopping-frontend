import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";

import AdminOrdersPage from "features/admin/pages/AdminOrdersPage";
import AdminProductsPage from "features/admin/pages/AdminProductsPage";

export default function AdminDashboard() {
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("tab") || "orders";

  const setTab = (t) => setSp({ tab: t }, { replace: false });

  const activeCls = (key) =>
    `px-3 py-2 rounded-xl border font-extrabold uppercase tracking-tight text-sm ${
      tab === key ? "bg-red-500 text-white border-red-500" : "bg-white text-red-500 border-red-500"
    }`;

  const content = useMemo(() => {
    if (tab === "products") return <AdminProductsPage />;
    return <AdminOrdersPage />;
  }, [tab]);

  return (
    <main className="max-w-7xl mx-auto p-6">
      <header className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">ADMIN</h1>

        <div className="flex items-center gap-2">
          <button className={activeCls("orders")} onClick={() => setTab("orders")}>
            ORDERS
          </button>
          <button className={activeCls("products")} onClick={() => setTab("products")}>
            PRODUCTS
          </button>

          {/* 필요하면 상품 등록 바로가기 */}
          <Link
            to="/admin/products/new"
            className="px-3 py-2 rounded-xl border font-extrabold uppercase tracking-tight text-sm bg-white text-red-500 border-red-500"
          >
            + NEW
          </Link>
        </div>
      </header>

      {/* 아래에 “바로” 내용 렌더 */}
      {content}
    </main>
  );
}
