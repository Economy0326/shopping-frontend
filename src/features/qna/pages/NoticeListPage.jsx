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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">공지</h2>
      </div>

      {err && <div className="text-sm text-red-500">{err}</div>}
      {loading && notices.length === 0 && <div className="text-sm text-gray-500">불러오는 중…</div>}

      <div className="grid gap-3">
        {notices.length === 0 && !loading && (
          <div className="p-6 text-center text-sm text-gray-500">등록된 공지가 없습니다.</div>
        )}

        {notices.map((n) => (
          <article key={n.id} className="p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition">
            <Link to={`/qna/notice/${n.id}`} className="w-full block text-left">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{n.title}</h3>
                  <time className="block text-xs text-gray-500 mt-1">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : "-"}
                  </time>
                </div>
                <div className="text-xs text-gray-400">자세히</div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
