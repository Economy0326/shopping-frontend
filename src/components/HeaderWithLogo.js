import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import SideMenu from "./SideMenu";
import LoginModal from "./LoginModal";

function HeaderWithLogo({ isLoggedIn, setIsLoggedIn, username, setUsername }) {
  const navigate = useNavigate();
  const { cart } = useCart();

  const [showMenu, setShowMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    localStorage.removeItem("username");
  };


  return (
    <>
      <header className="flex items-center justify-between px-4 h-16 mb-4">
        {/* 메뉴 */}
        <button onClick={() => setShowMenu(true)}>MENU</button>

        {/* 공통 이미지 */}
        <div className="fixed top-0 left-0 right-0 bg-white h-16 px-4 flex items-center justify-between relative">
          <img
            src="/mood/brand-logo.png"
            alt="로고"
            className="h-10 object-contain ml-24"
          />
        </div>

        {/* Q&A페이지 + 마이페이지 + 로그인 + 장바구니 */}
        <div className="flex gap-4">
          <button onClick={() => navigate("/q&a")}>
            Q&A
          </button>
          <button onClick={() => navigate("/mypage")}>
            MY PAGE
          </button>
          <button
            onClick={isLoggedIn ? handleLogout : () => setShowLoginModal(true)}
          >
            {isLoggedIn ? "LOGOUT" : "LOGIN"}
          </button>
          <button onClick={() => navigate("/cart")}>
            BAG
          </button>
        </div>
      </header>

      {/* 메뉴 */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setShowMenu(false)}
          />
          <SideMenu setShowMenu={setShowMenu} />
        </>
      )}

      {/* 로그인 모달 */}
      {showLoginModal && (
        <LoginModal
          username={usernameInput}
          password={password}
          setUsername={setUsernameInput}
          setPassword={setPassword}
          setIsLoggedIn={setIsLoggedIn}
          setShowLoginModal={setShowLoginModal}
          setUsernameMain={setUsername}
        />
      )}
    </>
  );
}

export default HeaderWithLogo;
