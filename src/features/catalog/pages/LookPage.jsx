//룩 카테고리 페이지
import LookGrid from "features/catalog/components/look/LookGrid";
import products from "features/catalog/data/Product";

export default function LookPage() {
  const lookProducts = products.filter((p) => p.category === "look");

  return (
    <>
      <header className="bg-white py-8 text-center">
        <h1 className={`relative sm:-translate-x-1 md:-translate-x-1 xl:-translate-x-1 text-red-500 
                      text-4xl xl:text-5xl font-bold uppercase px-2 sm:-translate-y-2`}>
          LOOK
        </h1>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {lookProducts.length > 0 ? (
          <LookGrid products={lookProducts} />
        ) : (
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
        )}
      </main>
    </>
  );
}
