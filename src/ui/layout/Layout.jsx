import HeaderUnified from "ui/components/HeaderUnified";
import Footer from "ui/components/Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-dvh bg-white text-black overflow-x-hidden">
      <HeaderUnified showLogo={false} />

      <div className="px-3 md:px-8 lg:px-12">
        <main className="min-h-[calc(100dvh-64px)] py-4 md:py-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
