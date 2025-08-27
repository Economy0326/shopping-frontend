import ProductGrid from "../components/ProductGrid";
import products from "../data/Product";

export default function LookPage() {
  const lookProducts = products.filter((p) => p.category === "look");

  return (
    <>
      {/* 제목 */}
      <header className="bg-white py-8 text-center">
        <h1 className="text-3xl xl:text-5xl font-bold text-red-500 uppercase tracking-wide">
          LOOK
        </h1>
      </header>

      {/* 메인 */}
      <main className="p-6 max-w-7xl mx-auto">
        {lookProducts.length > 0 ? (
          <ProductGrid products={lookProducts} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p>업소용</p>
          </div>
        )}
      </main>
    </>
  );
}
