'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="glass-card rounded-2xl p-8 text-center max-w-md">
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <h2 className="text-lg font-display font-bold text-foreground mb-2">Terjadi Kesalahan</h2>
        <p className="text-sm text-muted-foreground mb-6">{error.message || 'Sesuatu yang tidak diharapkan terjadi.'}</p>
        <button onClick={reset} className="btn-primary mx-auto">
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    </div>
  )
}
