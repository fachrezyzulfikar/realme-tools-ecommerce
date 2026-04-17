'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, BarChart3, StickyNote, Bell, ChevronLeft, Menu, X,
  Zap, Store, LogOut, User, ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { STORES } from '@/lib/types'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/laporan-ads', icon: BarChart3, label: 'Laporan Ads' },
  { href: '/dashboard/catatan', icon: StickyNote, label: 'Catatan' },
  { href: '/dashboard/pengingat', icon: Bell, label: 'Pengingat' },
]

const STORE_COLORS: Record<string, string> = {
  'Realme Surabaya': 'bg-violet-500/20 text-violet-400',
  'Holyfon': 'bg-blue-500/20 text-blue-400',
  'Devilmimi': 'bg-rose-500/20 text-rose-400',
  'Optima': 'bg-amber-500/20 text-amber-400',
  'Top Gadget': 'bg-green-500/20 text-green-400',
  'Prime Gadget': 'bg-cyan-500/20 text-cyan-400',
  'Storm Bytes': 'bg-orange-500/20 text-orange-400',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const u = localStorage.getItem('rsms_user')
    if (!u) {
      router.push('/')
    } else {
      setUser(JSON.parse(u))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('rsms_user')
    router.push('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3 border-b border-border/50">
        <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.15)' }}>
          <Zap className="w-5 h-5 text-violet-400" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
            <div className="font-display font-bold text-sm text-foreground truncate">Realme Shopee</div>
            <div className="text-xs text-muted-foreground truncate">Surabaya</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sidebarOpen && (
          <div className="text-xs font-medium text-muted-foreground/50 uppercase tracking-wider px-3 mb-3">
            Navigasi
          </div>
        )}
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileSidebarOpen(false)}
            className={cn('sidebar-link', pathname === href && 'active')}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>{label}</span>}
          </Link>
        ))}

        {sidebarOpen && (
          <>
            <div className="text-xs font-medium text-muted-foreground/50 uppercase tracking-wider px-3 mb-3 mt-6">
              Toko
            </div>
            {STORES.map(store => (
              <div key={store.id} className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-xs',
                STORE_COLORS[store.name] || 'text-muted-foreground'
              )}>
                <Store className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{store.name}</span>
              </div>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      {user && (
        <div className="px-3 py-4 border-t border-border/50">
          <div
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
              'hover:bg-secondary/60 transition-colors duration-150 relative'
            )}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-violet-300">
                {user.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{user.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </>
            )}
          </div>

          {showUserMenu && sidebarOpen && (
            <div className="mt-1 glass-card rounded-lg overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col glass-card border-r border-border/50 transition-all duration-200 flex-shrink-0',
        sidebarOpen ? 'w-60' : 'w-16'
      )}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-20 -right-3 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 transition-colors z-10"
        >
          <ChevronLeft className={cn('w-3 h-3 text-muted-foreground transition-transform', !sidebarOpen && 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative w-64 glass-card border-r border-border/50 h-full">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border/50 glass-card">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-400" />
            <span className="font-display font-bold text-sm">Realme Shopee</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
