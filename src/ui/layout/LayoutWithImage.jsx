import { ToastContainer } from "react-toastify";
import HeaderUnified from "ui/components/HeaderUnified";
import FooterLegal from "ui/components/FooterLegal";

export default function LayoutWithImage({ children }) {
  return (
    <div className="min-h-dvh flex flex-col m-4 bg-white text-black">
      <HeaderUnified showLogo={true} />
      <main className="flex-1">{children}</main>
      <FooterLegal />
      <ToastContainer />
    </div>
  );
}