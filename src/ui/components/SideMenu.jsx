import { FaInstagram } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "features/auth/context/AuthContext";

export default function SideMenu({ setShowMenu, setShowLoginModal }) {
  const nav = useNavigate();
  const { user, ready, logout } = useAuth();
  const isLoggedIn = !!user;
  const isAdmin = String(user?.role ?? "").toLowerCase() === "admin";
  
  const closeMenu = () => {
    if (typeof setShowMenu === "function") {
      setShowMenu(false);
    }
  };

  const go = (to) => {
    closeMenu();
    nav(to);
  };

  const openLogin = () => {
    closeMenu();

    if (typeof setShowLoginModal === "function") {
      setShowLoginModal(true);
    }
  };

  return (
    <aside
      className="
        fixed top-0 left-0 z-50 h-dvh
        w-[82%] max-w-[340px] md:w-[320px]
        bg-red-500 text-white shadow-2xl
        p-4 overflow-y-auto
      "
      role="dialog"
      aria-label="메뉴"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={closeMenu}
          className="px-2 py-2 -ml-2 text-sm font-bold"
        >
          GET OUT
        </button>

        {ready ? (
          !isLoggedIn ? (
            <button
              type="button"
              onClick={openLogin}
              className="text-sm font-extrabold underline"
            >
              LOGIN
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                logout();
                closeMenu();
              }}
              className="text-sm font-extrabold underline"
            >
              LOGOUT
            </button>
          )
        ) : null}
      </div>

      <nav className="mt-6 text-4xl font-bold space-y-8">
        <div className="space-y-1">
          <button type="button" onClick={() => go("/category/all")} className="block">
            ALL
          </button>
        </div>

        <div className="space-y-1 pl-3">
          <button type="button" onClick={() => go("/category/outer")} className="block">OUTER</button>
          <button type="button" onClick={() => go("/category/top")} className="block">TOP</button>
          <button type="button" onClick={() => go("/category/bottom")} className="block">BOTTOM</button>
          <button type="button" onClick={() => go("/category/acc")} className="block">ACC</button>
          <button type="button" onClick={() => go("/category/for-artist")} className="block">FOR-ARTIST</button>
        </div>

        <div className="space-y-1 text-2xl font-semibold">
          <button onClick={() => go("/look")} className="block">
            LOOK
          </button>

          <button onClick={() => go("/qna")} className="block">
            Q&amp;A
          </button>

          {ready && !isLoggedIn && (
            <button onClick={() => go("/guest-orders")} className="block">
              GUEST ORDER
            </button>
          )}

          {ready && isLoggedIn && (
            <button onClick={() => go("/mypage")} className="block">
              MY PAGE
            </button>
          )}

          {ready && isLoggedIn && isAdmin && (
            <button onClick={() => go("/admin")} className="block">
              ADMIN
            </button>
          )}
        </div>

        <a
          href="https://www.instagram.com/nothinkingarea/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2"
        >
          <FaInstagram size={30} />
        </a>
      </nav>
    </aside>
  );
}
