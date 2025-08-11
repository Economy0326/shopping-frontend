import { ToastContainer } from "react-toastify";
import HeaderWithLogo from "./HeaderWithLogo";

function LayoutWithImage({
  children,
  isLoggedIn,
  setIsLoggedIn,
  username,
  setUsername,
}) {
  return (
    <div className="min-h-screen p-10 bg-white text-black">
      <HeaderWithLogo
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        username={username}
        setUsername={setUsername}
      />

      <main>{children}</main>
      <ToastContainer />
    </div>
  );
}

export default LayoutWithImage;