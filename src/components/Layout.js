import { ToastContainer } from "react-toastify";
import Header from "./Header";

function Layout({
  children,
  isLoggedIn,
  setIsLoggedIn,
  username,
  setUsername,
}) {
  return (
    <div className="min-h-screen p-10 bg-white text-black">
      <Header
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

export default Layout;