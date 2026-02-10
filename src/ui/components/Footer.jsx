import { useNavigate } from "react-router-dom";
import siteMeta from "shared/utils/siteMeta"; // 경로는 프로젝트에 맞게

export default function Footer() {
  const nav = useNavigate();

  const tapNone = { WebkitTapHighlightColor: "transparent" };
  const linkCls =
    "text-xs font-semibold hover:underline whitespace-nowrap " +
    "py-2"; 

  const { companyName, ownerName, mailOrderNo, address, businessNo, csCenter, links } =
    siteMeta;

  return (
    <footer className="border-t mt-10 pt-6 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="text-xs text-gray-600">
          <div className="font-semibold text-black">{companyName}</div>
          <div className="mt-1">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <button
            type="button"
            className={linkCls}
            onClick={() => nav(links.terms)}
            style={tapNone}
          >
            이용약관
          </button>
          <button
            type="button"
            className={linkCls}
            onClick={() => nav(links.privacy)}
            style={tapNone}
          >
            개인정보처리방침
          </button>
          <button
            type="button"
            className={linkCls}
            onClick={() => nav(links.refund)}
            style={tapNone}
          >
            환불정책
          </button>
          <button
            type="button"
            className={linkCls}
            onClick={() => nav(links.shipping)}
            style={tapNone}
          >
            배송정책
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

      <div className="mt-5 text-[11px] leading-5 text-gray-500 whitespace-pre-line">
        {`상호: ${companyName}  |  대표: ${ownerName}
사업자등록번호: ${businessNo}  |  통신판매업신고: ${mailOrderNo}
주소: ${address}
고객센터: ${csCenter.tel}  |  이메일: ${csCenter.email}
`}
      </div>
    </footer>
  );
}
