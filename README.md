# Frontend 운영 연동 가이드

## 환경 변수

REACT_APP_API_BASE=https://shopping-backend-2yx6.onrender.com
REACT_APP_API_PREFIX=/api/v1

운영에서는 http://localhost:8080 사용 금지

프론트는 항상 아래 기준으로 API 호출
REACT_APP_API_BASE + REACT_APP_API_PREFIX

모든 요청은 withCredentials: true 기준으로 동작

---

## 인증 / 세션 정책

### Access Token

- 프론트 메모리(tokenMemory)에만 저장
- localStorage / sessionStorage 저장 금지
- 모든 인증 요청에 자동 포함
  Authorization: Bearer <accessToken>

### Refresh Token

- 서버가 HttpOnly Cookie로 관리
- 프론트 JS에서 접근 불가

---

## 토큰 갱신 정책

- 일반 API 요청 중 401 발생 시 /auth/refresh 자동 재시도 금지
- 앱 최초 진입 시 accessToken이 없을 때만 /auth/refresh 1회 시도
- refresh 실패 시 비로그인 상태 유지 + 로그인 모달 표시

---

## 401 처리 UX

1. accessToken 제거
2. 전역 AUTH_REQUIRED 이벤트 발생
3. 강제 라우팅 금지
4. 현재 화면 유지 + 로그인 모달 표시

---

## 요청 규칙

- 모든 API 호출은 request() 단일 진입점 사용
- axios 직접 호출 금지
- body === undefined 이면 data 필드 자체를 보내지 않음

### /auth/refresh 요청 시

- 헤더 추가
  x-silent-auth: true

---

## 응답 처리 규칙

- 모든 API 성공 응답은 { data: ... } 형식
- 프론트는 pickData(res) 또는 공통 유틸로 data를 벗겨 사용한다

### 리스트 응답

{
  data: [],
  meta: { page, size, total }
}

- 값이 비어 있는 상태(empty value)는 정상 응답이며 404가 아니다

---

## Home 운영 규칙

### 기본 동작

- Home은 API 기반이 아닌 정적 랜딩 페이지로 운영한다
- 메인 로고 이미지와 메인 GIF를 노출한다
- 첫 번째 섹션 클릭 시 /secret 페이지로 이동한다

### Secret Page

- /secret 경로로 접근 가능
- 정적 이미지와 floating box를 표시한다
- 안내 박스는 사용자가 닫을 수 있다
- 운영/브랜드성 페이지이며 주문/회원 기능과 직접 연결되지 않는다

---

## 카테고리 / 상품 조회 규칙

### Categories

- 카테고리 목록은 공개 조회 가능
- 현재 응답에는 id, slug, name이 포함된다
- 프론트 필터/탭은 slug 기준으로 동작한다

### Products List

- 상품 목록은 공개 조회 가능
- category 또는 categoryId 기준으로 필터 가능하다
- 목록 응답은 thumbnailUrl 단일 필드를 사용한다
- isActive=true 상품만 노출된다고 가정하고 화면을 구성한다

### Products Detail

- 상세 응답의 images는 string[] URL 배열 기준으로 사용한다
- optionGroups.options[].stock 으로 옵션 선택 UI와 재고 표시를 처리한다
- optionId / variantId / variants 는 프론트에서 사용하지 않는다

### look 카테고리

- optionGroups가 비어 있을 수 있다
- lookMdUrl 이 있으면 우선 사용하고, 없으면 description 을 노출할 수 있다

---

## 상품 등록 운영법 (관리자)

### 기본 흐름

- 관리자 로그인 → 상품 관리 → 상품 추가

### 필수 입력

- 카테고리(slug)
  outer / top / bottom / acc / for-artist / look
- 상품명, 가격

※ look 카테고리는 가격 입력 가능하지만 프론트에서는 표시되지 않음

### 이미지 업로드

- 여러 장 업로드 가능
- 첫 번째 이미지가 대표 썸네일

### 옵션 / 재고 (일반 상품)

- optionGroups 추가

예시:
SIZE: M(3), L(0)
COLOR: black(2)

- 재고 0이면 품절 처리 (선택 불가)
- 프론트는 optionGroups.options[].stock 기준으로 선택 가능 여부를 판단한다

### 상세 안내 입력

- sizeGuideMdUrl 또는 sizeGuideText
- productInfoMdUrl 또는 productInfoText

### 룩북 상품 (category = look)

- lookMdUrl 입력
- 없으면 description 노출

### 이미지 권장 규격

- 일반 상품: 1:1 (1200x1200 권장)
- LOOK 상품: 3:2 (900x1350 권장)

---

## Cart 운영 규칙

### 저장 방식

- 장바구니는 현재 서버 API가 아니라 프론트 로컬 상태로 관리한다
- 로그인 사용자: localStorage key = cart_{username}
- 비로그인 사용자: localStorage key = cart_guest

### 라인 아이템 규칙

- 동일 상품이라도 optionValues가 다르면 별도 라인으로 저장한다
- 라인 키는 productId + optionValues 정렬값 기준으로 생성한다

예시:
12
12|color=black&size=M

- optionValues는 빈 값 제거 후 저장한다
- optionValues key는 정렬하여 안정적으로 저장한다

### 금액 계산 규칙

- 총액은 (상품가 + 옵션 추가금) × 수량 기준으로 계산한다
- 수량은 최소 1이다

### 재고 표시 / 수량 변경 규칙

