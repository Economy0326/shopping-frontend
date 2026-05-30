# Shopping Frontend 운영 연동 가이드

쇼핑몰 프론트엔드의 인증, API 요청 구조, 장바구니, 체크아웃, 주문, 관리자 운영 흐름을 정리한 문서입니다.

공개 README에는 핵심만 요약하고, 자세한 운영 규칙과 구현 흐름은 이 문서에서 관리합니다.

---

## 1. 환경 변수

운영 환경에서는 아래 기준으로 API를 호출합니다.

```env
REACT_APP_API_BASE=https://shopping-backend-2yx6.onrender.com
REACT_APP_API_PREFIX=/api/v1
```

프론트는 항상 아래 조합으로 API를 호출합니다.

```text
REACT_APP_API_BASE + REACT_APP_API_PREFIX
```

운영에서는 `http://localhost:8080`을 사용하지 않습니다.

모든 요청은 Refresh Token Cookie 전송을 위해 `withCredentials: true` 기준으로 동작합니다.

---

## 2. 인증 / 세션 정책

### Access Token

Access Token은 프론트 메모리에만 저장합니다.

- `tokenMemory`에만 저장
- localStorage / sessionStorage 저장 금지
- 인증 요청 시 Authorization Header에 자동 포함

```text
Authorization: Bearer <accessToken>
```

예상 구조:

```ts
let accessToken: string | null = null

export const tokenMemory = {
  get() {
    return accessToken
  },
  set(token: string) {
    accessToken = token
  },
  clear() {
    accessToken = null
  },
}
```

### Refresh Token

Refresh Token은 서버가 `HttpOnly Cookie`로 관리합니다.

- 브라우저 Cookie Storage에 저장됨
- 프론트 JavaScript에서 직접 접근 불가
- `document.cookie`로 읽을 수 없음
- API 요청 시 브라우저가 자동으로 쿠키를 함께 전송
- 이를 위해 axios에 `withCredentials: true` 필요

```ts
const httpClient = axios.create({
  baseURL: `${API_BASE}${API_PREFIX}`,
  withCredentials: true,
})
```

---

## 3. 로그인 / 새로고침 / 세션 복구 흐름

### 로그인 시

```text
POST /auth/login
  ↓
서버가 응답 body로 Access Token 반환
  ↓
서버가 응답 header의 Set-Cookie로 Refresh Token 설정
  ↓
브라우저가 Refresh Token을 HttpOnly Cookie로 저장
  ↓
프론트 JS는 응답 body의 Access Token만 꺼내 tokenMemory에 저장
```

### 새로고침 시

Access Token은 메모리에만 저장되므로 새로고침하면 사라집니다.  
하지만 Refresh Token Cookie는 브라우저에 남아 있을 수 있습니다.

```text
앱 최초 진입
  ↓
tokenMemory에 Access Token 없음
  ↓
/auth/refresh 1회 시도
  ↓
withCredentials: true로 Refresh Token Cookie 전송
  ↓
서버가 Refresh Token 검증
  ↓
새 Access Token 발급
  ↓
프론트가 Access Token을 다시 tokenMemory에 저장
  ↓
/users/me로 사용자 정보 조회
```

---

## 4. 토큰 갱신 정책

일반 API 요청 중 401이 발생했을 때 `/auth/refresh`를 자동 재시도하지 않습니다.

- 앱 최초 진입 시 accessToken이 없을 때만 `/auth/refresh` 1회 시도
- refresh 요청 시 `x-silent-auth: true` 헤더 사용
- refresh 실패 시 비로그인 상태 유지
- 일반 API 401에서는 자동 refresh/retry를 수행하지 않음

```text
일반 API 요청
  ↓
401 발생
  ↓
Access Token 제거
  ↓
AUTH_REQUIRED 이벤트 발생
  ↓
로그인 모달 표시
```

### 의도

