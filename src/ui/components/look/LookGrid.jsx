import LookCard from "ui/components/look/LookCard";

export default function LookGrid({ products }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5">
      {products.map((p) => (
        <LookCard key={p.id} product={p} />
      ))}
    </div>
  );
}
