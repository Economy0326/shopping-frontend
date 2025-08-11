import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="mb-2">
        <img src={product.image} alt={product.name} className="w-full object-cover" />
      </div>
      <div className="text-center text-lg font-bold">
        <p className="truncate w-60">{product.name}</p>
      </div>
      <div className="text-center text-lg font-bold">
        {product.price.toLocaleString()}WON
      </div>
    </Link>
  );
}