POST, PUT, DELETE 같은 쓰기 요청에서 자동 재시도를 수행하면 중복 요청이 발생할 수 있습니다.  
따라서 일반 API 요청 중 401이 발생했을 때는 자동으로 refresh 후 재요청하지 않고, 사용자에게 재로그인을 유도하는 보수적인 정책을 사용했습니다.

---

## 5. 401 처리 UX

401이 발생하면 로그인 페이지로 강제 이동하지 않고, 현재 화면을 유지한 채 로그인 모달을 표시합니다.

```text
1. httpClient에서 401 감지
2. Access Token 제거
3. AUTH_REQUIRED 이벤트 발생
4. AuthContext에서 authRequired = true
5. HeaderUnified에서 LoginModal 표시
6. 로그인 성공 시 authRequired = false
```

### httpClient

`httpClient`는 401 응답을 감지하면 Access Token을 제거하고 `AUTH_REQUIRED` 이벤트를 발생시킵니다.

```ts
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
      authEvents.emit('AUTH_REQUIRED')
    }

    return Promise.reject(error)
  }
)
```

여러 API 요청이 동시에 401을 반환할 수 있으므로, 이벤트가 중복 발생하지 않도록 `alreadyEmitted`와 같은 방어 로직을 둘 수 있습니다.

```ts
let alreadyEmitted = false

function emitAuthRequiredOnce() {
  if (alreadyEmitted) return

  alreadyEmitted = true
  authEvents.emit('AUTH_REQUIRED')
}
```

### AuthContext

`AuthContext`는 `AUTH_REQUIRED` 이벤트를 구독하고, 인증 필요 상태를 갱신합니다.

```tsx
useEffect(() => {
  const off = authEvents.on('AUTH_REQUIRED', (payload) => {
    clearToken()
    setUser(null)
    setAuthRequired(true)

    if (!payload?.silent) {
      toast.info('세션이 만료되었습니다. 다시 로그인해주세요.')
    }
  })

  return off
}, [])
```

로그인 성공 시에는 사용자 정보를 다시 설정하고, `authRequired`를 초기화합니다.

```tsx
const login = useCallback(async ({ email, password }) => {
  try {
    const res = await AuthAPI.login({ email, password })
    const payload = pickData(res)

    setAccessToken(payload.accessToken)

    const me = await UsersAPI.me({ silentAuth: true })
    setUser(me)

    markLoggedOut(false)
    setAuthRequired(false)

    return { ok: true }
  } catch {
    clearToken()
    return { ok: false }
  }
}, [])
```

### HeaderUnified

`HeaderUnified`는 `authRequired` 상태를 감지해 로그인 모달을 엽니다.

```tsx
const { user, ready, logout, authRequired, setAuthRequired } = useAuth()
const [showLogin, setShowLogin] = useState(false)

useEffect(() => {
  if (authRequired) {
    setShowLogin(true)
  }
}, [authRequired])
```

로그인 모달을 닫을 때는 `authRequired`도 함께 초기화합니다.

```tsx
const handleSetShowLogin = useCallback(
  (open) => {
    setShowLogin(open)

    if (!open) {
      setAuthRequired(false)
    }
  },
  [setAuthRequired]
)
```

렌더링:

```tsx
{showLogin && (
  <LoginModal setShowLoginModal={handleSetShowLogin} />
)}
```

경로 변경 시에는 사이드 메뉴를 닫되, 인증 만료로 열린 로그인 모달은 유지할 수 있도록 처리합니다.

```tsx
useEffect(() => {
  setShowMenu(false)

  if (!authRequired) {
    setShowLogin(false)
  }
}, [location.pathname, authRequired])
```

---

## 6. LoginModal 역할

`LoginModal`은 로그인 UI와 로그인 요청을 담당합니다.

- 이메일 / 비밀번호 입력
- AuthContext의 `login()` 호출
- 로그인 성공 시 모달 닫기
- 회원가입 / 비밀번호 찾기 페이지 이동

