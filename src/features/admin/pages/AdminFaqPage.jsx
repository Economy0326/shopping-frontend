import { useEffect, useState } from "react";
import { AdminFaqAPI } from "features/admin/api/adminFaq.api";
import { getApiErrorMessage } from "shared/api/request";
import { notify } from "shared/ui/notify";

const btnBase =
  "uppercase font-extrabold tracking-tight text-sm md:text-base outline-none ring-0 [appearance:none] select-none";
const tapNone = { WebkitTapHighlightColor: "transparent" };

export default function AdminFaqPage() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await AdminFaqAPI.get();
      const data = res?.data ?? res ?? null;
      const text = typeof data === "string" ? data : data?.value ?? "";
      setValue(text);
    } catch (e) {
      notify.error(getApiErrorMessage(e, "FAQ 불러오기 실패"));
      setValue("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      await AdminFaqAPI.update(value);
      notify.success("FAQ 저장 완료");
      await load();
    } catch (e) {
      notify.error(getApiErrorMessage(e, "FAQ 저장 실패"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="uppercase font-extrabold tracking-tight text-xl md:text-2xl">faq</h2>
        <button
          type="button"
          className={`${btnBase} px-3 py-2 rounded-xl border`}
          onClick={load}
          style={tapNone}
          disabled={loading || saving}
        >
          refresh
        </button>
      </header>

      {loading ? (
        <div className="border rounded-2xl p-4 text-sm text-gray-500">로딩중…</div>
      ) : (
        <section className="border rounded-2xl p-4 space-y-3">
          <div className="text-sm text-gray-600">
            유저 Q&A 페이지의 FAQ 탭에 그대로 노출됩니다.
          </div>

          <textarea
            className="w-full border rounded-xl p-3 text-sm min-h-[320px]"
            placeholder="FAQ 내용을 입력하세요 (줄바꿈 유지)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={saving}
          />

          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded-xl border"
              onClick={load}
              disabled={saving}
            >
              되돌리기
            </button>
            <button
              className={`px-4 py-2 rounded-xl text-white ${
                saving ? "bg-gray-300 cursor-not-allowed" : "bg-black hover:opacity-90"
              }`}
              onClick={save}
              disabled={saving}
            >
              {saving ? "저장중…" : "저장"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