- CartPage는 product.optionGroups 기반으로 옵션별 stock을 읽는다
- 수량 증가 시 선택 옵션의 재고 상한을 초과할 수 없다
- 재고 상한은 선택된 옵션 stock의 최소값 기준으로 계산한다
- 재고 부족 시 상단 notice UI로 안내한다

### 선택 결제 규칙

- CartPage는 상품 단위 선택/해제를 지원한다
- Checkout 진입 시 선택한 라인아이템만 route state로 전달할 수 있다
- selectedKeys / selectedItems 기준으로 선택 결제를 처리한다

---

## Checkout 운영 규칙

### 기본 동작

- Checkout은 장바구니 전체 결제 또는 선택 결제를 지원한다
- 선택 결제 시 CartPage에서 selectedKeys / selectedItems를 route state로 전달한다
- 결제 대상이 없으면 /cart 로 이동한다

### 주문 생성 payload 규칙

- 주문 생성 payload는 optionValues 기반으로 구성한다
- optionId / variantId는 프론트에서 보내지 않는다
- optionValues는 trim + 빈 값 제거 후 전송한다

예시:

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

### 수령인 / 배송지 규칙

- name, phone, zipcode, address1, address2, depositor 필수
- email, memo 선택

- 주소 검색은 Daum Postcode 스크립트 사용

### 기본 배송지 저장 규칙

- 로그인 사용자 체크 시 주문 성공 후 API 추가 호출 가능
- 실패해도 주문 실패로 처리하지 않음

### 무통장입금 안내 규칙

- system policy bankAccount 사용
- 값 없으면 미설정 문구 표시
- notice 없으면 기본 안내 표시

### 에러 UX 규칙

- 주문 실패 시 상단 error box 표시
- 서버 code 기반 UX 메시지 매핑
- validation 오류는 fieldErrors 표시 가능

---

## 로그인 / 세션 만료 운영법

### 기본 동작

- accessToken은 프론트 메모리에만 저장

- 세션 만료 / 401 발생 시
  - 현재 화면 유지
  - 로그인 모달 표시

- 재로그인 성공 시
  - 기존 화면 유지

### 로그인 실패 지속 시 (CS 안내)

- 브라우저 쿠키 허용 여부
- 시크릿 모드 여부
- 브라우저 보안 정책 확인

---

## Notice 운영 규칙

### API

- GET /notices
- GET /notices/{id}

### 화면 규칙

- 목록 비어있으면 "등록된 공지가 없습니다."
- 상세 없으면 "존재하지 않는 공지입니다."

- 본문은 줄바꿈 유지

예시:

<div className="whitespace-pre-wrap">
  {notice.body}
</div>

---

## QnA 운영 규칙

- user: 본인만 조회
- admin: 전체 조회
- detail: 작성자 또는 admin만 접근 가능
- 삭제: soft delete

### 응답

- 목록: { data: [...], meta: ... }
- 상세: { data: {...} }
- 변경: { data: true }

---

## FAQ 표시 규칙

- FAQ는 system policy 기반
- 공개 조회 가능
- plain text + 줄바꿈 유지
- 값 없어도 정상 응답

### 빈 값 처리

- "FAQ가 아직 등록되지 않았습니다." 표시

예시:

<div className="whitespace-pre-wrap">
  {faq?.content?.trim() || "FAQ가 아직 등록되지 않았습니다."}
</div>

---

## System Policy 처리 규칙

- faq
- returns
- bankAccount
- shipping

### 공통

- 값 없어도 404 아님
- 빈 값 정상 처리
- 프론트 fallback UI 표시

---

## MyPage 운영 규칙

### 접근

- 로그인 사용자만 접근 가능
- 비로그인 시 로그인 필요 화면

- tab query string 기준 동작

### 탭

- orders
- cancellations
- returns
- profile

### Orders

- GET /orders
- createdAt desc 정렬
- 구매확정 버튼 노출 가능
- 상세: /order/{id}

### Cancellations

- GET /orders?status=CANCELED
- 없으면 빈 상태 문구

### Returns

- 상태:
  REQUESTED
  APPROVED
  REJECTED
  REFUNDED

- 상태별 helper 문구 표시

### Profile

- GET /users/me 기반 초기화

- 필드:
  displayName
  defaultZip
  defaultAddress1
  defaultAddress2

- 저장 시 name으로 전송

- 주소 검색: Daum Postcode

---

## Users / Profile 연동 규칙

### GET /users/me

- 인증 필요

- 응답:
  id
  email
  role
  displayName
  phone
  defaultZip
  defaultAddress1
  defaultAddress2
  createdAt

---

### PATCH /users/me/profile

- 인증 필요

- 프론트는 name으로 전송
- address 객체 포함 가능

예시:

{
  "name": "홍길동",
  "phone": "010-0000-0000",
  "address": {
    "zip": "12345",
    "address1": "서울시 ...",
    "address2": "101호"
  }
}

---

### PUT /users/default-address

- 인증 필요

- 평면 구조 사용

예시:

{
  "zip": "12345",
  "address1": "서울시 ...",
  "address2": "101호"
}

---

## Legal 페이지 운영 규칙

- 정적 페이지로 운영
- API 연동 없음

### 대상

- 서비스 이용 약관
- 개인정보처리방침
- 환불정책
- 배송정책

### 규칙

- 프론트 코드 내 정적 콘텐츠로 렌더링
- 추후 system policy 또는 CMS 전환 가능
