import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SideMenu from "ui/components/SideMenu";
import LoginModal from "ui/components/LoginModal";
import { useAuth } from "features/auth/context/AuthContext";

export default function HeaderUnified({ showLogo = false }) {
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showMenu, setShowMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    setShowLogin(false);
    setShowMenu(false);
  }, [location.pathname]);

  const isLoggedIn = !!user;
  const isAdmin = String(user?.role ?? "").toLowerCase() === "admin";

  const btn =
    "uppercase font-extrabold tracking-tight text-sm md:text-base " +
    "outline-none ring-0 [appearance:none] select-none";
  const tapNone = { WebkitTapHighlightColor: "transparent" };

  return (
    <>
      <header className="relative flex items-center justify-between px-4 h-16 bg-white">
        {/* MENU */}
        <button type="button" onClick={() => setShowMenu(true)} className={btn} style={tapNone}>
          MENU
        </button>

        {/* 로고 */}
        {showLogo && (
          <button
            type="button"
            onClick={() => navigate("/")}
            className="absolute left-1/2 -translate-x-1/2"
            style={tapNone}
            aria-label="홈으로 이동"
            title="홈으로 이동"
          >
            <img src="/mood/brand-logo.png" alt="로고" className="h-10 object-contain" />
          </button>
        )}

        {/* 오른쪽 */}
        <nav className="flex items-center gap-4">
          <button type="button" onClick={() => navigate("/qna")} className={btn} style={tapNone}>
            Q&A
          </button>

          <button type="button" onClick={() => navigate("/mypage")} className={btn} style={tapNone}>
            MY PAGE
          </button>

          {ready && isLoggedIn && isAdmin && (
            <>
              <button type="button" onClick={() => navigate("/admin")} className={btn} style={tapNone}>
                ADMIN
              </button>
            </>
          )}

          {!ready ? null : !isLoggedIn ? (
            <button type="button" onClick={() => setShowLogin(true)} className={btn} style={tapNone}>
              LOGIN
            </button>
          ) : (
            <button type="button" onClick={logout} className={`${btn} text-red-500`} style={tapNone}>
              LOGOUT
            </button>
          )}

          <button type="button" onClick={() => navigate("/cart")} className={btn} style={tapNone}>
            BAG
          </button>
        </nav>
      </header>

      {showMenu && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowMenu(false)} />
          <SideMenu setShowMenu={setShowMenu} />
        </>
      )}

      {showLogin && <LoginModal setShowLoginModal={setShowLogin} />}
    </>
  );
}