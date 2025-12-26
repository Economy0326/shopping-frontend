import { Link } from "react-router-dom";

export default function LookCard({ product }) {
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

      <div className="text-blakc text-center font-bold text-xl tracking-wide">
        <p className="truncate">{product.name}</p>
      </div>
      {/* LOOK에서는 가격 노출 X (원래 ProductCard도 look 카테고리는 안 보이게 되어 있어요) */}
    </Link>
  );
}
