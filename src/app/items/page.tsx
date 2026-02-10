export default function ItemsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Item Explorer</h1>
      <div className="mb-6">
        <ItemTable />
      </div>
    </div>
  );
}
