export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        <p className="text-sm text-muted-foreground">Memuat data...</p>
      </div>
    </div>
  )
}
