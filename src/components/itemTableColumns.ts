import { ColumnDef } from "@tanstack/react-table";

export type Item = {
  id: string;
  name: string;
  category: string;
  price: number;
  trend: string;
  risk: string;
  dealScore: number;
};

export const itemColumns: ColumnDef<Item>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "price",
    header: "Price",
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
