/** Shown while lazy route chunks load. */
export function RoutePageFallback() {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-24"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-muted-foreground text-sm">Loading page…</p>
    </div>
  )
}
