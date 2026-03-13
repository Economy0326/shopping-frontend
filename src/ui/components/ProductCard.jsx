import { NavLink } from "react-router-dom";

function formatWon(n) {
  const v = Number(n) || 0;
  return v.toLocaleString() + "원";
}

export default function ProductCard({ product }) {
  const thumbnail =
    product?.thumbnailUrl || (Array.isArray(product?.images) && product.images[0]?.url) || "/mood/no-image.png";

  const price = typeof product?.price === "number" ? formatWon(product.price) : null;

  return (
    <article className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <NavLink to={`/product/${product.id}`} className="block">
        <div className="w-full aspect-square bg-gray-100 overflow-hidden">
          <img src={thumbnail} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate" title={product.name}>
            {product.name}
          </h3>
          {price && <div className="mt-2 font-bold text-base">{price}</div>}
        </div>
      </NavLink>
    </article>
  );
}
