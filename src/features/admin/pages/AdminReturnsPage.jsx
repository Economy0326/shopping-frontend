import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminReturnsAPI } from "features/admin/api/adminReturns.api";
import { getApiErrorMessage } from "shared/api/request";
import { notify } from "shared/ui/notify";
import PromptModal from "shared/ui/PromptModal";
import { returnStatusLabel } from "shared/utils/orderStatusView";

function dt(s) {
  if (!s) return "-";
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

export default function AdminReturnsPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, size: 20, total: 0 });
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  const [approveOpen, setApproveOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState(null);
  const [approveMemo, setApproveMemo] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const load = async (page = 1) => {
    try {
      setLoading(true);
      const res = await AdminReturnsAPI.list({
        page,
        size: meta.size,
        ...(status ? { status } : {}),
        ...(q.trim() ? { q: q.trim() } : {}),
      });

      setRows(res?.data ?? []);
      setMeta(res?.meta ?? { page, size: meta.size, total: 0 });
    } catch (e) {
      notify.error(getApiErrorMessage(e, "반품 목록 로드 실패"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line
  }, [status]);

  const hasNext = useMemo(
    () => (meta.page || 1) * (meta.size || 20) < (meta.total || 0),
    [meta]
  );

  const openApproveModal = (r) => {
    if (!r?.id) return;
    setApproveTarget(r);
    setApproveMemo("");
    setApproveOpen(true);
  };

  const confirmApprove = async () => {
    if (!approveTarget) return;

    try {
      setApproveLoading(true);
      const memo = String(approveMemo ?? "").trim();

      await AdminReturnsAPI.approve(
        approveTarget.id,
        memo ? { memo } : undefined
      );

      notify.success("승인 완료");
      await load(meta.page || 1);
    } catch (e) {
      notify.error(getApiErrorMessage(e));
    } finally {
      setApproveLoading(false);
      setApproveOpen(false);
      setApproveTarget(null);
      setApproveMemo("");
    }
  };

  const openRejectModal = (r) => {
    if (!r?.id) return;
    setRejectTarget(r);
    setRejectReason("");
    setRejectOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;

    const reason = String(rejectReason ?? "").trim();
    if (!reason) {
      notify.error("거절 사유를 입력하세요.");
      return;
    }

    try {
      setRejectLoading(true);
      await AdminReturnsAPI.reject(rejectTarget.id, { reason });
      notify.success("거절 완료");
      await load(meta.page || 1);
    } catch (e) {
      notify.error(getApiErrorMessage(e));
    } finally {
      setRejectLoading(false);
      setRejectOpen(false);
      setRejectTarget(null);
      setRejectReason("");
    }
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      const okQ = qq ? String(r.orderId ?? "").toLowerCase().includes(qq) : true;
      const okS = status ? r.status === status : true;
      return okQ && okS;
    });
  }, [rows, q, status]);

  return (
    <main className="space-y-4">
      <h2 className="uppercase font-extrabold tracking-tight text-xl md:text-2xl">
        returns & refunds
      </h2>

      <div className="flex flex-col md:flex-row gap-2">
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">전체 상태</option>
          <option value="REQUESTED">REQUESTED</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>

        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="orderId 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <button className="border rounded px-3 py-2" onClick={() => load(1)}>
          새로고침
        </button>
      </div>

      {loading && <p className="text-sm text-gray-500">로딩중…</p>}

      <div className="overflow-x-auto">
        <table className="w-full border text-sm min-w-[980px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2">returnId</th>
              <th className="border p-2">orderId</th>
              <th className="border p-2">status</th>
              <th className="border p-2">reason</th>
              <th className="border p-2">memo</th>
              <th className="border p-2">createdAt</th>
              <th className="border p-2">action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const canAction = r.status === "REQUESTED";
              return (
                <tr key={r.id}>
                  <td className="border p-2 font-mono">{r.id}</td>

                  <td className="border p-2 font-mono">
                    <Link
                      to={`/admin/orders/${r.orderId}`}
                      className="underline break-all"
                    >
                      {r.orderId}
                    </Link>
                  </td>

                  <td className="border p-2">
                    {returnStatusLabel(r.status)}
                  </td>

                  <td className="border p-2">{r.reason ?? "-"}</td>
                  <td className="border p-2">{r.memo ?? "-"}</td>
                  <td className="border p-2 text-xs">{dt(r.createdAt)}</td>

                  <td className="border p-2">
                    <div className="flex gap-2">
                      <button
                        disabled={!canAction}
                        onClick={() => openApproveModal(r)}
                        className={`px-3 py-1 rounded border ${
                          canAction ? "" : "opacity-40 cursor-not-allowed"
                        }`}
                      >
                        승인
                      </button>
                      <button
                        disabled={!canAction}
                        onClick={() => openRejectModal(r)}
                        className={`px-3 py-1 rounded border ${
                          canAction ? "" : "opacity-40 cursor-not-allowed"
                        }`}
                      >
                        거절
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  반품이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasNext && (
        <button
          className="w-full py-2 border hover:bg-gray-50"
          onClick={() => load((meta.page || 1) + 1)}
        >
          다음 페이지
        </button>
      )}

      <PromptModal
        open={approveOpen}
        title="반품 승인"
        message="승인 메모를 입력하세요. (선택)"
        value={approveMemo}
        onChange={setApproveMemo}
        placeholder="승인 메모(선택)"
        confirmText="승인"
        cancelText="취소"
        loading={approveLoading}
        required={false}
        multiline
        onConfirm={confirmApprove}
        onCancel={() => {
          if (approveLoading) return;
          setApproveOpen(false);
          setApproveTarget(null);
          setApproveMemo("");
        }}
      />

      <PromptModal
        open={rejectOpen}
        title="반품 거절"
        message="거절 사유를 입력하세요. (필수)"
        value={rejectReason}
        onChange={setRejectReason}
        placeholder="거절 사유(필수)"
        confirmText="거절"
        cancelText="취소"
        loading={rejectLoading}
        required
        multiline
        onConfirm={confirmReject}
        onCancel={() => {
          if (rejectLoading) return;
          setRejectOpen(false);
          setRejectTarget(null);
          setRejectReason("");
        }}
      />
    </main>
  );
}