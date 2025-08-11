import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";

const NoticePanel = lazy(() => import("./panels/NoticePanel"));
const AskPanel = lazy(() => import("./panels/AskPanel"));
const FaqPanel = lazy(() => import("./panels/FaqPanel"));

export default function QnaPage({ isLoggedIn, username }) {
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("tab") || "notice"; // 'notice' | 'ask' | 'faq'
  const setTab = (t) => setSp({ tab: t }, { replace: false });

  const tabBtn = (key) =>
    `pb-3 ${tab === key ? "border-b-2 border-black" : "text-gray-500 hover:text-black"}`;

  return (
    <main className="max-w-5xl mx-auto px-4 pb-16">
      <nav className="sticky top-16 bg-white z-10 border-b">
        <ul className="flex gap-6 h-12 items-center">
          <li><button className={tabBtn("notice")} onClick={() => setTab("notice")}>공지</button></li>
          <li><button className={tabBtn("ask")} onClick={() => setTab("ask")}>무엇이든 물어보세요</button></li>
          <li><button className={tabBtn("faq")} onClick={() => setTab("faq")}>자주 묻는 질문</button></li>
        </ul>
      </nav>

      <Suspense fallback={<div className="py-6">불러오는 중…</div>}>
        {tab === "notice" && <NoticePanel />}
        {tab === "ask" && <AskPanel isLoggedIn={isLoggedIn} username={username} />}
        {tab === "faq" && <FaqPanel />}
      </Suspense>
    </main>
  );
}
