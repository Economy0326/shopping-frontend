import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "features/auth/context/AuthContext";

const btnBase =
  "uppercase font-extrabold tracking-tight text-sm md:text-base " +
  "outline-none ring-0 [appearance:none] select-none";

const tapNone = { WebkitTapHighlightColor: "transparent" };

function TabLink({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/admin/orders"}
      style={tapNone}
      className={({ isActive }) =>
        `${btnBase} px-3 py-2 rounded-xl border ${
          isActive ? "bg-red-500 text-white border-red-500" : "bg-white text-red-500 border-red-500"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const nav = useNavigate();
  const { user } = useAuth();

  return (
    <main className="max-w-7xl mx-auto p-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="uppercase font-extrabold tracking-tight text-xl md:text-2xl">
            admin
          </h1>
          {user?.email && (
            <span className="text-xs text-gray-500">{user.email}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TabLink to="/admin/orders" label="orders" />
          <TabLink to="/admin/returns" label="returns" />
          <TabLink to="/admin/products" label="products" />
          <TabLink to="/admin/notices" label="notices" />
          <TabLink to="/admin/qna" label="qna" />
          <TabLink to="/admin/faq" label="faq" />

          <button
            type="button"
            className={`${btnBase} px-3 py-2 rounded-xl border border-black text-black`}
            onClick={() => nav("/")}
            style={tapNone}
          >
            home
          </button>
        </div>
      </header>

      <section className="min-h-[60vh]">
        <Outlet />
      </section>
    </main>
  );
}