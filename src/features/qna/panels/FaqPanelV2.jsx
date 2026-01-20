import { useEffect, useState } from "react";
import { SystemAPI } from "shared/api/system.api";
import { getApiErrorMessage } from "shared/api/request";

export default function FaqPanelV2() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);

      const v = await SystemAPI.policy("faq");
      const text = typeof v === "string" ? v : v?.value ?? "";

      setValue(text);
    } catch (e) {
      setValue("");
      alert(getApiErrorMessage(e, "FAQ 불러오기 실패"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="py-6 grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">자주묻는질문</h2>
      </div>

      {loading ? (
        <div className="border rounded p-4 text-sm text-gray-500">불러오는 중…</div>
      ) : value ? (
        <div className="border rounded p-4 text-sm whitespace-pre-wrap bg-white">{value}</div>
      ) : (
        <div className="border rounded p-4 text-sm text-gray-500">FAQ가 아직 등록되지 않았습니다.</div>
      )}
    </section>
  );
}