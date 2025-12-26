import { Link } from "react-router-dom";
import { useOrders } from "features/orders/context/OrderContext";

export default function MyOrdersPage() {
  const { orders } = useOrders();

  if (!orders?.length) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold">나의 주문</h1>
        <p className="mt-4 text-sm text-gray-600">아직 주문이 없습니다.</p>
        <Link to="/" className="text-blue-600 underline mt-2 inline-block">상품 보러가기</Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">나의 주문</h1>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-50">
            <th className="border p-2 text-left">주문번호</th>
            <th className="border p-2 text-left">주문일</th>
            <th className="border p-2">상태</th>
            <th className="border p-2 text-right">금액</th>
            <th className="border p-2">상세</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td className="border p-2 font-mono">{o.id}</td>
              <td className="border p-2">{new Date(o.createdAt).toLocaleString()}</td>
              <td className="border p-2 text-center">{o.status}</td>
              <td className="border p-2 text-right">{(o.total || 0).toLocaleString()}원</td>
              <td className="border p-2 text-center">
                <Link to={`/order/${o.id}`} className="text-blue-600 underline">보기</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}