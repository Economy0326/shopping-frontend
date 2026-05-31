# Shopping Frontend

상품 탐색, 장바구니, 주문, 마이페이지, 관리자 운영 화면을 구현한 쇼핑몰 프론트엔드 프로젝트입니다.

이 프로젝트는 단순히 화면을 구성하는 것보다, 실제 쇼핑몰 운영에서 필요한 주문 상태, 인증 흐름, 관리자 처리 과정을 프론트엔드에서 일관되게 다루는 것에 초점을 두었습니다.

---

## Tech Stack

| 구분 | 기술 |
| --- | --- |
| Framework | React |
| Routing | React Router |
| API | Axios |
| Auth | JWT Access Token + Refresh Token Cookie |
| State | Context API |
| Deploy | Vercel |

---

## 주요 기능

### 사용자

- 상품 목록 / 상세 조회
- 옵션 선택
- 장바구니
- 선택 결제 / 전체 결제
- 체크아웃
- 주문 생성 / 주문 내역 조회
- 반품 요청
- QnA 작성 / 조회
- 공지 / FAQ 조회
- 마이페이지
- 로그인 / 회원가입 / 로그아웃

### 관리자

- 상품 등록 / 수정 / 삭제
- 이미지 업로드
- 주문 목록 조회
- 입금 확인 / 배송 처리
- 반품 승인 / 거절
- 공지 / FAQ 관리

---

## 핵심 구현

### 1. 인증 / 세션 관리

Access Token은 프론트 메모리에만 저장하고, Refresh Token은 HttpOnly Cookie로 관리했습니다.

- Access Token: `tokenMemory`
- Refresh Token: HttpOnly Cookie
- 모든 요청은 `withCredentials: true` 기준으로 동작
- 앱 최초 진입 시 Access Token이 없으면 `/auth/refresh`를 1회 시도
- 일반 API 요청 중 401 발생 시 자동 refresh/retry를 수행하지 않음

```text
Access Token  → 프론트 메모리
Refresh Token → HttpOnly Cookie
```

---

### 2. 401 인증 만료 처리

일반 API 요청 중 401이 발생하면 Access Token을 제거하고, 전역 `AUTH_REQUIRED` 이벤트를 발생시킵니다.

`AuthContext`는 해당 이벤트를 감지해 `authRequired` 상태를 `true`로 변경하고,  
`HeaderUnified`는 `authRequired` 상태를 감지해 현재 화면 위에 로그인 모달을 표시합니다.

```text
API 요청 중 401 발생
  ↓
Access Token 제거
  ↓
AUTH_REQUIRED 이벤트 발생
  ↓
AuthContext에서 authRequired = true
  ↓
HeaderUnified에서 LoginModal 표시
```

로그인 성공 시에는 사용자 정보를 다시 불러오고, `authRequired` 상태를 `false`로 초기화합니다.

---

### 3. API 요청 구조 분리

페이지와 컴포넌트에서 직접 axios를 호출하지 않고,  
`service → request → httpClient` 구조로 API 요청을 분리했습니다.

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

이를 통해 인증 토큰 부착, 응답 포맷 처리, 에러 처리를 한 곳에서 관리했습니다.

---

### 4. 장바구니 로컬 상태 관리

장바구니는 서버 API가 아니라 localStorage 기반 로컬 상태로 관리했습니다.

- 로그인 사용자: `cart_{username}`
- 비로그인 사용자: `cart_guest`
- 동일 상품이라도 옵션 조합이 다르면 별도 라인으로 저장

```text
12
12|color=black&size=M
```

---

### 5. 주문 / 체크아웃 흐름

장바구니 아이템을 주문 payload로 변환해 서버에 전달했습니다.

- `optionId`, `variantId`는 프론트에서 보내지 않음
- `optionValues` 기준으로 주문 생성
- 서버가 옵션 조합과 재고를 검증

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

---

### 6. 관리자 운영 흐름

운영자가 DB를 직접 수정하지 않고 관리자 화면에서 상품, 주문, 반품 상태를 처리할 수 있도록 구성했습니다.

- 상품 등록 / 수정
- 이미지 업로드
- 입금 확인
- 배송 처리
- 반품 승인 / 거절

---

## 프로젝트 구조

```text
src
├─ app
├─ shared
│  └─ api
│     ├─ authEvents
│     ├─ httpClient
│     ├─ request
│     └─ tokenMemory
├─ context
├─ features
│  ├─ auth
│  ├─ catalog
│  ├─ cart
│  ├─ checkout
│  ├─ mypage
│  ├─ qna
│  └─ admin
└─ ui
   └─ components
      ├─ HeaderUnified
      └─ LoginModal
```

---

## 환경 변수

```env
REACT_APP_API_BASE=https://shopping-backend-2yx6.onrender.com
REACT_APP_API_PREFIX=/api/v1
```

운영 환경에서는 `localhost` API 주소를 사용하지 않습니다.

---

## 실행 방법

```bash
npm install
npm start
```

---

## Build

```bash
npm run build
```

---

## 추가 문서

프로젝트 진행 중 정리한 API 연동 방식, 인증 정책, 주문/관리자 운영 흐름은 별도 문서에 정리했습니다.

- [Frontend 운영 연동 가이드](./docs/FRONTEND_GUIDE.md)