```tsx
const { login } = useAuth()

const onLogin = useCallback(async () => {
  if (!email.trim() || !password.trim()) {
    toast.error('이메일과 비밀번호를 입력해주세요')
    return
  }

  setLoading(true)

  try {
    const res = await login({ email, password })

    if (res?.ok) {
      setShowLoginModal(false)
    } else {
      toast.error('로그인 실패')
    }
  } finally {
    setLoading(false)
  }
}, [email, password, login, setShowLoginModal])
```

### 역할 분리

```text
httpClient
  → 401 감지

AuthContext
  → 인증 상태 관리
  → authRequired 상태 관리
  → login/logout 처리

HeaderUnified
  → authRequired 상태를 보고 LoginModal 표시

LoginModal
  → 로그인 입력 UI
  → login() 호출
```

---

## 7. API 요청 구조

페이지와 컴포넌트에서는 직접 axios를 호출하지 않고 service 계층을 통해 API를 호출합니다.

```text
Page / Component
  ↓
Service
  ↓
request()
  ↓
httpClient
  ↓
Server API
```

### 요청 규칙

- 모든 API 호출은 `request()` 단일 진입점 사용
- axios 직접 호출 금지
- `body === undefined`이면 data 필드 자체를 보내지 않음
- 인증 토큰 부착은 httpClient에서 처리
- 응답 포맷 처리는 공통 유틸에서 처리

---

## 8. 공통 request 함수

```ts
export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const response = await httpClient({
    url: path,
    method: options.method ?? 'GET',
    params: options.params,
    ...(options.body === undefined ? {} : { data: options.body }),
    headers: options.headers,
  })

  return pickData<T>(response)
}
```

### 의도

- API 요청 방식 일관화
- 응답 포맷 처리 공통화
- 인증 토큰 부착 위치 단일화
- 에러 처리 방식 통일
- 페이지 컴포넌트에서 서버 요청 세부 구현 제거

---

## 9. httpClient 역할

