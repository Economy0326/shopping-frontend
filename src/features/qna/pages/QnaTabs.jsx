import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "features/auth/context/AuthContext";
import FaqPanelV2 from "../panels/FaqPanelV2";

const NoticeListPage = lazy(() => import("./NoticeListPage"));
const AskListPage = lazy(() => import("./AskListPage"));

export default function QnaTabs() {
  const { user, ready } = useAuth();

  const isLoggedIn = !!user;
  const username = user?.username || user?.email || "";
  const currentUserId = user?.id ?? null;
  const isAdmin = String(user?.role ?? "").toLowerCase() === "admin";

  const [sp, setSp] = useSearchParams();
  const tab = sp.get("tab") || "notice";
  const setTab = (t) => setSp({ tab: t }, { replace: false });

  const tabBtn = (key) =>
    tab === key
      ? "font-bold text-4xl text-red-500 border-b-2 border-red-500"
      : "font-bold text-4xl text-red-500 hover:text-red-500";

  return (
    <main className="max-w-5xl mx-auto pb-16">
      <nav className="sticky top-16 bg-white z-10">
        <h1 className="mb-2 font-bold text-5xl text-red-500 text-center">
          QUESTION AND ANSWER
        </h1>
        <ul className="flex gap-2 justify-center">
          <li>
            <button
              className={`${tabBtn("notice")} outline-none ring-0 [appearance:none]`}
              onClick={() => setTab("notice")}
            >
              공지
            </button>
          </li>
          <li className="font-bold text-4xl text-red-500"> / </li>
          <li>
            <button
              className={`${tabBtn("ask")} outline-none ring-0 [appearance:none]`}
              onClick={() => setTab("ask")}
            >
              무.물.보
            </button>
          </li>
          <li className="font-bold text-4xl text-red-500"> / </li>
          <li>
            <button
              className={`${tabBtn("faq")} outline-none ring-0 [appearance:none]`}
              onClick={() => setTab("faq")}
            >
              자주묻는질문
            </button>
          </li>
        </ul>
      </nav>

      {!ready ? (
        <div className="py-6">로딩중…</div>
      ) : (
        <Suspense fallback={<div className="py-6">불러오는 중…</div>}>
          {tab === "notice" && <NoticeListPage />}
          {tab === "ask" && (
            <AskListPage
              isLoggedIn={isLoggedIn}
              currentUserId={currentUserId}
              currentUserName={username}
              isAdmin={isAdmin}
            />
          )}
          {tab === "faq" && <FaqPanelV2 />}
        </Suspense>
      )}
    </main>
  );
}