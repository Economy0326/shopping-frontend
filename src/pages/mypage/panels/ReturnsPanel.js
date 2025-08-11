export default function ReturnsPanel() {
  const items = []; // TODO: 서버 연동
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">반품 내역</h2>
      {items.length === 0 ? (
        <p className="text-gray-600">반품/교환 내역이 없습니다.</p>
      ) : (
        <ul className="divide-y border rounded">{/* ... */}</ul>
      )}
    </div>
  );
}
