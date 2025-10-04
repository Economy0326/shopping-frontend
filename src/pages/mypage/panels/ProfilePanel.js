import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link } from "react-router-dom";
import { getAxiosErrorMessage } from "../../../lib/request";
import { UsersAPI } from "../../../api/users";

export default function ProfilePanel() {
  const { user, setUser, ready } = useAuth();
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    address: { zip: "", line1: "", line2: "" },
  });
  const [saving, setSaving] = useState(false);
  const line2Ref = useRef(null);

  useEffect(() => {
    if (window?.daum?.Postcode) return;
    const s = document.createElement("script");
    s.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const u = user || {};
    setForm({
      username: u.username || "",
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      address: u.address || { zip: "", line1: "", line2: "" },
    });
  }, [ready, user]);

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const onAddr = (k) => (e) =>
    setForm((f) => ({ ...f, address: { ...f.address, [k]: e.target.value } }));

  const onSave = async () => {
    try {
      setSaving(true);
      const res = await UsersAPI.updateProfile({
        name: form.name,
        phone: form.phone,
        address: form.address,
      });

      // 전역 user 즉시 갱신
      const updated = res?.data?.user || res?.user;
      if (updated) {
        setUser(updated);
      } else {
        // API가 user를 안 돌려주면 폼 값으로 병합
        setUser((prev) =>
          prev
            ? { ...prev, name: form.name, phone: form.phone, address: form.address }
            : {
                username: form.username,
                email: form.email,
                name: form.name,
                phone: form.phone,
                address: form.address,
              }
        );
      }

      alert("저장되었습니다.");
    } catch (err) {
      alert(getAxiosErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div>
        <h2 className="border-b-2 mb-3 pb-3 text-2xl font-bold border-black">내 정보 수정</h2>
      </div>

      <div className="mb-4 w-full flex flex-nowrap items-center justify-between gap-3 min-w-0">
        <h2 className="text-lg font-semibold truncate">나의 정보</h2>
        <Link
          to="/mypage/password"
          className="shrink-0 font-semibold px-4 py-1 text-sm border-b-2 border-black hover:opacity-90"
        >
          비밀번호 변경
        </Link>
      </div>

      <section className="rounded-2xl bg-white p-4 md:p-5 shadow-sm space-y-4">
        {/* 아이디/이메일 (읽기 전용 -> 함부로 바꾸면 주문 목록이 바뀔 가능성 있기 때문에)  */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-16">
          <label className="block">
            <span className="text-sm font-semibold">아이디</span>
            <input className="w-full rounded p-3 mt-1 border-2 border-gray-300 bg-gray-50" value={form.username} readOnly />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">이메일</span>
            <input className="w-full rounded p-3 mt-1 border-2 border-gray-300 bg-gray-50" value={form.email} readOnly />
          </label>
        </div>

        {/* 이름/휴대폰 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-16">
          <label className="block">
            <span className="text-sm font-semibold">이름</span>
            <input className="w-full rounded p-3 mt-1 border-2 border-gray-300" value={form.name} onChange={onChange("name")} placeholder="이름" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">핸드폰 번호</span>
            <input className="w-full rounded p-3 mt-1 border-2 border-gray-300" value={form.phone} onChange={onChange("phone")} placeholder="010-0000-0000" />
          </label>
        </div>

        <div className="pt-2">
          <button
            onClick={onSave}
            disabled={saving}
            className={`rounded-xl px-4 py-2 text-sm text-white ${saving ? "bg-gray-300 cursor-not-allowed" : "bg-black hover:opacity-90"}`}
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </section>
    </div>
  );
}
