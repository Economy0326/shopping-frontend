# Frontend 운영 연동 가이드

## 환경 변수

REACT_APP_API_BASE=https://YOUR-BACKEND.onrender.com  
REACT_APP_API_PREFIX=/api/v1

- 운영에서는 http://localhost:8080 사용 금지
- 프론트는 항상 아래 기준으로 API 호출  
  REACT_APP_API_BASE + REACT_APP_API_PREFIX
- 모든 요청은 withCredentials: true 기준으로 동작

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

- accessToken 제거
- 전역 AUTH_REQUIRED 이벤트 발생
- 강제 라우팅 금지
- 현재 화면 유지 + 로그인 모달 표시

---

## 요청 규칙

- 모든 API 호출은 request() 단일 진입점 사용
- axios 직접 호출 금지
- body === undefined 이면 data 필드 자체를 보내지 않음
- /auth/refresh 요청 시 헤더 추가  
  x-silent-auth: 1

---

## 상품 등록 운영법 (관리자)

### 기본 흐름
- 관리자 로그인 → 상품 관리 → 상품 추가

### 필수 입력
- 카테고리(slug)  
  outer / top / bottom / acc / for-artist / look
- 상품명, 가격

※ look 카테고리는 가격 입력 가능하지만 프론트에서는 표시되지 않음

---

### 이미지 업로드
- 여러 장 업로드 가능
- 첫 번째 이미지가 대표 썸네일

---

### 옵션 / 재고 (일반 상품)

optionGroups 추가

예시:
SIZE: M(3), L(0)  
COLOR: black(2)

- 재고 0이면 품절 처리 (선택 불가)

---

### 상세 안내 입력

- sizeGuideMdUrl 또는 sizeGuideText
- productInfoMdUrl 또는 productInfoText

---

### 룩북 상품 (category = look)

- lookMdUrl 입력
- 없으면 description 노출

---

### 이미지 권장 규격

- 일반 상품: 1:1 (1200x1200 권장)
- LOOK 상품: 3:2 (900x1350 권장)

---

## 로그인 / 세션 만료 운영법 (고객 / CS)

### 기본 동작
- accessToken은 프론트 메모리에만 저장

---

### 세션 만료 또는 401 발생 시

- 현재 화면 유지
- 로그인 모달 자동 표시

---

### 재로그인 성공 시

- 기존 화면 유지

---

### 로그인 실패 지속 시 (CS 안내)

- 브라우저 쿠키 허용 여부
- 시크릿 모드 사용 여부
- 브라우저 보안 정책 여부
