import { Link } from "react-router-dom";
import { PanelShell, EmptyState, OrdersTable } from "./_shared";
import { useOrders } from "../../../context/OrderContext";

export default function OrdersPanel({ username }) {
  const { orders } = useOrders();
  const me = username || "guest";
  const myOrders = (orders || []).filter(
    (o) => (o.customer?.username || "guest") === me
  );

  if (!myOrders.length) {
    return (
      <>
        <h2 className="text-lg font-semibold mb-4">주문내역</h2>
        <EmptyState>아직 주문이 없습니다.</EmptyState>
      </>
    );
  }

  const cols = [
    { title: "주문번호", width: 200 },
    { title: "주문일",   width: 180 },
    { title: "상태",     width: 120 },
    { title: "금액",     width: 120 },
    { title: "상세",     width: 96  },
  ];

  const rows = myOrders.map((o) => (
    <tr key={o.id} className="border-t">
      <td className="p-2 font-mono truncate">{o.id}</td>
      <td className="p-2 whitespace-nowrap">
        {o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}
      </td>
      <td className="p-2 text-center whitespace-nowrap">{o.status || "-"}</td>
      <td className="p-2 text-right whitespace-nowrap">
        {(o.total || 0).toLocaleString()}원
      </td>
      <td className="p-2 text-center">
        <Link className="text-blue-600 underline" to={`/order/${o.id}`}>
          보기
        </Link>
      </td>
    </tr>
  ));

  return (
    <PanelShell title="주문내역">
      <OrdersTable columns={cols} rows={rows} />
    </PanelShell>
  );
}
