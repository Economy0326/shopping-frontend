import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "features/auth/context/AuthContext";

/**
 * AdminGuard (권한 기반)
 * - user.role 이 admin/ADMIN 일 때만 통과
 */
export default function AdminGuard({ children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();

  if (!ready) return null; // 로딩중

  // role 문자열 normalize
  const role = String(user?.role ?? "").toLowerCase();
  const isAdmin = role === "admin" || user?.username === "admin"; // 임시 호환

  if (!isAdmin) {
    return <Navigate to="/" replace state={{ from: loc.pathname }} />;
  }

  return children;
}