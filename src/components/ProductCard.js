import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const hasPrice =
    typeof product.price === "number" && product.category !== "look";

  const cover =
    Array.isArray(product.images) && product.images.length
      ? product.images[0]
      : "";

  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="mb-2 rounded-2xl overflow-hidden">
        <img
          src={cover}
          alt={product.name}
          className="w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="text-center text-xl font-bold">
        <p className="truncate">{product.name}</p>
      </div>

      {/* 가격은 look이 아니고 price가 숫자일 때만 표시 */}
      {hasPrice && (
        <div className="text-center text-xl font-bold">
          {product.price.toLocaleString()} WON
        </div>
      )}
    </Link>
  );
}
