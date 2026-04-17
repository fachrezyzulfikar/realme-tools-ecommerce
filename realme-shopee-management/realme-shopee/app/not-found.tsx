import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl font-display font-black text-violet-500/20 mb-4">404</div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Halaman tidak ditemukan</h1>
        <p className="text-muted-foreground mb-6">Halaman yang kamu cari tidak ada.</p>
        <Link href="/dashboard" className="btn-primary inline-flex">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}
