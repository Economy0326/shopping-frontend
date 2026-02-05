export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold mb-6">배송정책</h1>

      <p className="mb-4 text-gray-700">
        본 배송정책은 노띵킹 에어리어(이하 “회사”) 쇼핑몰의 배송 관련 기준을 안내합니다.
      </p>

      <h2 className="text-lg font-semibold mt-6">1. 배송 지역</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>대한민국 내 배송</li>
        <li>도서산간/제주 지역은 추가 배송비가 발생할 수 있습니다.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6">2. 배송 기간</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>무통장 입금 주문: <b>입금 확인 후</b> 1~3영업일 내 출고</li>
        <li>출고 후 배송 기간은 택배사 사정에 따라 1~3영업일 추가 소요될 수 있습니다.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6">3. 배송비</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>기본 배송비 및 무료배송 기준은 운영 정책에 따라 적용됩니다.</li>
        <li>무료배송 기준은 이벤트/프로모션에 따라 변경될 수 있습니다.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6">4. 배송 조회</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>출고 후 송장번호가 등록되면 주문 상세에서 배송 조회가 가능합니다.</li>
        <li>송장 업데이트는 택배사 시스템 반영 시간에 따라 지연될 수 있습니다.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6">5. 배송 지연/분실</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>택배사/기상/연휴/물량 폭주 등으로 배송이 지연될 수 있습니다.</li>
        <li>배송 지연이 장기화되거나 분실이 의심되는 경우 고객센터로 문의해 주세요.</li>
      </ul>

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
