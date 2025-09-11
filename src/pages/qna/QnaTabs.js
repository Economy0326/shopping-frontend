import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";

const NoticeListPage = lazy(() => import("./NoticeListPage"));
const AskListPage = lazy(() => import("./AskListPage"));
const FaqPanel = lazy(() => import("./panels/FaqPanel"));

export default function QnaPage({ isLoggedIn, username, currentUserId, isAdmin }) {
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("tab") || "notice"; // 'notice' | 'ask' | 'faq'
  const setTab = (t) => setSp({ tab: t }, { replace: false });

  const tabBtn = (key) =>
    `${tab === key ? "font-bold text-4xl text-red-500 border-b-2 border-red-500" : "font-bold text-4xl text-red-500 hover:text-red-500"}`;

  return (
    <main className="max-w-5xl mx-auto pb-16">
      <nav className="sticky top-16 bg-white z-10">
        <h1 className="mb-2 font-bold text-5xl text-red-500 text-center">QUESTION AND ANSWER</h1>
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

      <Suspense fallback={<div className="py-6">불러오는 중…</div>}>
        {tab === "notice" && <NoticeListPage />}
        {tab === "ask" && (
          <AskListPage 
            currentUserId = {currentUserId}
            currentUserName={username}
            isAdmin={isAdmin}
          />
        )}
        {tab === "faq" && <FaqPanel />}
      </Suspense>
    </main>
  );
}
