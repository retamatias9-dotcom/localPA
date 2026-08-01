export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="aspect-square w-full animate-pulse bg-stone-200 dark:bg-stone-800" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
        <div className="h-3 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
        <div className="mt-2 h-6 w-1/2 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
      </div>
    </div>
  );
}
