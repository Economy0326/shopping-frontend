// src/pages/admin/AdminProductNew.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminProductsAPI } from "../../api/admin/products";
import { getAxiosErrorMessage } from "../../lib/request";

export default function AdminProductNew() {
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "outer",
    price: "",
    images: [],
    description: "",
    detailMd: "",
    sizeGuideMd: "",
    productInfoMd: "",
    isLook: false,
    sizes: "1,2",
    colors: "white,black",
  });

  const on = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const onBool = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  const onUpload = async (files) => {
    if (!files?.length) return;
    try {
      setUploading(true);
      const urls = [];
      for (const f of files) {
        const { url } = await AdminProductsAPI.uploadImage(f);
        urls.push(url);
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (e) {
      alert(getAxiosErrorMessage(e, "이미지 업로드 실패"));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url) =>
    setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price) || 0,
        images: form.images,
        description: form.description,
        detailMd: form.detailMd,
        sizeGuideMd: form.sizeGuideMd,
        productInfoMd: form.productInfoMd,
        isLook: !!form.isLook,
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
      };
      const created = await AdminProductsAPI.create(payload);
      const id = created?.id || created?.productId;
      alert("상품이 등록되었습니다.");
      if (id) nav(`/product/${id}`);
    } catch (e) {
      alert(getAxiosErrorMessage(e, "상품 등록 실패"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">관리자 · 상품 등록</h1>

      <form className="grid gap-4" onSubmit={submit}>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-semibold">상품명</span>
            <input className="border p-2 rounded w-full"
                  value={form.name} onChange={on("name")} required />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">카테고리</span>
            <select className="border p-2 rounded w-full"
                    value={form.category} onChange={on("category")}>
              <option value="outer">outer</option>
              <option value="top">top</option>
              <option value="bottom">bottom</option>
              <option value="acc">acc</option>
              <option value="for-artist">for-artist</option>
              <option value="look">look</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">가격</span>
            <input className="border p-2 rounded w-full" type="number" min="0"
                  value={form.price} onChange={on("price")}
                  disabled={form.isLook || form.category === "look"} />
            {(form.isLook || form.category === "look") && (
              <p className="text-xs text-gray-500 mt-1">룩북은 가격/구매 미노출</p>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-semibold">룩북(isLook)</span>
            <input type="checkbox" className="ml-2 align-middle"
                  checked={form.isLook} onChange={onBool("isLook")} />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold">한 줄 설명</span>
          <input className="border p-2 rounded w-full"
                value={form.description} onChange={on("description")} />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-semibold">사이즈(콤마)</span>
            <input className="border p-2 rounded w-full"
                  value={form.sizes} onChange={on("sizes")}
                  placeholder="예: 1,2 또는 S,M,L" />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">색상(콤마)</span>
            <input className="border p-2 rounded w-full"
                  value={form.colors} onChange={on("colors")}
                  placeholder="예: white,black" />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold">상세 설명(detailMd)</span>
          <textarea className="border p-2 rounded w-full h-32"
                    value={form.detailMd} onChange={on("detailMd")}
                    placeholder="마크다운/프리텍스트" />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">사이즈 가이드(sizeGuideMd)</span>
          <textarea className="border p-2 rounded w-full h-32"
                    value={form.sizeGuideMd} onChange={on("sizeGuideMd")} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">상품 정보(productInfoMd)</span>
          <textarea className="border p-2 rounded w-full h-32"
                    value={form.productInfoMd} onChange={on("productInfoMd")} />
        </label>

        {/* 이미지 업로드 */}
        <div className="border rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">이미지</span>
            <label className="cursor-pointer text-sm bg-black text-white px-3 py-1 rounded">
              파일 선택
              <input type="file" multiple accept="image/*" className="hidden"
                    onChange={(e) => onUpload(Array.from(e.target.files || []))} />
            </label>
          </div>

          {uploading && <p className="text-xs mt-2">업로드 중…</p>}

          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
            {form.images.map((u) => (
              <div key={u} className="relative">
                <img src={u} alt="" className="w-full h-24 object-cover rounded" />
                <button type="button" onClick={() => removeImage(u)}
                        className="absolute top-1 right-1 bg-white/80 rounded px-2 text-xs">
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`rounded-xl px-4 py-2 text-sm text-white ${saving ? "bg-gray-300 cursor-not-allowed" : "bg-black hover:opacity-90"}`}
          >
            {saving ? "저장 중…" : "상품 등록"}
          </button>
        </div>
      </form>
    </main>
  );
}
