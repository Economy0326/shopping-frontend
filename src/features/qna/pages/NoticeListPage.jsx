import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NoticeAPI } from "features/qna/api/notice.api";
import { getApiErrorMessage } from "shared/api/request";

export default function NoticeListPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await NoticeAPI.list({ page: 1, size: 200 });
      setNotices(res?.data ?? []);
    } catch (e) {
      setErr(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  return (
    <section className="py-6 grid gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-bold">공지</h2>
      </header>

      {err && <div className="text-sm text-red-500">{err}</div>}
      {loading && notices.length === 0 && <div className="text-sm text-gray-500">불러오는 중…</div>}

      <ul className="bg-white space-y-1">
        {notices.map((n) => (
          <li key={n.id}>
            <Link
              to={`/qna/notice/${n.id}`}
              className="block rounded hover:bg-gray-50 outline-none ring-0 [appearance:none]"
            >
              <div className="flex items-start gap-2 p-3">
                {/* 아래 화살표 아이콘 */}
                <svg
                  className="mt-1 h-4 w-4 flex-none"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.17l3.71-2.94a.75.75 0 1 1 .94 1.17l-4.24 3.36a.75.75 0 0 1-.94 0L5.21 8.4a.75.75 0 0 1 .02-1.19z" />
                </svg>

                {/* 제목 + 시간(아래줄) */}
                <div className="min-w-0">
                  <p className="truncate font-medium">{n.title}</p>
                  <time className="block text-xs text-gray-500">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : "-"}
                  </time>
                </div>
              </div>
            </Link>
          </li>
        ))}

        {notices.length === 0 && !loading && (
          <li className="p-6 text-center text-sm text-gray-500">
            등록된 공지가 없습니다.
          </li>
        )}
      </ul>
    </section>
  );
}