```ts
const httpClient = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE}${process.env.REACT_APP_API_PREFIX}`,
  withCredentials: true,
})
```

### 담당 역할

- API base URL 관리
- API prefix 관리
- `withCredentials: true` 적용
- Authorization Header 자동 부착
- 401 응답 처리
- 공통 에러 처리

```ts
httpClient.interceptors.request.use((config) => {
  const token = tokenMemory.get()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
```

---

## 10. 응답 처리 규칙

모든 API 성공 응답은 `{ data: ... }` 형식입니다.

```json
{
  "data": {
    "id": 1,
    "name": "상품명"
  }
}
```

리스트 응답은 `{ data, meta }` 구조입니다.

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "size": 20,
    "total": 123
  }
}
```

프론트에서는 `pickData()` 또는 공통 유틸로 `data`를 벗겨 사용합니다.

```ts
export function pickData<T>(response: AxiosResponse): T {
  return response.data.data
}
```

---

## 11. Home / Secret Page 운영 규칙

Home은 API 기반 추천 홈이 아니라 정적 랜딩 페이지로 운영합니다.

- 메인 로고 이미지 노출
- 메인 GIF 노출
- 첫 번째 섹션 클릭 시 `/secret` 페이지로 이동

### Secret Page

- `/secret` 경로로 접근 가능
- 정적 이미지와 floating box 표시
- 안내 박스는 사용자가 닫을 수 있음
- 운영/브랜드성 페이지
- 주문/회원 기능과 직접 연결되지 않음

---

## 12. 카테고리 / 상품 조회 규칙

### Categories

- 카테고리 목록은 공개 조회 가능
- 응답에는 `id`, `slug`, `name` 포함
- 프론트 필터/탭은 `slug` 기준으로 동작
- 화면에 보이는 이름은 바뀌어도, API 요청은 그대로 유지할 수 있기 때문에 사용

```ts
type Category = {
  id: number
  slug: string
  name: string
}
```

### Products List

- 공개 조회 가능
- `category` 또는 `categoryId` 기준 필터 가능
- category는 slug 기준 필터, categoryId는 DB id 기준 필터
- 우선 순위는 categoryId
- 목록 응답은 `thumbnailUrl` 단일 필드 사용
- 사용자에게는 `isActive=true` 상품만 노출한다고 가정

```ts
type ProductSummary = {
  id: number
  categorySlug: string
  name: string
  price: number
  description: string
  thumbnailUrl: string
  createdAt: string
}
```

### Products Detail

- `images`는 `string[]` URL 배열
- `optionGroups.options[].stock`으로 옵션 선택 UI와 재고 표시
- `optionId`, `variantId`, `variants`는 프론트에서 사용하지 않음

---

## 13. 옵션 선택 구조

상품 옵션은 `optionGroups` 기준으로 렌더링합니다.

```json
{
  "optionGroups": [
    {
      "key": "size",
      "label": "SIZE",
      "options": [
        { "value": "M", "stock": 3 },
        { "value": "L", "stock": 0 }
      ]
    }
  ]
}
```

```ts
{product.optionGroups.map((group) => (
  <div key={group.key}>
    <h3>{group.label}</h3>

    {group.options.map((option) => (
      <button
        key={option.value}
        disabled={option.stock === 0}
        onClick={() => selectOption(group.key, option.value)}
      >
        {option.value}
        {option.stock === 0 && " 품절"}
      </button>
    ))}
  </div>
))}
```

재고가 0이면 선택 불가 처리합니다.

---

## 14. 상품 등록 운영법

관리자는 상품 관리 페이지에서 상품을 추가합니다.

### 필수 입력

- 카테고리 slug
  - `outer`
  - `top`
  - `bottom`
  - `acc`
  - `for-artist`
  - `look`
- 상품명
- 가격

### 이미지 업로드

- 여러 장 업로드 가능
- 첫 번째 이미지가 대표 썸네일

### 옵션 / 재고

상품 옵션은 SIZE, COLOR 같은 옵션 그룹으로 구성하고, 실제 재고는 옵션 조합별로 관리합니다.

예시:

| 색상 | 사이즈 | 재고 |
| --- | --- | ---: |
| black | M | 2 |
| black | L | 0 |
| white | M | 1 |
| white | L | 3 |

프론트에서는 상품 상세 응답의 `optionGroups`를 기준으로 옵션 선택 UI를 구성하고, 각 선택지의 `stock` 값이 0이면 품절로 표시하거나 선택을 비활성화했습니다.

---

## 15. Cart 운영 규칙

장바구니는 비로그인 사용자도 사용할 수 있도록 localStorage 기반 로컬 상태로 관리했습니다.  
상품 담기와 수량 변경은 즉시 반영하고, 실제 주문 생성 시에는 서버가 옵션 조합과 재고를 최종 검증하도록 책임을 분리했습니다.

| 사용자 상태 | localStorage key |
| --- | --- |
| 로그인 사용자 | `cart_{username}` |
| 비로그인 사용자 | `cart_guest` |

동일 상품이라도 `optionValues`가 다르면 별도 라인으로 저장합니다.

```text
12
12|color=black&size=M
```

### 금액 계산

- 총액은 `(상품가 + 옵션 추가금) × 수량`
- 수량은 최소 1

### 재고 표시 / 수량 변경

- `product.optionGroups` 기반으로 옵션별 stock 확인
- 수량 증가 시 선택 옵션의 재고 상한 초과 불가
- 재고 부족 시 상단 notice UI로 안내

### 선택 결제

- CartPage는 상품 단위 선택/해제 지원
- Checkout 진입 시 선택한 라인아이템만 route state로 전달
- `selectedKeys` / `selectedItems` 기준으로 선택 결제 처리
- selectedKeys = 선택 상태 추적용, selectedItems = 체크아웃 화면 표시/주문 payload 생성용
---

## 16. Checkout 운영 규칙

Checkout은 장바구니 전체 결제 또는 선택 결제를 지원합니다.

```text
CartPage
  ↓
선택 상품 또는 전체 상품
  ↓
Checkout
  ↓
수령자 정보 입력
  ↓
결제 정보 입력
  ↓
POST /orders
```

### 주문 생성 payload

- `optionId`, `variantId`는 프론트에서 보내지 않음
- `optionValues`는 trim + 빈 값 제거 후 전송

```json
{
  "items": [
    {
      "productId": 1,
      "qty": 2,
      "optionValues": {
        "size": "M",
        "color": "black"
      }
    }
  ]
}
```

### 수령인 / 배송지

필수:

- name
- phone
- zipcode
- address1
- address2
- depositor

선택:

- email
- memo

주소 검색은 Daum Postcode 스크립트를 사용합니다.

### 에러 UX

- 주문 실패 시 상단 error box 표시
- 서버 code 기반 UX 메시지 매핑
- 서버에서 `VALIDATION_ERROR`와 함께 필드별 오류 정보를 내려주는 경우, `fieldErrors`를 입력 필드에 매핑해 사용자가 어떤 값을 수정해야 하는지 바로 확인할 수 있도록 구성
---

## 17. 주문 상태

| 상태 | 의미 |
| --- | --- |
| AWAITING_DEPOSIT | 입금 대기 |
| DEPOSIT_CONFIRMED | 입금 확인 |
| SHIPPED | 배송 중 |
| DELIVERED | 배송 완료 |
| CANCELED | 취소 |

관리자는 주문 상태에 따라 입금 확인, 배송 처리, 배송 완료 등의 액션을 수행합니다.

---

## 18. 반품 흐름

| 상태 | 의미 | 관리자 액션 |
| --- | --- | --- |
| REQUESTED | 고객 반품 요청 접수 | 승인 / 거절 |
| APPROVED | 반품 승인, 환불 대기 | 환불 로그 등록 |
| REJECTED | 반품 거절 | 종료 |
| REFUNDED | 환불 완료 | 종료 |

---

## 19. Notice / FAQ / System Policy

### Notice

- `GET /notices`
- `GET /notices/{id}`
- 목록이 비어 있으면 `"등록된 공지가 없습니다."`
- 본문은 줄바꿈 유지

```tsx
<div className="whitespace-pre-wrap">
  {notice.body}
</div>
```

### FAQ

- system policy 기반
- 공개 조회 가능
- plain text + 줄바꿈 유지
- 값이 없어도 정상 응답

```tsx
<div className="whitespace-pre-wrap">
  {faq?.content?.trim() || 'FAQ가 아직 등록되지 않았습니다.'}
</div>
```

### System Policy

다음 항목은 값이 없어도 404가 아니라 빈 값으로 정상 처리합니다.

- faq (자주 묻는 질문)
- returns  (반품 안내 문구)
- bankAccount (무통장 입금 계좌 안내)
- shipping (배송 정책 안내)

---

## 20. MyPage 운영 규칙

### 접근

- 로그인 사용자만 접근 가능
- 비로그인 시 로그인 필요 화면 표시
- tab query string 기준 동작

```text
/mypage?tab=orders
/mypage?tab=cancellations
/mypage?tab=returns
/mypage?tab=profile
```

### 탭

| 탭 | 설명 |
| --- | --- |
| orders | 주문 내역 |
| cancellations | 취소 내역 |
| returns | 반품 내역 |
| profile | 내 정보 수정 |

### Profile

마이페이지 프로필 수정 폼은 `GET /users/me` 응답값으로 초기화했습니다.  
응답의 `displayName`, `defaultZip`, `defaultAddress1`, `defaultAddress2`를 폼 상태의 `name`, `zip`, `address1`, `address2`로 매핑했습니다.

저장 시에는 API 명세에 맞춰 이름 값을 `name` 필드로 전송하고, 주소 정보는 `address` 객체에 담아 전송했습니다.

---

## 21. Legal 페이지 운영 규칙

Legal 페이지는 정적 페이지로 운영합니다.

- 서비스 이용 약관
- 개인정보처리방침
- 환불정책
- 배송정책

API 연동 없이 프론트 코드 내 정적 콘텐츠로 렌더링합니다.

---

