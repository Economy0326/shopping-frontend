import { FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function SideMenu({ setShowMenu }) {
  return (
    <div className="fixed top-0 left-0 w-full sm:w-2/5 md:w-1/3 lg:w-1/5 h-full bg-red-500 text-white shadow-lg z-50 p-4 transition-transform">
      <button onClick={() => setShowMenu(false)} className="mb-4 ml-[1px]">
        <h2 className="text-sm font-bold">GET OUT</h2>
      </button>
      <nav className="text-4xl font-bold">
        <ul className="space-y-1 mb-12">
          <li><Link to="/category/all">ALL</Link></li>
        </ul>
        <div className="ml-3">
          <ul className="space-y-1 mb-12">
            <li><Link to="/category/outer">OUTER</Link></li>
            <li><Link to="/category/top">TOP</Link></li>
            <li><Link to="/category/bottom">BOTTOM</Link></li>
            <li><Link to="/category/acc">ACC</Link></li>
            <li><Link to="/category/for-artist">FOR-ARTIST</Link></li>
          </ul>
        </div>
        <ul className="space-y-1 mb-8">
          <li><Link to="/look">LOOK</Link></li>
        </ul>
        <ul className="space-y-1">
          <li>
            <a
              href="https://www.instagram.com/nothinkingarea/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <FaInstagram size={30} />
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}