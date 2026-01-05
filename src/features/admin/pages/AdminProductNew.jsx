import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminProductsAPI } from "features/admin/api/adminProducts.api";
import { getApiErrorMessage } from "shared/api/request";

function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

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

    /**
     *  상품별 MD/텍스트는 URL 방식으로 운영 가능
     * - 운영자가 URL을 붙여넣으면 프론트가 fetch해서 렌더
     */
    sizeGuideMdUrl: "",
    productInfoMdUrl: "",

    /**
     *  룩북(look) 상품 전용 md
     * - category=look이면 프론트는 가격/구매 미노출
     * - lookMdUrl 있으면 fetch 후 렌더, 없으면 description fallback
     */
    lookMdUrl: "",

    /**
     *  optionGroups 기반(명세 확정)
     * - size/color 각 옵션은 { id, value, stock } 형태
     * - id는 프론트가 임시로 만들고(서버가 저장하면서 실제 id를 부여해도 됨)
     */
    optionGroups: [
      {
        key: "size",
        label: "SIZE",
        options: [{ _tmpId: uid(), value: "M", stock: 3 }],
      },
      {
        key: "color",
        label: "COLOR",
        options: [{ _tmpId: uid(), value: "black", stock: 2 }],
      },
    ],
  });

  // 텍스트 입력 바인딩 헬퍼
  const on = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  /**
   * 이미지 업로드
   * - 명세: POST /admin/uploads -> { data: { url: "..." } }
   */
  const onUpload = async (files) => {
    if (!files?.length) return;

    try {
      setUploading(true);

      const urls = [];
      for (const f of files) {
        const res = await AdminProductsAPI.uploadImage(f);
        const url = res?.data?.url;
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

  const isLook = form.category === "look";
  const priceDisabled = isLook;

  // optionGroups 헬퍼
  const updateOption = (groupKey, tmpId, patch) => {
    setForm((prev) => ({
      ...prev,
      optionGroups: prev.optionGroups.map((g) => {
        if (g.key !== groupKey) return g;
        return {
          ...g,
          options: g.options.map((o) =>
            o._tmpId === tmpId ? { ...o, ...patch } : o
          ),
        };
      }),
    }));
  };

  const addOption = (groupKey) => {
    setForm((prev) => ({
      ...prev,
      optionGroups: prev.optionGroups.map((g) => {
        if (g.key !== groupKey) return g;
        return {
          ...g,
          options: [...g.options, { _tmpId: uid(), value: "", stock: 0 }],
        };
      }),
    }));
  };

  const removeOption = (groupKey, tmpId) => {
    setForm((prev) => ({
      ...prev,
      optionGroups: prev.optionGroups.map((g) => {
        if (g.key !== groupKey) return g;
        return {
          ...g,
          options: g.options.filter((o) => o._tmpId !== tmpId),
        };
      }),
    }));
  };

  /**
   * 상품 등록 submit
   * - 서버가 optionGroups 저장 후 option.id를 발급한다고 가정
   * - 프론트는 등록 화면에서 임시(_tmpId)만 쓰고, 서버로는 제거해서 보냄
   */
  const submit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // 서버로 보낼 payload 구성
      const payload = {
        name: form.name.trim(),
        category: form.category,
        price: isLook ? 0 : toNumber(form.price, 0),
        images: form.images,
        description: form.description,

        sizeGuideMdUrl: form.sizeGuideMdUrl?.trim() || undefined,
        productInfoMdUrl: form.productInfoMdUrl?.trim() || undefined,
        lookMdUrl: isLook ? (form.lookMdUrl?.trim() || undefined) : undefined,

        // optionGroups: _tmpId 제거 + value/stock 정리
        optionGroups: form.optionGroups
          .map((g) => ({
            key: g.key,
            label: g.label,
            options: (g.options || [])
              .map((o) => ({
                value: String(o.value ?? "").trim(),
                stock: toNumber(o.stock, 0),
              }))
              .filter((o) => o.value.length > 0),
          }))
          // 룩북은 기본적으로 옵션 없음(원하면 남겨도 됨)
          .filter((g) => !isLook && g.options.length > 0),
      };

      const res = await AdminProductsAPI.create(payload);
      const created = res?.data ?? null;
      const id = created?.id ?? created?.productId ?? null;

      alert("상품이 등록되었습니다.");

      // id가 있으면 상품 상세로 이동
      if (id) nav(`/product/${id}`);
      else nav(`/products`);
    } catch (e) {
      alert(getApiErrorMessage(e, "상품 등록 실패"));
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
                룩북은 가격/구매 미노출 (저장해도 프론트에 표시 안 함)
              </p>
            )}
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

        {/* 상품별 URL 운영(사이즈/상품정보) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-semibold">사이즈 가이드 URL(sizeGuideMdUrl)</span>
            <input
              className="border p-2 rounded w-full"
              value={form.sizeGuideMdUrl}
              onChange={on("sizeGuideMdUrl")}
              placeholder="https://.../size.md"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">상품 정보 URL(productInfoMdUrl)</span>
            <input
              className="border p-2 rounded w-full"
              value={form.productInfoMdUrl}
              onChange={on("productInfoMdUrl")}
              placeholder="https://.../info.md"
            />
          </label>
        </div>

        {/* 룩북 md URL */}
        {isLook && (
          <label className="block">
            <span className="text-sm font-semibold">룩북 md URL(lookMdUrl)</span>
            <input
              className="border p-2 rounded w-full"
              value={form.lookMdUrl}
              onChange={on("lookMdUrl")}
              placeholder="https://.../look.md"
            />
            <p className="text-xs text-gray-500 mt-1">
              lookMdUrl이 있으면 프론트가 fetch해서 렌더, 없으면 description을 보여줌
            </p>
          </label>
        )}

        {/* 옵션/재고(optionGroups) */}
        {!isLook && (
          <div className="border rounded p-3 space-y-4">
            <div className="text-sm font-semibold">옵션/재고(optionGroups)</div>

            {form.optionGroups.map((g) => (
              <div key={g.key} className="border rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">
                    {g.label} <span className="text-xs text-gray-500">({g.key})</span>
                  </div>
                  <button
                    type="button"
                    className="border rounded px-3 py-1 text-sm hover:bg-gray-50"
                    onClick={() => addOption(g.key)}
                  >
                    + 옵션 추가
                  </button>
                </div>

                <div className="space-y-2">
                  {g.options.map((o) => (
                    <div key={o._tmpId} className="flex gap-2 items-center">
                      <input
                        className="border rounded p-2 flex-1"
                        value={o.value}
                        onChange={(e) => updateOption(g.key, o._tmpId, { value: e.target.value })}
                        placeholder="value (예: M / black)"
                      />
                      <input
                        className="border rounded p-2 w-28"
                        type="number"
                        min="0"
                        value={o.stock}
                        onChange={(e) => updateOption(g.key, o._tmpId, { stock: e.target.value })}
                        placeholder="stock"
                      />
                      <button
                        type="button"
                        className="border rounded px-3 py-2 text-sm hover:bg-gray-50"
                        onClick={() => removeOption(g.key, o._tmpId)}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500">
                  stock=0이면 프론트에서 선택 불가(품절 처리)
                </p>
              </div>
            ))}
          </div>
        )}

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
