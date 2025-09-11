// src/pages/PrivacyPage.jsx
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold mb-6">개인정보처리방침</h1>

      {/* 서문 */}
      {/* 사이트 주소 나중에 변경 */}
      <p className="mb-4">
        노띵킹에어리어(이하 “회사”)는 회사가 운영하는 인터넷사이트(
        <a href="http://www.nothinkingarea.co.kr" className="underline underline-offset-2">
          http://www.nothinkingarea.co.kr
        </a>
        , 이하 “사이트”)에서 「개인정보보호법」에 따라 이용자의 개인정보 및 권익을 보호하고, 관련 민원을 원활히 처리하기 위해 다음과 같은 처리방침을 운영합니다.
        본 방침이 변경되는 경우 웹사이트 공지사항(또는 개별공지)으로 고지합니다.
      </p>

      {/* 1. 수집 항목/방법 */}
      <h2 className="text-lg font-semibold mt-6">1. 수집하는 개인정보 항목 및 수집 방법</h2>
      <h3 className="font-semibold mt-3">(1) 수집하는 개인정보의 항목</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>회원가입(필수): 이름, 생년월일, 성별, 이메일(ID), 비밀번호, 휴대전화번호</li>
        <li>회원가입(선택): 마케팅 수신 동의 여부(APP PUSH/SMS/EMAIL) — <span className="text-gray-500">운영 시에만 수집</span></li>
        <li>주문/배송(회원·비회원): 이름, 휴대전화번호, 이메일, 배송지 주소</li>
        <li>결제(무통장입금): 은행명, 입금자명(주문자명), 입금일시, (선택) 입금메모</li>
        <li>고객문의(Q&amp;A): 이름, 이메일, 연락처</li>
        <li>서비스 이용기록: 접속 IP, 접속 로그, 쿠키(필수 쿠키: 세션/장바구니/보안)</li>
      </ul>
      <h3 className="font-semibold mt-3">(2) 수집방법</h3>
      <p>홈페이지(주문·회원가입·Q&amp;A), 이메일/전화 문의, 서버 로그 생성</p>

      {/* 2. 이용 목적 */}
      <h2 className="text-lg font-semibold mt-6">2. 개인정보의 수집 및 이용 목적</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>회원관리: 가입의사 확인, 본인 식별·인증, 자격 유지·관리, 부정이용 방지</li>
        <li>주문/배송: 주문 처리, 물품 배송, 배송 알림</li>
        <li>결제/정산(무통장): 입금 확인, 환불(필요 시 환불 계좌 확인)</li>
        <li>고객응대: 문의·민원 처리 및 결과 통지</li>
        <li>서비스 안전·보안: 접속기록 관리, 이상거래 탐지, 법령 준수</li>
      </ul>

      {/* 3. 보유기간 */}
      <h2 className="text-lg font-semibold mt-6">3. 보유 및 이용기간</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>계약/청약철회/대금결제/재화공급 기록: 5년</li>
        <li>소비자 불만 또는 분쟁처리 기록: 3년</li>
        <li>접속 로그/IP 등 통신사실확인자료: 6개월</li>
        <li>회원 탈퇴 시: 지체 없이 파기(단, 관련 법령에 따른 보관 의무는 예외)</li>
      </ul>

      {/* 4. 제3자 제공 */}
      <h2 className="text-lg font-semibold mt-6">4. 개인정보의 제3자 제공</h2>
      <p className="mb-2">
        회사는 정보주체의 동의가 있거나 법률에 특별한 규정이 있는 경우에 한하여 개인정보를 제3자에게 제공합니다.
      </p>
      <h3 className="font-semibold mt-2">① 우체국(우정사업본부)</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>이용 목적: 물품 배송</li>
        <li>제공 항목: 수령인 이름, 휴대전화번호, 배송지 주소</li>
        <li>보유·이용기간: 제공 목적 달성 시 즉시 파기(법령상 보관기간 별도 규정 시 그 기간)</li>
      </ul>
      {/* 필요 시에만 아래 예시를 실제 사용 서비스명으로 추가하세요 */}
      {/* <h3 className="font-semibold mt-2">② 이메일/SMS 발송 대행사(사용 시)</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>이용 목적: 주문/배송 알림 발송</li>
        <li>제공 항목: 수취 연락처, 이메일</li>
        <li>보유·이용기간: 발송 완료 후 즉시 파기</li>
      </ul> */}

      {/* 5. 처리위탁 */}
      <h2 className="text-lg font-semibold mt-6">5. 개인정보 처리위탁</h2>
      <p>
        회사는 원활한 서비스 제공을 위해 필요한 경우에 한해 위탁을 실시하며, 위탁 시 「개인정보보호법」 제25조에 따라
        처리 금지, 기술·관리적 보호조치, 재위탁 제한, 관리·감독, 손해배상 등 책임사항을 계약에 명시합니다.
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li><span className="font-semibold">우체국(우정사업본부)</span> — 배송 업무 위탁</li>
        {/* 사용 시에만 기재: 호스팅/메일 발송/백업 등 */}
        {/* <li><span className="font-semibold">호스팅사(예: AWS/NCP)</span> — 서비스 인프라 운영</li>
        <li><span className="font-semibold">이메일 발송 대행(예: AWS SES)</span> — 알림 메일 발송</li> */}
      </ul>

      {/* 6. 이용자 권리 */}
      <h2 className="text-lg font-semibold mt-6">6. 정보주체의 권리와 행사 방법</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>열람·정정·삭제·처리정지 요구 가능(서면/이메일/팩스 등)</li>
        <li>오류 정정 완료 전까지 해당 개인정보 이용·제공 중단</li>
        <li>법정대리인·위임을 통한 대리 행사 가능(위임장 제출)</li>
      </ul>

      {/* 7. 파기 */}
      <h2 className="text-lg font-semibold mt-6">7. 개인정보의 파기</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>보유기간 경과 또는 처리 목적 달성 시 5일 이내 파기</li>
        <li>전자파일: 복구 불가능한 기술적 방법 / 문서: 분쇄 또는 소각</li>
      </ul>

      {/* 8. 쿠키(필수만) */}
      <h2 className="text-lg font-semibold mt-6">8. 쿠키의 이용 및 거부</h2>
      <p>
        회사는 로그인 유지, 장바구니 등 서비스를 위한 <strong>필수 쿠키</strong>를 사용합니다. 브라우저 설정에서 쿠키 저장을 제한할 수 있으나,
        필수 쿠키 차단 시 서비스 이용에 제한이 있을 수 있습니다.
      </p>

      {/* 9. 안전성 확보조치 */}
      <h2 className="text-lg font-semibold mt-6">9. 개인정보의 안전성 확보조치</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>개인정보 취급자 최소화 및 교육, 정기 자체감사</li>
        <li>내부관리계획 수립·시행, 접근권한 관리 및 침입차단</li>
        <li>비밀번호 등 중요정보 암호화, 전송구간 암호화</li>
        <li>접속기록 6개월 이상 보관 및 위·변조 방지</li>
        <li>문서 및 저장매체 잠금장치 보관, 물리적 출입통제</li>
      </ul>

      {/* 10. 책임자 */}
      <h2 className="text-lg font-semibold mt-6">10. 개인정보 보호책임자</h2>
      <div className="rounded-md bg-gray-50 p-3">
        <p>개인정보 보호 책임자</p>
        <ul className="list-disc pl-5">
          <li>성명: 이건희</li>
          <li>연락처: 010-5156-1801</li>
          <li>이메일: <a href="mailto:nothinkingarea@gmail.com" className="underline">nothinkingarea@gmail.com</a></li>
        </ul>
      </div>
      <p className="mt-2">개인정보 침해 신고·상담: 1336(개인분쟁조정위원회), eprivacy.or.kr(정보보호마크인증위원회), icic.sppo.go.kr(대검찰청), www.ctrc.go.kr(경찰청)</p>

      {/* 고지 */}
      <h2 className="text-lg font-semibold mt-6">고지의 의무</h2>
      <p>본 방침은 시행일로부터 적용되며, 변경사항이 있는 경우 시행 7일 전부터 공지합니다.</p>
      {/* 사이트 개정일 변경 */}
      <p className="text-gray-500">최근 개정일: 2025년 09월 01일 (월)</p>
    </div>
  );
}
