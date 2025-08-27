import { PanelShell, EmptyState, OrdersTable } from "./_shared";

export default function CancellationsPanel() {
  const items = []; // TODO: 서버 연동 시 교체

  if (!items.length) {
    return (
      <>
        <h2 className="text-lg font-semibold mb-4">결제 취소 내역</h2>
        <EmptyState>취소내역이 없습니다.</EmptyState>
      </>
    );
  }

  const cols = [
    { title: "취소번호", width: 200 },
    { title: "취소일",   width: 180 },
    { title: "주문번호", width: 200 },
    { title: "금액",     width: 120 },
    { title: "상태",     width: 120 },
  ];

  const rows = items.map((c) => (
    <tr key={c.id} className="border-t">
      <td className="p-2 font-mono truncate">{c.id}</td>
      <td className="p-2 whitespace-nowrap">{c.canceledAt}</td>
      <td className="p-2 font-mono truncate">{c.orderId}</td>
      <td className="p-2 text-right whitespace-nowrap">
        {(c.amount || 0).toLocaleString()}원
      </td>
      <td className="p-2 text-center whitespace-nowrap">{c.status}</td>
    </tr>
  ));

  return (
    <PanelShell title="결제 취소 내역">
      <OrdersTable columns={cols} rows={rows} />
    </PanelShell>
  );
}
