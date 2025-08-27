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
  
  const navBtn =
    "focus:outline-none focus-visible:outline-none active:outline-none " +
    "focus:ring-0 ring-0 border-0 outline-none select-none";

  const tapHighlightNone = { WebkitTapHighlightColor: "transparent" };

  return (
    <>
      <header className="header-nav flex items-center justify-between px-4 h-16 mb-4">
        {/* 메뉴 */}
        <button
          type="button"
          onClick={() => setShowMenu(true)}
          className={navBtn}
          style={tapHighlightNone}
        >
          MENU
        </button>

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
          <button
            type="button"
            onClick={() => navigate("/qna")}
            className={navBtn}
            style={tapHighlightNone}
          >
            Q&A
          </button>

          <button
            type="button"
            onClick={() => navigate("/mypage")}
            className={navBtn}
            style={tapHighlightNone}
          >
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

          <button
            type="button"
            onClick={() => navigate("/cart")}
            className={navBtn}
            style={tapHighlightNone}
          >
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
