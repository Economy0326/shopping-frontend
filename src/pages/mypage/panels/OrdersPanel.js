export default function OrdersPanel() {
  // TODO: 서버 연동 시 fetch로 대체
  const orders = [
    { id: "O20250801-001", date: "2025-08-01", total: 69000, status: "배송완료" },
    { id: "O20250725-002", date: "2025-07-25", total: 129000, status: "배송중" },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">주문내역</h2>
      <ul className="divide-y border rounded">
        {orders.map(o => (
          <li key={o.id} className="p-4">
            <div className="font-medium">{o.id}</div>
            <div className="text-sm text-gray-600">{o.date} · {o.status}</div>
            <div className="text-sm mt-1">{o.total.toLocaleString()}원</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
