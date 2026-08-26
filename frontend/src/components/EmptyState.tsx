export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-sm text-gray-500">
      {message}
    </div>
  );
}
