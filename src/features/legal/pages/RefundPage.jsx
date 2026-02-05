export default function RefundPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold mb-6">환불정책</h1>

      <p className="mb-4 text-gray-700">
        본 환불정책은 노띵킹 에어리어(이하 “회사”) 쇼핑몰 이용과 관련하여 교환·반품·환불 기준을 안내합니다.
        (전자상거래 등에서의 소비자보호에 관한 법률 등 관계 법령을 따릅니다.)
      </p>

      <h2 className="text-lg font-semibold mt-6">1. 반품/교환 가능 기간</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>상품 수령일로부터 <b>7일 이내</b> 접수 시 반품/교환 신청 가능</li>
        <li>상품 불량/오배송은 확인 즉시 접수 권장</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6">2. 반품/교환이 불가능한 경우</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>상품 수령 후 7일이 경과한 경우</li>
        <li>사용 흔적(착용/세탁/오염/향기/훼손)이 있는 경우</li>
        <li>택/라벨/패키지 훼손 또는 구성품 누락</li>
        <li>고객 부주의로 상품 가치가 현저히 감소한 경우</li>
        <li>주문 제작/커스텀 상품 등 별도 고지된 상품</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6">3. 환불 처리</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>반품 상품 회수 및 검수 완료 후 환불이 진행됩니다.</li>
        <li>무통장 입금(계좌이체) 주문의 경우 환불 계좌 확인이 필요할 수 있습니다.</li>
        <li>환불 처리 기간: 검수 완료 후 영업일 기준 3~7일 내 처리(상황에 따라 변동 가능)</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6">4. 반품 배송비(교환/반품 비용)</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>단순 변심: 고객 부담</li>
        <li>오배송/불량: 회사 부담</li>
        <li>
          부분 반품으로 무료배송 조건이 깨지는 경우, 초기 배송비가 추가 청구될 수 있습니다.
          (운영 정책에 따라 달라질 수 있습니다.)
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6">5. 접수 방법</h2>
      <ol className="list-decimal pl-5 space-y-1">
        <li>마이페이지 주문내역 또는 Q&amp;A로 반품/교환 요청</li>
        <li>회수 안내에 따라 상품 포장 후 발송</li>
        <li>회수/검수 완료 후 교환 출고 또는 환불 처리</li>
      </ol>

      <h2 className="text-lg font-semibold mt-6">6. 고객센터</h2>
      <div className="rounded-md bg-gray-50 p-3">
        <ul className="list-disc pl-5">
          <li>전화: 010-5156-1801</li>
          <li>
            이메일:{" "}
            <a href="mailto:nothinkingarea@gmail.com" className="underline">
              nothinkingarea@gmail.com
            </a>
          </li>
        </ul>
      </div>

      <p className="mt-6 text-gray-500">최근 개정일: {new Date().getFullYear()}년</p>
    </div>
  );
}
