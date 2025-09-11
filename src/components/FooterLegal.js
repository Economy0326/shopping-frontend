import siteMeta from "../lib/siteMeta";
import { Link } from "react-router-dom";

export default function FooterLegal() {
  const s = siteMeta;
  return (
    <footer className="mt-auto border-t border-gray-200">
      <div className="px-4 py-6">
        <p
          className="
            whitespace-nowrap          
            text-black  
            tracking-tight
            text-[clamp(11px,1.6vw,14px)]
          "
        >
          상호명: {s.companyName} 대표자: {s.ownerName} 사업자등록번호: {s.businessNo}
        </p>
        <p
          className="
            whitespace-nowrap          
            text-black 
            tracking-tight
            text-[clamp(11px,1.6vw,14px)]
          "
        >
          주소: {s.address} 전자우편: {s.csCenter.email} 전화번호: {s.csCenter.tel}
        </p>
        <p
          className="
            whitespace-nowrap          
            text-black 
            tracking-tight
            text-[clamp(11px,1.6vw,14px)]
          "
        >
          <a href={s.links.terms} className="no-underline hover:underline font-semibold">[이용약관]</a>
          {" "}
          <a href={s.links.privacy} className="no-underline hover:underline font-semibold">[개인정보처리방침]</a>
          {" "}
          © {new Date().getFullYear()} {s.companyName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}