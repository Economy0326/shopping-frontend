import { ToastContainer } from "react-toastify";
import HeaderUnified from "ui/components/HeaderUnified";
import Footer from "ui/components/Footer";

export default function LayoutWithImage({ children }) {
  return (
    <div className="min-h-dvh flex flex-col m-4 bg-white text-black">
      <HeaderUnified showLogo={true} />
      <main className="flex-1">{children}</main>
      <Footer />
      <ToastContainer />
    </div>
  );
}