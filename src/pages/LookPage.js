import ProductGrid from "../components/ProductGrid";
import products from "../data/Product";

export default function LookPage() {
  const lookProducts = products.filter((p) => p.category === "look");

  return (
    <>
      <header className="bg-white p-6 text-center">
        <h1 className="text-3xl xl:text-5xl font-bold text-red-500 uppercase">LOOK</h1>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {lookProducts.length > 0 ? (
          <ProductGrid products={lookProducts} />
        ) : (
          <div className="text-center text-gray-500">
            업소용
          </div>
        )}
      </main>
    </>
  );
}
