import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { NoticeAPI } from "features/qna/api/notice.api";
import { getApiErrorMessage } from "shared/api/request";

export default function NoticeDetailPage() {
  const { id } = useParams();

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await NoticeAPI.get(id);
        if (alive) setNotice(res?.data ?? null);
      } catch (e) {
        if (alive) setErr(getApiErrorMessage(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="text-sm text-gray-500">불러오는 중…</div>
      </main>
    );
  }

  if (err) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="text-sm text-red-500">{err}</div>
        <div className="mt-4">
          <Link to="/qna?tab=notice" className="px-3 py-2 border rounded">
            목록으로
          </Link>
        </div>
      </main>
    );
  }

  if (!notice) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="border rounded p-6 text-center">
          존재하지 않는 공지입니다.
          <div className="mt-4">
            <Link to="/qna?tab=notice" className="px-3 py-2 border rounded">
              목록으로
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 grid gap-4">
      <nav className="text-sm">
        {/* 탭 페이지의 notice 리스트로 되돌아가기 */}
        <Link to="/qna?tab=notice" className="text-red-500 hover:underline">
          ← 공지 목록
        </Link>
      </nav>

      <article className="border rounded p-6 bg-white">
        <h1 className="text-2xl font-bold">{notice.title}</h1>
        <time className="block text-xs text-gray-500 mt-1">
          {notice.createdAt ? new Date(notice.createdAt).toLocaleString() : "-"}
        </time>
        <div className="mt-4 whitespace-pre-wrap text-gray-800">
          {notice.body}
        </div>
      </article>
    </main>
  );
}
