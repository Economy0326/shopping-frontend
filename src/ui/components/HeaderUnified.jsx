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
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="px-3 md:px-8 lg:px-12">
          <div className="relative flex h-16 items-center justify-between">
            <button type="button" onClick={() => setShowMenu(true)} className={btn} style={tapNone}>
              MENU
            </button>

            {showLogo && (
              <button
                type="button"
                onClick={() => navigate("/")}
                className="absolute left-1/2 -translate-x-1/2"
                style={tapNone}
                aria-label="홈으로 이동"
                title="홈으로 이동"
              >
                <img src="/mood/brand-logo.png" alt="로고" className="h-9 md:h-10 object-contain" />
              </button>
            )}

            <nav className="flex items-center gap-3 md:gap-4">
              {/* 모바일: BAG만 */}
              <button type="button" onClick={() => navigate("/cart")} className={btn} style={tapNone}>
                BAG
              </button>

              {/* 데스크탑: 전체 */}
              <div className="hidden md:flex items-center gap-4">
                <button type="button" onClick={() => navigate("/qna")} className={btn} style={tapNone}>
                  Q&A
                </button>
                <button type="button" onClick={() => navigate("/mypage")} className={btn} style={tapNone}>
                  MY PAGE
                </button>

                {ready && isLoggedIn && isAdmin && (
                  <button type="button" onClick={() => navigate("/admin")} className={btn} style={tapNone}>
                    ADMIN
                  </button>
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
              </div>
            </nav>
          </div>
        </div>
      </header>

      {showMenu && (
        <>
          <button
            type="button"
            className="fixed inset-0 bg-black/40 z-40"
            aria-label="메뉴 닫기"
            onClick={() => setShowMenu(false)}
          />
          <SideMenu setShowMenu={setShowMenu} setShowLoginModal={setShowLogin} />
        </>
      )}

      {showLogin && <LoginModal setShowLoginModal={setShowLogin} />}
    </>
  );
}
