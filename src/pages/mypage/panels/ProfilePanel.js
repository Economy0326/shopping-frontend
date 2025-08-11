export default function ProfilePanel({ username }) {
  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-semibold mb-4">내 정보 수정</h2>
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm">아이디</span>
          <input className="w-full border rounded p-3 mt-1" value={username} disabled />
        </label>
        <label className="block">
          <span className="text-sm">이름</span>
          <input className="w-full border rounded p-3 mt-1" placeholder="이름" />
        </label>
        <label className="block">
          <span className="text-sm">연락처</span>
          <input className="w-full border rounded p-3 mt-1" placeholder="010-1234-5678" />
        </label>
        <button className="px-3 py-2 border rounded bg-black text-white">저장</button>
      </div>
    </div>
  );
}
