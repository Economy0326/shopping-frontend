import { ToastContainer } from "react-toastify";
import HeaderWithLogo from "./HeaderWithLogo";
import FooterLegal from "./FooterLegal";

function LayoutWithImage({
  children,
  isLoggedIn,
  setIsLoggedIn,
  username,
  setUsername,
}) {
  return (
    <div className="min-h-dvh flex flex-col m-4 bg-white text-black">
      <HeaderWithLogo
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        username={username}
        setUsername={setUsername}
      />

      <main className="flex-1 ">{children}</main>

      <FooterLegal />
      <ToastContainer />
    </div>
  );
}

export default LayoutWithImage;