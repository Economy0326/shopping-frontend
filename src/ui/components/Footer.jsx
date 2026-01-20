import { useNavigate } from "react-router-dom";

export default function Footer() {
  const nav = useNavigate();

  const linkCls = "text-xs font-semibold hover:underline outline-none ring-0 [appearance:none]";
  const tapNone = { WebkitTapHighlightColor: "transparent" };

  return (
    <footer className="border-t mt-8 pt-6 pb-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-gray-600">
          <div className="font-semibold text-black">NOTHINKING-AREA</div>
          <div className="mt-1">
            © {new Date().getFullYear()} NOTHINKING-AREA. All rights reserved.
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            className={linkCls}
            onClick={() => nav("/legal/terms")}
            style={tapNone}
          >
            이용약관
          </button>
          <button
            type="button"
            className={linkCls}
            onClick={() => nav("/legal/privacy")}
            style={tapNone}
          >
            개인정보처리방침
          </button>
          <button
            type="button"
            className={linkCls}
            onClick={() => nav("/qna")}
            style={tapNone}
          >
            Q&A
          </button>
        </div>
      </div>

      <div className="mt-4 text-[11px] leading-5 text-gray-500 whitespace-pre-line">
        {`상호: NOTHINKING-AREA  |  대표: 이건희
        사업자등록번호: 000-00-00000  |  통신판매업신고: 2026-서울-0000
        주소: 서울특별시 어딘가
        고객센터: 010-5156-1801 (평일 10:00-17:00)
        `}
      </div>
    </footer>
  );
}
