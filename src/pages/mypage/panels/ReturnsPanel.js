import { PanelShell, EmptyState, OrdersTable } from "./_shared";

export default function ReturnsPanel() {
  const items = []; // TODO: 서버 연동 시 교체

  if (!items.length) {
    return (
      <>
        <h2 className="text-lg font-semibold mb-4">반품 내역</h2>
        <EmptyState>반품/교환 내역이 없습니다.</EmptyState>
      </>
    );
  }

  const cols = [
    { title: "반품번호", width: 200 },
    { title: "접수일",   width: 180 },
    { title: "주문번호", width: 200 },
    { title: "금액",     width: 120 },
    { title: "상태",     width: 120 },
  ];

  const rows = items.map((r) => (
    <tr key={r.id} className="border-t">
      <td className="p-2 font-mono truncate">{r.id}</td>
      <td className="p-2 whitespace-nowrap">{r.requestedAt}</td>
      <td className="p-2 font-mono truncate">{r.orderId}</td>
      <td className="p-2 text-right whitespace-nowrap">
        {(r.amount || 0).toLocaleString()}원
      </td>
      <td className="p-2 text-center whitespace-nowrap">{r.status}</td>
    </tr>
  ));

  return (
    <PanelShell title="반품 내역">
      <OrdersTable columns={cols} rows={rows} />
    </PanelShell>
  );
}
