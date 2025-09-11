import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import LoginRequired from "./LoginRequired";

const OrdersPanel = lazy(() => import("./panels/OrdersPanel"));
const CancellationsPanel = lazy(() => import("./panels/CancellationsPanel"));
const ReturnsPanel = lazy(() => import("./panels/ReturnsPanel"));
const ProfilePanel = lazy(() => import("./panels/ProfilePanel"));

export default function MyPageLayout({ isLoggedIn, username, onLogout}) {
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("tab") || "orders";
  const setTab = (t) => setSp({ tab: t }, { replace: false });
  
  // 비로그인: 어떤 /mypage 로 와도 항상 고정 화면
  if (!isLoggedIn) return <LoginRequired />;

  const itemCls = ({ isActive }) =>
    `block rounded ${isActive ?  "text-white" : "hover:text-black"}`

  return (
    <div className="mx-auto">
      <div className="flex">
        {/* 사이드바 */}
        <aside className="bg-red-500 flex-none shrink-0 sticky top-16
                          h-[calc(100vh-4rem)] overflow-auto p-3 z-10
                          w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6 min-w-[200px]">
          <div className="space-y-5">
            {/* 주문 관련 */}
            <div className="space-y-2">
              <div className="text-xl text-white font-bold">나의 주문</div>
              <button
                className={`${itemCls("orders")} outline-none ring-0 [appearance:none]`}
                onClick={() => setTab("orders")}
              >
                전체 주문내역
              </button>
              <button
                className={`${itemCls("cancellations")} outline-none ring-0 [appearance:none]`}
                onClick={() => setTab("cancellations")}
              >
                결제 취소 내역
              </button>
              <button
                className={`${itemCls("returns")} outline-none ring-0 [appearance:none]`}
                onClick={() => setTab("returns")}
              >
                반품 내역
              </button>
            </div>

            {/* 내 정보 수정 */}
            <div className="space-y-2">
              <div className="text-xl text-white font-bold">내 정보</div>
              <button
                className={`${itemCls("profile")} outline-none ring-0 [appearance:none]`}
                onClick={() => setTab("profile")}
              >
                내 정보 수정
              </button>
            </div>
          </div>
        </aside>

        {/* 본 내용 */}
        <section className="flex-1 min-w-0 p-4 min-h-[60vh]">
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