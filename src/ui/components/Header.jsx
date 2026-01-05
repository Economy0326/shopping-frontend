import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideMenu from "ui/components/SideMenu";
import LoginModal from "ui/components/LoginModal";
import { useAuth } from "features/auth/context/AuthContext";

function Header({ isLoggedIn }) {
  const navigate = useNavigate();

  const { logout, authRequired, ready } = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");

  // 401/세션만료 시: 헤더 유지 + 로그인 모달 유도(자동 오픈)
  useEffect(() => {
    if (!ready) return;
    if (authRequired) {
      setShowLoginModal(true); // 로그인 모달 호출
    }
  }, [authRequired, ready]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 h-16 mb-4">
        <button onClick={() => setShowMenu(true)}>MENU</button>

        <div className="flex gap-4">
          <button onClick={() => navigate("/qna")}>Q&A</button>
          <button onClick={() => navigate("/mypage")}>MY PAGE</button>

          <button onClick={isLoggedIn ? handleLogout : () => setShowLoginModal(true)}>
            {isLoggedIn ? "LOGOUT" : "LOGIN"}
          </button>

          <button onClick={() => navigate("/cart")}>BAG</button>
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

export default Header;
