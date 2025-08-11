import { NavLink, useParams } from "react-router-dom";
import products from "../data/Product";
import ProductGrid from "../components/ProductGrid";

export default function CategoryPage() {
  const { categoryName } = useParams();

  const categories = ["all", "outer", "top", "bottom", "acc", "for-artist"];

  const filtered =
    categoryName === "all"
      ? products
      : products.filter((p) => p.category === categoryName);

  return (
    <>
      <header>
        <div className="flex justify-between gap-2 xl:gap-4 w-full xl:w-4/5 mx-auto p-5 bg-white">
          {categories.map((cat) => (
            <NavLink
              key={cat}
              to={`/category/${cat}`}
              className={({ isActive }) =>
                `text-2xl xl:text-5xl font-bold uppercase mb-6 px-2 py-1 transition-colors duration-200 ${
                  isActive ? "text-white" : "text-red-500"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { WebkitTextStroke: "1px red" }
                  : {}
              }
            >
              {cat}
            </NavLink>
          ))}
        </div>
      </header>

      <main>
        {filtered.length === 0 ? (
          <h1 className="p-6">업소용</h1>
        ) : (
          <div className="p-6 max-w-7xl mx-auto">
            <ProductGrid products={filtered} />
          </div>
        )}
      </main>
    </>
  );
}
