import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "features/cart/context/CartContext";
import SideMenu from "ui/components/SideMenu";
import LoginModal from "ui/components/LoginModal";
import { useAuth } from "features/auth/context/AuthContext";

function HeaderWithLogo({ isLoggedIn }) {
  const navigate = useNavigate();
  const { cart } = useCart();

  const { logout, authRequired, setAuthRequired, ready } = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");

  // 401/세션만료 시: 헤더 유지 + 로그인 모달 유도(자동 오픈)
  useEffect(() => {
    if (!ready) return;
    if (authRequired) {
      setShowLoginModal(true); // 로그인 모달 호출
      setAuthRequired(false); // 중복 방지
    }
  }, [authRequired, ready, setAuthRequired]);

  const handleLogout = async () => {
    await logout();
  };

  const navBtn =
    "focus:outline-none focus-visible:outline-none active:outline-none " +
    "focus:ring-0 ring-0 border-0 outline-none select-none";

  const tapHighlightNone = { WebkitTapHighlightColor: "transparent" };

  return (
    <>
      <header className="header-nav flex items-center justify-between px-4 h-16 mb-4">
        <button
          type="button"
          onClick={() => setShowMenu(true)}
          className={navBtn}
          style={tapHighlightNone}
        >
          MENU
        </button>

        <div className="fixed top-0 left-0 right-0 bg-white h-16 px-4 flex items-center justify-between relative">
          <button
            type="button"
            onClick={() => navigate("/")}
            className={`${navBtn} cursor-pointer ml-20`}
            style={tapHighlightNone}
            aria-label="홈으로 이동"
            title="홈으로 이동"
          >
            <img
              src="/mood/brand-logo.png"
              alt="로고"
              className="h-10 object-contain ml-24"
            />
          </button>
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={() => navigate("/qna")} className={navBtn} style={tapHighlightNone}>
            Q&A
          </button>

          <button type="button" onClick={() => navigate("/mypage")} className={navBtn} style={tapHighlightNone}>
            MY PAGE
          </button>

          <button
            type="button"
            onClick={isLoggedIn ? handleLogout : () => setShowLoginModal(true)}
            className={navBtn}
            style={tapHighlightNone}
          >
            {isLoggedIn ? "LOGOUT" : "LOGIN"}
          </button>

          <button type="button" onClick={() => navigate("/cart")} className={navBtn} style={tapHighlightNone}>
            BAG
          </button>
        </div>
      </header>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setShowMenu(false)}
          />
          <SideMenu setShowMenu={setShowMenu} />
        </>
      )}

      {showLoginModal && (
        <LoginModal
          email={emailInput}
          password={password}
          setEmail={setEmailInput}
          setPassword={setPassword}
          setShowLoginModal={setShowLoginModal}
        />
      )}
    </>
  );
}

export default HeaderWithLogo;
