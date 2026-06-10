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

  useEffect(() => {
    if (!showMenu) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [showMenu]);

  const isLoggedIn = !!user;
  const isAdmin = String(user?.role ?? "").toLowerCase() === "admin";

  const btn =
    "uppercase font-extrabold tracking-tight text-sm md:text-base " +
    "outline-none ring-0 [appearance:none] select-none whitespace-nowrap";

  const tapNone = { WebkitTapHighlightColor: "transparent" };

  return (
    <>
      <header className="relative z-30 flex items-center justify-between px-4 py-4 md:px-8">
        <button
          onClick={() => setShowMenu(true)}
          className={btn}
          style={tapNone}
        >
          MENU
        </button>

        {showLogo && (
          <button
            onClick={() => navigate("/")}
            className="absolute left-1/2 -translate-x-1/2"
            style={tapNone}
            aria-label="홈으로 이동"
            title="홈으로 이동"
          >
            <img src="/mood/brand-logo.png" alt="로고" className="h-8 md:h-10" />
          </button>
        )}

        {/* 모바일: BAG만 */}
        <div className="flex md:hidden items-center gap-4">
          <button
            onClick={() => navigate("/cart")}
            className={btn}
            style={tapNone}
          >
            BAG
          </button>
        </div>

        {/* 데스크탑: 전체 */}
        <nav className="hidden md:flex items-center gap-5">
          <button
            onClick={() => navigate("/qna")}
            className={btn}
            style={tapNone}
          >
            Q&amp;A
          </button>

          {ready && !isLoggedIn && (
            <button
              onClick={() => navigate("/guest-orders")}
              className={btn}
              style={tapNone}
            >
              GUEST ORDER
            </button>
          )}

          {ready && isLoggedIn && (
            <button
              onClick={() => navigate("/mypage")}
              className={btn}
              style={tapNone}
            >
              MY PAGE
            </button>
          )}

          {ready && isLoggedIn && isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className={btn}
              style={tapNone}
            >
              ADMIN
            </button>
          )}

          {!ready ? null : !isLoggedIn ? (
            <button
              onClick={() => setShowLogin(true)}
              className={btn}
              style={tapNone}
            >
              LOGIN
            </button>
          ) : (
            <button onClick={logout} className={btn} style={tapNone}>
              LOGOUT
            </button>
          )}
        </nav>
      </header>

      {showMenu && (
        <SideMenu
          setShowMenu={setShowMenu}
          setShowLoginModal={setShowLogin}
        />
      )}

      {showLogin && <LoginModal setShowLoginModal={setShowLogin} />}
    </>
  );
}