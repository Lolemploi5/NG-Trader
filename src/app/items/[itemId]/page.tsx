interface ItemPageProps {
  params: { itemId: string }
}

export default function ItemPage({ params }: ItemPageProps) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Item: {params.itemId}</h1>
      <div className="bg-muted rounded-lg p-6 text-muted-foreground">Graph + annonces groupées par prix (placeholder)</div>
    </div>
  );
}
