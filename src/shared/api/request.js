import { api } from "shared/api/httpClient";

// axios 직접 호출 금지
export async function request(path, options = {}) {
  const { method = "GET", params, body, headers = {}, silentAuth = false } = options;

  const finalHeaders = { ...headers };

  // silentAuth는 axios custom field 말고 헤더로 태그 박기
  if (silentAuth) finalHeaders["x-silent-auth"] = "1";

  const reqConfig = {
    url: path,
    method,
    params,
    headers: finalHeaders,
  };

  // body가 명시적으로 제공된 경우에만 data 필드를 포함
  if (body !== undefined) {
    reqConfig.data = body;
  }

  const res = await api.request(reqConfig);

  return res.data;
}

export function getApiErrorMessage(err, fallback = "요청 실패") {
  const apiMsg = err?.response?.data?.error?.message;
  const legacyMsg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message;

  return apiMsg || legacyMsg || fallback;
}

export function getApiErrorBody(err) {
  // { error: { code, message, details } }
  const e = err?.response?.data?.error;
  if (e && typeof e === "object") {
    return {
      code: String(e.code || ""),
      message: String(e.message || ""),
      details: e.details ?? {},
      status: err?.response?.status,
    };
  }
  return null;
}

// Checkout/Cart에서 바로 쓸 UX 변환기
export function mapCheckoutErrorToUx(code, message, details) {
  switch (code) {
    case "AUTH_REQUIRED":
    case "INVALID_TOKEN":
    case "AUTH_REFRESH_INVALID":
    case "AUTH_REFRESH_MISSING":
      return {
        title: "로그인이 필요합니다",
        message: "주문을 진행하려면 로그인해야 해요.",
        action: { type: "go_login", label: "로그인" },
      };

    case "OUT_OF_STOCK":
      return {
        title: "재고가 부족합니다",
        message:
          message || "선택한 옵션의 재고가 부족해 주문을 생성할 수 없어요.\n장바구니에서 수량을 줄이거나 다른 옵션을 선택해주세요.",
        action: { type: "go_cart", label: "장바구니로" },
      };

    case "INVALID_OPTION_COMBINATION":
      return {
        title: "옵션을 다시 확인해주세요",
        message:
          message || "선택한 옵션 조합이 존재하지 않습니다. 옵션을 다시 선택해주세요.",
        action: { type: "go_cart", label: "장바구니로" },
      };

    case "INVALID_ORDER_STATUS":
      return {
        title: "현재 상태에서는 처리할 수 없습니다",
        message:
          message || "현재 주문 상태에서는 이 작업을 진행할 수 없습니다.",
        action: { type: "close", label: "확인" },
      };

    case "VALIDATION_ERROR":
      return {
        title: "입력값이 올바르지 않습니다",
        message: "필수 항목/형식을 다시 확인해주세요.",
        // details.errors 가 배열일 수 있음 (너 필터에서 그렇게 내려줌)
        fieldErrors: Array.isArray(details?.errors) ? details.errors : [],
        action: { type: "close", label: "확인" },
      };

    case "INTERNAL_ERROR":
      return {
        title: "일시적인 오류가 발생했습니다",
        message:
          message || "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        action: { type: "retry", label: "다시 시도" },
      };

    default:
      return {
        title: "주문 생성 실패",
        message: message || "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        action: { type: "retry", label: "다시 시도" },
      };
  }
}
