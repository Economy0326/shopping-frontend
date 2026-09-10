# Shopping Mall Frontend

상품 탐색부터 장바구니, 회원 / 비회원 주문,
주문 조회와 관리자 주문·반품 처리까지 구현한 쇼핑몰 프로젝트입니다.

프로젝트 진행 중 함께 개발하던 Backend 담당자가 빠졌지만,
중단하지 않고 필요한 API 구조와 주문 정책을 정리하면서
Frontend와 서버를 연결해 전체 주문 흐름을 마무리했습니다.

외부 PG와 택배사 API는 프로젝트 범위에서 제외하고,
무통장 입금과 관리자 배송 처리를 기준으로 주문 흐름을 구성했습니다.

## Screens

<p align="center">
  <img src="./docs/screens/product-list.png" width="46%" />
  <img src="./docs/screens/guest-checkout.png" width="46%" />
</p>

<p align="center">
  <img src="./docs/screens/admin-orders.png" width="46%" />
  <img src="./docs/screens/admin-returns.png" width="46%" />
</p>

## 구현에서 중요하게 본 부분

### 회원 / 비회원 주문

로그인 사용자와 비로그인 사용자의 주문 흐름을 나눴습니다.

비회원도 주문 이후 흐름을 이어갈 수 있도록
주문번호와 주문 시 입력한 휴대폰 번호를 이용해
주문 조회, 취소 요청과 반품 요청이 가능하도록 화면을 구성했습니다.

### 주문 이후 Flow

주문 생성에서 끝내지 않고 이후 상태도 이어서 확인할 수 있도록 구성했습니다.

```text
주문
→ 입금 확인
→ 배송
→ 배송 완료
→ 취소 / 반품
```

### 관리자 주문 처리

관리자가 주문 상태를 확인하고
입금 확인, 배송 처리, 반품 승인 / 거절을 할 수 있는 화면을 구현했습니다.

### 개발 과정에서 바꾼 방식

처음에는 기능 구현부터 시작하면서
Frontend와 Backend의 요청·응답 기준이나 주문 상태를 여러 번 수정해야 했습니다.

이후에는 주문 상태와 예외 조건,
요청·응답 구조를 먼저 정리한 뒤 구현하는 방식으로 바꿨습니다.

익숙하지 않은 Backend 영역은 LLM을 활용해 필요한 부분을 확인했고,
실제 화면과 연결하면서 기능이 정상적으로 동작하는지 확인했습니다.

## Tech Stack

`React` `JavaScript` `React Router`  
`Axios` `Tailwind CSS`

## Run

```bash
npm install
npm start
```
