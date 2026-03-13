import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminProductsAPI } from "features/admin/api/adminProducts.api";
import { getApiErrorMessage } from "shared/api/request";
import { notify } from "shared/ui/notify";
import ConfirmModal from "shared/ui/ConfirmModal";

function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AdminProductEdit() {
  const nav = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "outer",
    price: "",
    images: [],
    description: "",
    sizeGuideMdUrl: "",
    productInfoMdUrl: "",
    lookMdUrl: "",
    optionGroups: [],
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setErr("");
        const res = await AdminProductsAPI.get(id);
        const data = res?.data ?? null;
        if (!data) return;

        // normalize optionGroups: ensure each option has _tmpId for editing
        const optionGroups = (data.optionGroups || []).map((g) => ({
          key: g.key,
          label: g.label,
          options: (g.options || []).map((o) => ({ ...o, _tmpId: uid() })),
        }));

        setForm({
          name: data.name || "",
          category: data.categorySlug || "outer",
          price: data.price != null ? String(data.price) : "",
          images: data.images || [],
          description: data.description || "",
          sizeGuideMdUrl: data.sizeGuideMdUrl || "",
          productInfoMdUrl: data.productInfoMdUrl || "",
          lookMdUrl: data.lookMdUrl || "",
          optionGroups,
        });
      } catch (e) {
        setErr(getApiErrorMessage(e, "상품 로드 실패"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const on = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

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
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (e) {
      notify.error(getApiErrorMessage(e, "이미지 업로드 실패"));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url) => setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }));

  const isLook = form.category === "look";

  const previewUrl = isLook ? `/look/${id}` : `/product/${id}`;

  const priceDisabled = isLook;

  const updateOption = (groupKey, tmpId, patch) => {
    setForm((prev) => ({
      ...prev,
      optionGroups: prev.optionGroups.map((g) => {
        if (g.key !== groupKey) return g;
        return {
          ...g,
          options: g.options.map((o) => (o._tmpId === tmpId ? { ...o, ...patch } : o)),
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
        return { ...g, options: g.options.filter((o) => o._tmpId !== tmpId) };
      }),
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      setErr("");

      const payload = {
        name: form.name.trim(),
        categorySlug: form.category,
        price: priceDisabled ? 0 : toNumber(form.price, 0),
        images: form.images, // url[]
        description: form.description,
        sizeGuideMdUrl: form.sizeGuideMdUrl?.trim() || undefined,
        productInfoMdUrl: form.productInfoMdUrl?.trim() || undefined,
        lookMdUrl: priceDisabled ? form.lookMdUrl?.trim() || undefined : undefined,
        optionGroups: (form.optionGroups || [])
          .map((g) => ({
            key: g.key,
            label: g.label,
            options: (g.options || [])
              .map((o) => ({ value: String(o.value ?? "").trim(), stock: toNumber(o.stock, 0) }))
              .filter((o) => o.value.length > 0),
          }))
          .filter((g) => !priceDisabled && g.options.length > 0),
      };

      await AdminProductsAPI.update(id, payload);

      notify.success("상품이 수정되었습니다.");
      nav("/admin/products");
    } catch (e) {
      notify.error(getApiErrorMessage(e, "상품 수정 실패"));
    } finally {
      setSaving(false);
    }
  };

  const openRemoveProductModal = () => {
    if (!id) return;
    setDeleteOpen(true);
  };

  const confirmRemoveProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);
      await AdminProductsAPI.remove(id);
      notify.success("삭제되었습니다.");
      nav("/admin/products");
    } catch (e) {
      notify.error(getApiErrorMessage(e, "삭제 실패"));
    } finally {
      setLoading(false);
      setDeleteOpen(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">관리자 · 상품 수정</h1>

      {err && <div className="text-sm text-red-500 mb-2">{err}</div>}
      {loading && <div className="text-sm text-gray-500 mb-2">로딩중…</div>}

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
                        className="rounded-xl px-4 py-2 text-sm border"
                        onClick={openRemoveProductModal}
                        disabled={loading}
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

        <div className="border rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">이미지</span>

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

        <div className="pt-2 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className={`rounded-xl px-4 py-2 text-sm text-white ${
              saving ? "bg-gray-300 cursor-not-allowed" : "bg-black hover:opacity-90"
            }`}
          >
            {saving ? "저장 중…" : "상품 수정"}
          </button>

          {id && (
            <button 
              type="button"
              className="rounded-xl px-4 py-2 text-sm border"
              onClick={() => nav(previewUrl)}
            >
              미리보기
            </button>
          )}

          <button
            type="button"
            className="rounded-xl px-4 py-2 text-sm border"
            onClick={openRemoveProductModal}
            disabled={loading}
          >
            삭제
          </button>
        </div>
      </form>
      <ConfirmModal
        open={deleteOpen}
        title="상품 삭제"
        message="이 상품을 삭제할까요? (복구 불가)"
        confirmText="삭제"
        cancelText="취소"
        loading={loading}
        onConfirm={confirmRemoveProduct}
        onCancel={() => {
          if (loading) return;
          setDeleteOpen(false);
        }}
      />
    </main>
  );
}
