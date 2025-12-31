import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminProductsAPI } from "features/admin/api/adminProducts.api";
import { getApiErrorMessage } from "shared/api/request";

export default function AdminProductNew() {
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 상품 등록 폼 상태
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

  // 텍스트 입력 바인딩 헬퍼
  const on = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  // 체크박스 입력 바인딩 헬퍼
  const onBool = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  /**
   * 이미지 업로드
   * - AdminProductsAPI.uploadImage는 request()를 사용하므로
   * - 반환값은 axios res가 아니라 "서버 JSON 전체"임
   * - 명세: POST /admin/uploads -> { data: { url: "..." } }
   * - 즉, res.data.url 로 접근해야 함
   */
  const onUpload = async (files) => {
    if (!files?.length) return;

    try {
      setUploading(true);

      const urls = [];
      for (const f of files) {
        const res = await AdminProductsAPI.uploadImage(f); // res === { data: { url } }
        const url = res?.data?.url;

        // url이 없으면 화면에서 이미지가 안 뜨고 상품 등록이 막히므로 방어
        if (!url) throw new Error("업로드 응답에 url이 없습니다.");

        urls.push(url);
      }

      // 업로드된 이미지 URL을 form.images에 누적
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (e) {
      alert(getApiErrorMessage(e, "이미지 업로드 실패"));
    } finally {
      setUploading(false);
    }
  };

  // 이미지 삭제
  const removeImage = (url) =>
    setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }));

  /**
   * 상품 등록 submit
   * - AdminProductsAPI.create도 request() 사용
   * - 서버 응답이 { data: { ...createdProduct } }라고 가정
   * - created id 키는 백엔드에 따라 id/productId 등이 섞일 수 있으니 방어
   */
  const submit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // 서버로 보낼 payload 구성(문자열 trim / 숫자 변환 / 콤마 split 등)
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
        sizes: form.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        colors: form.colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      };

      const res = await AdminProductsAPI.create(payload); // res === { data: created }
      const created = res?.data ?? null;

      // 생성된 상품 id 추출(백엔드 응답 필드가 다를 수 있어 방어)
      const id = created?.id ?? created?.productId ?? null;

      alert("상품이 등록되었습니다.");

      // id가 있으면 상품 상세로 이동
      if (id) nav(`/product/${id}`);
      // id가 없으면 안전하게 상품 목록으로 이동(원하는 관리자 목록 경로로 변경 가능)
      else nav(`/products`);
    } catch (e) {
      alert(getApiErrorMessage(e, "상품 등록 실패"));
    } finally {
      setSaving(false);
    }
  };

  // 룩북/카테고리가 look이면 가격 입력 비활성
  const priceDisabled = form.isLook || form.category === "look";

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">관리자 · 상품 등록</h1>

      <form className="grid gap-4" onSubmit={submit}>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-semibold">상품명</span>
            <input
              className="border p-2 rounded w-full"
              value={form.name}
              onChange={on("name")}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">카테고리</span>
            <select
              className="border p-2 rounded w-full"
              value={form.category}
              onChange={on("category")}
            >
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
            <input
              className="border p-2 rounded w-full"
              type="number"
              min="0"
              value={form.price}
              onChange={on("price")}
              disabled={priceDisabled}
            />
            {priceDisabled && (
              <p className="text-xs text-gray-500 mt-1">
                룩북은 가격/구매 미노출
              </p>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-semibold">룩북(isLook)</span>
            <input
              type="checkbox"
              className="ml-2 align-middle"
              checked={form.isLook}
              onChange={onBool("isLook")}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold">한 줄 설명</span>
          <input
            className="border p-2 rounded w-full"
            value={form.description}
            onChange={on("description")}
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-semibold">사이즈(콤마)</span>
            <input
              className="border p-2 rounded w-full"
              value={form.sizes}
              onChange={on("sizes")}
              placeholder="예: 1,2 또는 S,M,L"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">색상(콤마)</span>
            <input
              className="border p-2 rounded w-full"
              value={form.colors}
              onChange={on("colors")}
              placeholder="예: white,black"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold">상세 설명(detailMd)</span>
          <textarea
            className="border p-2 rounded w-full h-32"
            value={form.detailMd}
            onChange={on("detailMd")}
            placeholder="마크다운/프리텍스트"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">사이즈 가이드(sizeGuideMd)</span>
          <textarea
            className="border p-2 rounded w-full h-32"
            value={form.sizeGuideMd}
            onChange={on("sizeGuideMd")}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">상품 정보(productInfoMd)</span>
          <textarea
            className="border p-2 rounded w-full h-32"
            value={form.productInfoMd}
            onChange={on("productInfoMd")}
          />
        </label>

        {/* 이미지 업로드 영역 */}
        <div className="border rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">이미지</span>

            {/* multiple 업로드 */}
            <label className="cursor-pointer text-sm bg-black text-white px-3 py-1 rounded">
              파일 선택
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => onUpload(Array.from(e.target.files || []))}
              />
            </label>
          </div>

          {uploading && <p className="text-xs mt-2">업로드 중…</p>}

          {/* 업로드된 이미지 썸네일 표시 */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
            {form.images.map((u) => (
              <div key={u} className="relative">
                <img src={u} alt="" className="w-full h-24 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => removeImage(u)}
                  className="absolute top-1 right-1 bg-white/80 rounded px-2 text-xs"
                >
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
            className={`rounded-xl px-4 py-2 text-sm text-white ${
              saving ? "bg-gray-300 cursor-not-allowed" : "bg-black hover:opacity-90"
            }`}
          >
            {saving ? "저장 중…" : "상품 등록"}
          </button>
        </div>
      </form>
    </main>
  );
}
