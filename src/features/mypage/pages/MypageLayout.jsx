import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import LoginRequired from "features/mypage/pages/LoginRequired";
import { useAuth } from "features/auth/context/AuthContext";

const OrdersPanel = lazy(() => import("../panels/OrdersPanel"));
const CancellationsPanel = lazy(() => import("../panels/CancellationsPanel"));
const ReturnsPanel = lazy(() => import("../panels/ReturnsPanel"));
const ProfilePanel = lazy(() => import("../panels/ProfilePanel"));

const tabs = [
  { key: "orders", label: "전체 주문내역" },
  { key: "cancellations", label: "결제 취소 내역" },
  { key: "returns", label: "반품 내역" },
  { key: "profile", label: "내 정보 수정" },
];

export default function MyPageLayout() {
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("tab") || "orders";
  const setTab = (t) => setSp({ tab: t }, { replace: false });

  const { user, ready } = useAuth();

  if (!ready) return <div className="p-6">로딩중…</div>;
  if (!user) return <LoginRequired />;

  const username = user.username;

  const current = tab;

  return (
    <div className="mx-auto">
      {/* 모바일 탭바 (md 미만에서만 보임) */}
      <div className="md:hidden sticky top-0 z-20 bg-red-500 text-white border-b boarder-red-600">
        <div className="px-3 py-2 overflow-x-auto">
          <div className="flex gap-2 w-max">
            {tabs.map((t) => {
              const isActive = current === t.key;

              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={[
                    "shrink-0 rounded-full px-3 py-2 text-sm font-bold transition",
                    isActive
                      ? "bg-white text-red-600"
                      : "bg-red-500 text-white/80 border border-white/30 hover:text-white hover:border-white/60",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex min-h-[60vh]">
        {/* 데스크탑 사이드바 (md 이상에서만) */}
        <aside
          className="
            hidden md:block
            bg-red-500 text-white
            flex-none shrink-0
            sticky top-16
            h-[calc(100vh-4rem)]
            overflow-auto
            p-3 z-10
            w-64
          "
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="text-xl font-bold">나의 주문</div>
              <button
                type="button"
                onClick={() => setTab("orders")}
                className={`block rounded px-2 py-1 ${
                  tab === "orders" ? "text-white font-semibold" : "text-white/80 hover:text-black"
                }`}
              >
                전체 주문내역
              </button>
              <button
                type="button"
                onClick={() => setTab("cancellations")}
                className={`block rounded px-2 py-1 ${
                  tab === "cancellations"
                    ? "text-white font-semibold"
                    : "text-white/80 hover:text-black"
                }`}
              >
                결제 취소 내역
              </button>
              <button
                type="button"
                onClick={() => setTab("returns")}
                className={`block rounded px-2 py-1 ${
                  tab === "returns" ? "text-white font-semibold" : "text-white/80 hover:text-black"
                }`}
              >
                반품 내역
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xl font-bold">내 정보</div>
              <button
                type="button"
                onClick={() => setTab("profile")}
                className={`block rounded px-2 py-1 ${
                  tab === "profile" ? "text-white font-semibold" : "text-white/80 hover:text-black"
                }`}
              >
                내 정보 수정
              </button>
            </div>
          </div>
        </aside>

        {/* 본문 */}
        <section className="flex-1 min-w-0 p-3 sm:p-4">
          <Suspense fallback={<div>불러오는 중…</div>}>
            {tab === "orders" && <OrdersPanel username={username} />}
            {tab === "cancellations" && <CancellationsPanel />}
            {tab === "returns" && <ReturnsPanel />}
            {tab === "profile" && <ProfilePanel username={username} />}
          </Suspense>
        </section>
      </div>
    </div>
  );
}
