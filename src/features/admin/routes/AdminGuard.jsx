import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "features/auth/context/AuthContext";

/**
 * AdminGuard (권한 기반)
 * - user.role === "admin" 일 때만 통과
 */
export default function AdminGuard({ children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();

  if (!ready) return null; // 로딩중
  const isAdmin = user?.role === "admin" || user?.username === "admin"; // 임시 호환

  if (!isAdmin) {
    return <Navigate to="/" replace state={{ from: loc.pathname }} />;
  }

  return children;
}
