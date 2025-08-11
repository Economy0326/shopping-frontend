import { useState } from "react";

const seedFaqs = [
  { q: "배송 기간은 얼마나 걸리나요?", a: "영업일 기준 2~3일 소요됩니다." },
  { q: "교환/반품 기준은?", a: "수령 후 7일 이내 가능하며 택 제거 시 불가합니다." },
];

export default function FaqPanel() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-6">
      <ul className="divide-y border rounded">
        {seedFaqs.map((f, idx) => (
          <li key={idx} className="p-3">
            <button
              className="w-full text-left font-medium flex justify-between"
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              {f.q}
              <span>{open === idx ? "−" : "+"}</span>
            </button>
            {open === idx && (
              <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{f.a}</div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
