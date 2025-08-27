import React from "react";
import { Navigate } from "react-router-dom";
import { E } from "../../lib/env";

const KEY = "admin_authed";
export default function AdminGuard({ children }) {
  const [ok, setOk] = React.useState(
    typeof sessionStorage !== "undefined" && sessionStorage.getItem(KEY) === "1"
  );

  React.useEffect(() => {
    if (!ok) {
      if (!E.ADMIN_PASS) {
        alert("관리자 비밀번호가 설정되어 있지 않습니다. .env.local에 REACT_APP_ADMIN_PASS를 넣어주세요.");
        return;
      }
      const input = window.prompt("관리자 비밀번호를 입력하세요:");
      if (input && input === E.ADMIN_PASS) {
        sessionStorage.setItem(KEY, "1");
        setOk(true);
      }
    }
  }, [ok]);

  if (!ok) return <Navigate to="/" replace />;
  return children;
}
