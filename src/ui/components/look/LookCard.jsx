import { Link } from "react-router-dom";

export default function LookCard({ product }) {
  const cover =
    product?.thumbnailUrl ||
    (Array.isArray(product?.images) && typeof product.images[0] === "string"
      ? product.images[0]
      : null) ||
    (Array.isArray(product?.images) && product.images[0]?.url
      ? product.images[0].url
      : null) ||
    "/mood/no-image.png";

  return (
    <Link to={`/look/${product.id}`} className="block group">
      <div className="aspect-[3/4] overflow-hidden bg-gray-100">
        {cover ? (
          <img
            src={cover}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="mt-2 text-sm font-semibold">{product.name}</div>
    </Link>
  );
}