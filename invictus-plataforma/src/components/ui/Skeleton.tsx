/** Placeholder exibido enquanto a listagem recalcula ou a API responde. */
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="skel aspect-[4/3] w-full" />
      <div className="space-y-2.5 p-4">
        <div className="skel h-4 w-3/5 rounded" />
        <div className="skel h-3 w-2/5 rounded" />
        <div className="skel h-5 w-1/3 rounded" />
        <div className="skel h-3 w-full rounded" />
      </div>
    </div>
  );
}

export function GridSkeleton({ quantidade = 6 }: { quantidade?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: quantidade }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
