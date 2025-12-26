import ProductCard from "ui/components/ProductCard";

export default function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
