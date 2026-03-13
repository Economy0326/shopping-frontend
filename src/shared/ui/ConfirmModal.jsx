export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="border-b p-4">
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <div className="p-4">
          <p className="text-sm whitespace-pre-line">{message}</p>
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
              className="bg-black text-white px-3 py-2 rounded"
              disabled={loading}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}