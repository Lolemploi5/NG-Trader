import { ColumnDef } from "@tanstack/react-table";

export type Signal = {
  id: string;
  item: string;
  trend: string;
  risk: string;
  dealScore: number;
};

export const columns: ColumnDef<Signal>[] = [
  {
    accessorKey: "item",
    header: "Item",
  },
  {
    accessorKey: "trend",
    header: "Trend",
  },
  {
    accessorKey: "risk",
    header: "Risk",
  },
  {
    accessorKey: "dealScore",
    header: "Deal Score",
  },
];
