'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, BarChart3, StickyNote, Bell,
  Store, ArrowRight, Clock, CheckCircle2, AlertCircle, Zap
} from 'lucide-react'
import { DUMMY_ADS_REPORTS, DUMMY_NOTES, DUMMY_REMINDERS } from '@/lib/dummy-data'
import { STORES } from '@/lib/types'
import { formatCurrency, formatNumber, formatDate, formatDateTime, isOverdue } from '@/lib/utils'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'

const STORE_COLORS: Record<string, string> = {
  'Realme Surabaya': '#8b5cf6',
  'Holyfon': '#3b82f6',
  'Devilmimi': '#ef4444',
  'Optima': '#f59e0b',
  'Top Gadget': '#10b981',
  'Prime Gadget': '#06b6d4',
  'Storm Bytes': '#f97316',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="text-xs font-medium">
            {p.name}: {typeof p.value === 'number' && p.value > 1000 ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string } | null>(null)

  useEffect(() => {
    const u = localStorage.getItem('rsms_user')
    if (u) setUser(JSON.parse(u))
  }, [])

  // Calculate summary stats
  const totalRevenue = DUMMY_ADS_REPORTS.reduce((s, r) => s + r.revenue, 0)
  const totalAdSpend = DUMMY_ADS_REPORTS.reduce((s, r) => s + r.ad_spend, 0)
  const avgROAS = DUMMY_ADS_REPORTS.reduce((s, r) => s + r.roas, 0) / DUMMY_ADS_REPORTS.length
  const totalOrders = DUMMY_ADS_REPORTS.reduce((s, r) => s + r.orders, 0)

  const pendingReminders = DUMMY_REMINDERS.filter(r => r.status === 'pending')
  const overdueCount = pendingReminders.filter(r => isOverdue(r.datetime)).length

  // Chart data
  const chartData = DUMMY_ADS_REPORTS.slice(0, 4).map(r => ({
    week: `${formatDate(r.week_start).slice(0, 6)}`,
    revenue: r.revenue,
    roas: r.roas,
    store: r.store?.name,
    spend: r.ad_spend,
  }))

  // Per-store summary
  const storeStats = STORES.map(store => {
    const reports = DUMMY_ADS_REPORTS.filter(r => r.store_id === store.id)
    if (reports.length === 0) return { store, reports: 0, revenue: 0, avgRoas: 0 }
    const revenue = reports.reduce((s, r) => s + r.revenue, 0)
    const avgRoas = reports.reduce((s, r) => s + r.roas, 0) / reports.length
    return { store, reports: reports.length, revenue, avgRoas }
  }).filter(s => s.reports > 0)

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">
            Selamat datang, {user?.name || 'Tim'} 👋
          </h1>
          <p className="page-subtitle">
            Ringkasan performa semua toko · Data demo
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground hidden md:block">
          <div>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Penjualan',
            value: formatCurrency(totalRevenue),
            sub: `dari ${DUMMY_ADS_REPORTS.length} laporan`,
            icon: TrendingUp,
            color: 'text-violet-400',
            bg: 'bg-violet-500/10',
            border: 'border-violet-500/20',
          },
          {
            label: 'Rata-rata ROAS',
            value: `${avgROAS.toFixed(2)}x`,
            sub: 'semua toko',
            icon: Zap,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
          },
          {
            label: 'Total Pesanan',
            value: formatNumber(totalOrders),
            sub: 'dari iklan',
            icon: BarChart3,
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20',
          },
          {
            label: 'Biaya Iklan',
            value: formatCurrency(totalAdSpend),
            sub: 'total pengeluaran',
            icon: TrendingDown,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
          },
        ].map((card, i) => (
          <div key={i} className={`metric-card animate-fade-in stagger-${i + 1}`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <div className="text-xl font-display font-bold text-foreground">{card.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
            <div className="text-xs text-muted-foreground/60 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card rounded-xl p-5 animate-fade-in stagger-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-foreground">Penjualan dari Iklan</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Tren per laporan mingguan</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}jt`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Penjualan" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5 animate-fade-in stagger-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-foreground">ROAS Trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Return on Ad Spend per laporan</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${v}x`} />
              <Tooltip content={<CustomTooltip />} />
              <Line dataKey="roas" name="ROAS" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store performance */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 animate-fade-in stagger-3">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-foreground">Performa per Toko</h3>
            <Link href="/dashboard/laporan-ads" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              Lihat semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {storeStats.map(({ store, reports, revenue, avgRoas }) => (
              <div key={store.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: STORE_COLORS[store.name] || '#8b5cf6' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">{store.name}</span>
                    <span className="text-sm font-mono text-foreground ml-2 flex-shrink-0">{formatCurrency(revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-muted-foreground">{reports} laporan</span>
                    <span className="text-xs text-amber-400">ROAS: {avgRoas.toFixed(1)}x</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links & reminders */}
        <div className="space-y-4">
          {/* Pengingat */}
          <div className="glass-card rounded-xl p-5 animate-fade-in stagger-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-foreground">Pengingat</h3>
              <Link href="/dashboard/pengingat" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                Lihat <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {overdueCount > 0 && (
              <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg mb-3">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400">{overdueCount} pengingat terlambat!</span>
              </div>
            )}
            <div className="space-y-2">
              {pendingReminders.slice(0, 3).map(r => (
                <div key={r.id} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs
                  ${isOverdue(r.datetime) ? 'bg-red-500/10 border border-red-500/20' : 'bg-secondary/30'}`}>
                  {isOverdue(r.datetime)
                    ? <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                    : <Clock className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  }
                  <div>
                    <div className="font-medium text-foreground">{r.title}</div>
                    <div className="text-muted-foreground mt-0.5">{formatDate(r.datetime)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent notes */}
          <div className="glass-card rounded-xl p-5 animate-fade-in stagger-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-foreground">Catatan Terbaru</h3>
              <Link href="/dashboard/catatan" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                Lihat <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {DUMMY_NOTES.slice(0, 2).map(n => (
                <div key={n.id} className="p-2.5 bg-secondary/30 rounded-lg">
                  <div className="text-xs font-medium text-foreground truncate">{n.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{formatDate(n.datetime)}</div>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {n.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs bg-violet-500/15 text-violet-400 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="copyright-footer">
        <p>© {new Date().getFullYear()} Realme Shopee Stores Management System · Surabaya</p>
        <p className="mt-0.5">Created by <span className="text-violet-400 font-medium">Fachrezy Zulfikar</span></p>
      </div>
    </div>
  )
}
