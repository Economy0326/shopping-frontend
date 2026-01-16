import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "features/auth/context/AuthContext";

export default function AdminGuard({ children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();

  if (!ready) return null;

  const role = String(user?.role ?? "").toLowerCase();
  const isAdmin = role === "admin"; // 여기만 기준으로!

  if (!user) return <Navigate to="/" replace state={{ from: loc.pathname }} />;
  if (!isAdmin) return <Navigate to="/" replace state={{ from: loc.pathname }} />;

  return children;
}