import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { getNoticeById } from "features/qna/lib/noticeStore";

export default function NoticeDetailPage() {
  const { id } = useParams();
  const notice = useMemo(() => getNoticeById(id), [id]);

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
          {new Date(notice.createdAt).toLocaleString()}
        </time>
        <div className="mt-4 whitespace-pre-wrap text-gray-800">
          {notice.body}
        </div>
      </article>
    </main>
  );
}