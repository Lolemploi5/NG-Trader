import { itemColumns, Item } from "../components/itemTableColumns";

const mockItems: Item[] = [
  { id: "1", name: "Diamant", category: "Minerai", price: 120, trend: "Up", risk: "Low", dealScore: 90 },
  { id: "2", name: "Fer", category: "Minerai", price: 30, trend: "Down", risk: "High", dealScore: 40 },
  { id: "3", name: "Or", category: "Minerai", price: 80, trend: "Stable", risk: "Medium", dealScore: 65 },
];

export default function ItemTable() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <table className="min-w-full divide-y divide-zinc-200">
        <thead>
          <tr>
            {itemColumns.map((col) => (
              <th key={col.accessorKey as string} className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">
                {col.header as string}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockItems.map((item) => (
            <tr key={item.id} className="hover:bg-muted">
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2">{item.category}</td>
              <td className="px-4 py-2">{item.price}</td>
              <td className="px-4 py-2">{item.trend}</td>
              <td className="px-4 py-2">{item.risk}</td>
              <td className="px-4 py-2">{item.dealScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
