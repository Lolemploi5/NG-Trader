import { useMemo } from "react";
import { useTable, Column } from "@tanstack/react-table";
import { columns, Signal } from "../components/signalsTableColumns";

const mockSignals: Signal[] = [
  { id: "1", item: "Diamant", trend: "Up", risk: "Low", dealScore: 92 },
  { id: "2", item: "Fer", trend: "Down", risk: "High", dealScore: 45 },
  { id: "3", item: "Or", trend: "Stable", risk: "Medium", dealScore: 67 },
];

export default function SignalsTable() {
  // TanStack Table v8 (shadcn DataTable)
  const table = useTable({
    data: mockSignals,
    columns,
  });

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <table className="min-w-full divide-y divide-zinc-200">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.accessorKey as string} className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">
                {col.header as string}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockSignals.map((signal) => (
            <tr key={signal.id} className="hover:bg-muted">
              <td className="px-4 py-2">{signal.item}</td>
              <td className="px-4 py-2">{signal.trend}</td>
              <td className="px-4 py-2">{signal.risk}</td>
              <td className="px-4 py-2">{signal.dealScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
