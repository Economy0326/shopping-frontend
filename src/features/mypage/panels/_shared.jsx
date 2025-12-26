export function PanelShell({ title, children }) {
  return (
    <div className="overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="rounded">{children}</div>
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="rounded p-4 text-sm text-gray-600">{children}</div>
  );
}

export function OrdersTable({ columns, rows }) {
  // columns: [{ title, width, className }]
  // rows: array of <tr> children
  return (
    <table className="w-full min-w-[760px] text-sm table-fixed">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((c) => (
            <th
              key={c.title}
              className={`p-2 whitespace-nowrap ${c.className || ""}`}
              style={c.width ? { width: c.width } : undefined}
            >
              {c.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}
