export default function PromptModal({
  open,
  title,
  message,
  value,
  onChange,
  placeholder = "",
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
  loading = false,
  required = false,
  multiline = false,
}) {
  if (!open) return null;

  const isDisabled = loading || (required && !String(value ?? "").trim());

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="border-b p-4">
          <h2 className="text-base font-semibold">{title}</h2>
        </div>

        <div className="p-4">
          {message && <p className="text-sm whitespace-pre-line mb-3">{message}</p>}

          {multiline ? (
            <textarea
              className="w-full border rounded p-3 min-h-[120px]"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder={placeholder}
              disabled={loading}
            />
          ) : (
            <input
              className="w-full border rounded p-3"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder={placeholder}
              disabled={loading}
            />
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="border px-3 py-2 rounded"
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="bg-black text-white px-3 py-2 rounded disabled:opacity-40"
              disabled={isDisabled}
            >
              {loading ? "처리 중…" : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}