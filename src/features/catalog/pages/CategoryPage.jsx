import { NavLink, useParams } from "react-router-dom";
import products from "features/catalog/data/Product";
import ProductGrid from "features/catalog/components/ProductGrid";

export default function CategoryPage() {
  const { categoryName } = useParams();

  const categories = ["all", "outer", "top", "bottom", "acc", "for-artist"];

  const filtered =
    categoryName === "all"
      ? products.filter((p) => p.category !== "look")  
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
                `text-2xl xl:text-5xl font-bold uppercase mb-5 px-3 py-2 transition-colors duration-200 ${
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
          <div className="min-h-[50vh] grid place-items-center">
            <img
              src="/mood/nothing.png"
              alt="nothing"
              className="
                w-[320px] sm:w-[370px] md:w-[420px] xl:w-[470px] object-contain

                -translate-x-2 -translate-y-14
                sm:-translate-x-6 sm:-translate-y-12
                md:-translate-x-10 md:-translate-y-10
                xl:-translate-x-8 xl:-translate-y-20
              "
            />
          </div>
        ) : (
          <div className="p-6 max-w-7xl mx-auto">
            <ProductGrid products={filtered} />
          </div>
        )}
      </main>
    </>
  );
}
