import { Link } from "react-router-dom";

export default function LoginRequired() {
  return (
    <div className="max-w-3xl mx-auto p-8 mt-10 -translate-x-10 text-center">
      <h2 className="text-xl font-semibold mb-3">로그인이 필요합니다</h2>
      <p className="mb-6 text-gray-600">마이페이지는 로그인 후 사용 가능합니다.</p>
    </div>
  );
}