'use client'

import { useState, useMemo } from 'react'
import {
  Plus, Search, Filter, Edit2, Trash2, FileText, X, ChevronDown,
  TrendingUp, BarChart3, Eye, MousePointer, ShoppingCart, 
  Zap, Star, Download, Clock
} from 'lucide-react'
import { DUMMY_ADS_REPORTS } from '@/lib/dummy-data'
import { STORES, AdsReport } from '@/lib/types'
import {
  formatCurrency, formatNumber, formatWeekRange, formatDateTime,
  calculateROAS, calculateCTR, generateId
} from '@/lib/utils'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  store_id: '',
  week_start: '',
  week_end: '',
  impressions: '',
  products_sold: '',
  clicks: '',
  revenue: '',
  ctr: '',
  ad_spend: '',
  orders: '',
  roas: '',
  best_roas_product_name: '',
  best_roas_value: '',
  lowest_conversion_product_name: '',
  lowest_conversion_cost: '',
  notes: '',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.value > 1000 ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function LaporanAdsPage() {
  const [reports, setReports] = useState<AdsReport[]>(DUMMY_ADS_REPORTS)
  const [selectedStore, setSelectedStore] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingReport, setEditingReport] = useState<AdsReport | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [activeView, setActiveView] = useState<'table' | 'charts'>('table')
  const [selectedReport, setSelectedReport] = useState<AdsReport | null>(null)

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const storeMatch = selectedStore === 'all' || r.store_id === selectedStore
      const searchMatch = !searchQuery || 
        r.store?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.notes.toLowerCase().includes(searchQuery.toLowerCase())
      return storeMatch && searchMatch
    })
  }, [reports, selectedStore, searchQuery])

  // Summary for filtered
  const summary = useMemo(() => ({
    totalRevenue: filteredReports.reduce((s, r) => s + r.revenue, 0),
    totalSpend: filteredReports.reduce((s, r) => s + r.ad_spend, 0),
    avgROAS: filteredReports.length > 0 
      ? filteredReports.reduce((s, r) => s + r.roas, 0) / filteredReports.length 
      : 0,
    totalOrders: filteredReports.reduce((s, r) => s + r.orders, 0),
    totalImpressions: filteredReports.reduce((s, r) => s + r.impressions, 0),
  }), [filteredReports])

  // Chart data
  const chartData = filteredReports.map(r => ({
    week: formatWeekRange(r.week_start, r.week_end).slice(0, 12),
    ROAS: r.roas,
    Penjualan: r.revenue,
    Klik: r.clicks,
    Pesanan: r.orders,
    store: r.store?.name,
  }))

  const openCreate = () => {
    setEditingReport(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (report: AdsReport) => {
    setEditingReport(report)
    setForm({
      store_id: report.store_id,
      week_start: report.week_start,
      week_end: report.week_end,
      impressions: String(report.impressions),
      products_sold: String(report.products_sold),
      clicks: String(report.clicks),
      revenue: String(report.revenue),
      ctr: String(report.ctr),
      ad_spend: String(report.ad_spend),
      orders: String(report.orders),
      roas: String(report.roas),
      best_roas_product_name: report.best_roas_product_name,
      best_roas_value: String(report.best_roas_value),
      lowest_conversion_product_name: report.lowest_conversion_product_name,
      lowest_conversion_cost: String(report.lowest_conversion_cost),
      notes: report.notes,
    })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id))
    toast.success('Laporan berhasil dihapus')
    if (selectedReport?.id === id) setSelectedReport(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const store = STORES.find(s => s.id === form.store_id)
    const revenue = parseFloat(form.revenue) || 0
    const adSpend = parseFloat(form.ad_spend) || 0
    const clicks = parseFloat(form.clicks) || 0
    const impressions = parseFloat(form.impressions) || 0

    const reportData: AdsReport = {
      id: editingReport?.id || generateId(),
      store_id: form.store_id,
      store,
      week_start: form.week_start,
      week_end: form.week_end,
      impressions: impressions,
      products_sold: parseFloat(form.products_sold) || 0,
      clicks,
      revenue,
      ctr: form.ctr ? parseFloat(form.ctr) : calculateCTR(clicks, impressions),
      ad_spend: adSpend,
      orders: parseFloat(form.orders) || 0,
      roas: form.roas ? parseFloat(form.roas) : calculateROAS(revenue, adSpend),
      best_roas_product_name: form.best_roas_product_name,
      best_roas_value: parseFloat(form.best_roas_value) || 0,
      lowest_conversion_product_name: form.lowest_conversion_product_name,
      lowest_conversion_cost: parseFloat(form.lowest_conversion_cost) || 0,
      notes: form.notes,
      created_by: 'user-1',
      updated_by: 'user-1',
      created_at: editingReport?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (editingReport) {
      setReports(prev => prev.map(r => r.id === editingReport.id ? reportData : r))
      toast.success('Laporan berhasil diperbarui')
    } else {
      setReports(prev => [reportData, ...prev])
      toast.success('Laporan baru berhasil dibuat')
    }
    setShowModal(false)
  }

  const handleExportPDF = () => {
    toast.success('Fitur export PDF siap diintegrasikan dengan jsPDF')
  }

  const F = ({ label, value, onChange, type = 'number', placeholder = '' }: any) => (
    <div>
      <label className="label-text">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="input-field"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-violet-400" />
            Laporan Ads
          </h1>
          <p className="page-subtitle">{reports.length} laporan tersedia · Data Shopee Ads</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleExportPDF} className="btn-secondary">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" />
            Buat Laporan
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total Penjualan', value: formatCurrency(summary.totalRevenue), icon: TrendingUp, color: 'text-violet-400' },
          { label: 'Total Biaya Iklan', value: formatCurrency(summary.totalSpend), icon: Zap, color: 'text-red-400' },
          { label: 'Rata-rata ROAS', value: `${summary.avgROAS.toFixed(2)}x`, icon: Star, color: 'text-amber-400' },
          { label: 'Total Pesanan', value: formatNumber(summary.totalOrders), icon: ShoppingCart, color: 'text-green-400' },
          { label: 'Total Impresi', value: formatNumber(summary.totalImpressions), icon: Eye, color: 'text-blue-400' },
        ].map((s, i) => (
          <div key={i} className="metric-card">
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <div className="text-base font-display font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + View Toggle */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari laporan..."
            className="input-field pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="input-field md:w-52"
          value={selectedStore}
          onChange={e => setSelectedStore(e.target.value)}
        >
          <option value="all">Semua Toko</option>
          {STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex bg-secondary rounded-lg p-1">
          <button
            onClick={() => setActiveView('table')}
            className={`px-3 py-1.5 rounded-md text-sm transition-all ${activeView === 'table' ? 'bg-violet-600 text-white' : 'text-muted-foreground'}`}
          >
            Tabel
          </button>
          <button
            onClick={() => setActiveView('charts')}
            className={`px-3 py-1.5 rounded-md text-sm transition-all ${activeView === 'charts' ? 'bg-violet-600 text-white' : 'text-muted-foreground'}`}
          >
            Grafik
          </button>
        </div>
      </div>

      {activeView === 'charts' ? (
        /* Charts View */
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">ROAS per Minggu</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${v}x`} />
                <Tooltip content={<CustomTooltip />} />
                <Line dataKey="ROAS" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-display font-semibold text-foreground mb-4">Penjualan dari Iklan</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v / 1e6).toFixed(0)}jt`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Penjualan" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h3 className="font-display font-semibold text-foreground mb-4">Klik vs Pesanan</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Klik" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pesanan" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Toko</th>
                  <th>Periode</th>
                  <th className="text-right">Penjualan</th>
                  <th className="text-right">Biaya Iklan</th>
                  <th className="text-right">ROAS</th>
                  <th className="text-right">Pesanan</th>
                  <th className="text-right">CTR</th>
                  <th className="text-right">Impresi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>Belum ada laporan</p>
                    </td>
                  </tr>
                ) : filteredReports.map(report => (
                  <tr key={report.id} className="cursor-pointer" onClick={() => setSelectedReport(report)}>
                    <td>
                      <span className="font-medium text-foreground">{report.store?.name}</span>
                    </td>
                    <td className="text-muted-foreground text-xs">
                      {formatWeekRange(report.week_start, report.week_end)}
                    </td>
                    <td className="text-right font-mono text-sm">{formatCurrency(report.revenue)}</td>
                    <td className="text-right font-mono text-sm text-red-400">{formatCurrency(report.ad_spend)}</td>
                    <td className="text-right">
                      <span className={`font-bold text-sm ${report.roas >= 10 ? 'text-green-400' : report.roas >= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                        {report.roas.toFixed(2)}x
                      </span>
                    </td>
                    <td className="text-right font-mono text-sm">{formatNumber(report.orders)}</td>
                    <td className="text-right text-sm text-muted-foreground">{report.ctr.toFixed(2)}%</td>
                    <td className="text-right text-sm text-muted-foreground">{formatNumber(report.impressions)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(report)} className="p-1.5 rounded-lg hover:bg-violet-500/20 text-violet-400 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(report.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {selectedReport && (
        <div className="mt-6 glass-card rounded-xl p-6 animate-fade-in">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-foreground text-lg">{selectedReport.store?.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{formatWeekRange(selectedReport.week_start, selectedReport.week_end)}</p>
            </div>
            <button onClick={() => setSelectedReport(null)} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Penjualan', value: formatCurrency(selectedReport.revenue) },
              { label: 'Biaya Iklan', value: formatCurrency(selectedReport.ad_spend) },
              { label: 'ROAS', value: `${selectedReport.roas.toFixed(2)}x` },
              { label: 'Pesanan', value: formatNumber(selectedReport.orders) },
              { label: 'Impresi', value: formatNumber(selectedReport.impressions) },
              { label: 'Klik', value: formatNumber(selectedReport.clicks) },
              { label: 'CTR', value: `${selectedReport.ctr.toFixed(2)}%` },
              { label: 'Produk Terjual', value: formatNumber(selectedReport.products_sold) },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-secondary/30 rounded-lg">
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="text-sm font-medium text-foreground mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="text-xs text-amber-400 font-medium mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" /> Produk ROAS Tertinggi
              </div>
              <div className="text-sm font-medium text-foreground">{selectedReport.best_roas_product_name}</div>
              <div className="text-sm text-amber-400 mt-0.5">ROAS: {selectedReport.best_roas_value.toFixed(1)}x</div>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-xs text-green-400 font-medium mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Biaya Konversi Terendah
              </div>
              <div className="text-sm font-medium text-foreground">{selectedReport.lowest_conversion_product_name}</div>
              <div className="text-sm text-green-400 mt-0.5">{formatCurrency(selectedReport.lowest_conversion_cost)}</div>
            </div>
          </div>

          {selectedReport.notes && (
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="text-xs text-muted-foreground font-medium mb-2">Catatan & Insight</div>
              <div className="text-sm text-foreground whitespace-pre-wrap">{selectedReport.notes}</div>
            </div>
          )}

          <div className="mt-3 text-xs text-muted-foreground/50 flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Dibuat: {formatDateTime(selectedReport.created_at)}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-foreground">
                {editingReport ? 'Edit Laporan' : 'Buat Laporan Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Store & Week */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label-text">Toko</label>
                  <select className="input-field" value={form.store_id} onChange={e => setForm({ ...form, store_id: e.target.value })} required>
                    <option value="">Pilih toko</option>
                    {STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Mulai Minggu</label>
                  <input type="date" className="input-field" value={form.week_start} onChange={e => setForm({ ...form, week_start: e.target.value })} required />
                </div>
                <div>
                  <label className="label-text">Akhir Minggu</label>
                  <input type="date" className="input-field" value={form.week_end} onChange={e => setForm({ ...form, week_end: e.target.value })} required />
                </div>
              </div>

              {/* Performance metrics */}
              <div>
                <div className="text-xs font-medium text-violet-400 uppercase tracking-wider mb-3">Performa Iklan</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <F label="Iklan Dilihat" value={form.impressions} onChange={(v: string) => setForm({ ...form, impressions: v })} />
                  <F label="Jumlah Klik" value={form.clicks} onChange={(v: string) => setForm({ ...form, clicks: v })} />
                  <F label="Pesanan" value={form.orders} onChange={(v: string) => setForm({ ...form, orders: v })} />
                  <F label="Produk Terjual" value={form.products_sold} onChange={(v: string) => setForm({ ...form, products_sold: v })} />
                </div>
              </div>

              {/* Finance */}
              <div>
                <div className="text-xs font-medium text-violet-400 uppercase tracking-wider mb-3">Finansial</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <F label="Penjualan (Rp)" value={form.revenue} onChange={(v: string) => setForm({ ...form, revenue: v })} />
                  <F label="Biaya Iklan (Rp)" value={form.ad_spend} onChange={(v: string) => setForm({ ...form, ad_spend: v })} />
                  <div>
                    <label className="label-text">CTR (%) <span className="text-muted-foreground normal-case font-normal">auto</span></label>
                    <input type="number" step="0.01" className="input-field" placeholder="Auto-hitung" value={form.ctr} onChange={e => setForm({ ...form, ctr: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-text">ROAS <span className="text-muted-foreground normal-case font-normal">auto</span></label>
                    <input type="number" step="0.01" className="input-field" placeholder="Auto-hitung" value={form.roas} onChange={e => setForm({ ...form, roas: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Best products */}
              <div>
                <div className="text-xs font-medium text-violet-400 uppercase tracking-wider mb-3">Produk Terbaik</div>
                <div className="grid grid-cols-2 gap-3">
                  <F label="Produk ROAS Tertinggi" value={form.best_roas_product_name} onChange={(v: string) => setForm({ ...form, best_roas_product_name: v })} type="text" placeholder="Nama produk" />
                  <F label="ROAS Tertinggi" value={form.best_roas_value} onChange={(v: string) => setForm({ ...form, best_roas_value: v })} />
                  <F label="Produk Konversi Terendah" value={form.lowest_conversion_product_name} onChange={(v: string) => setForm({ ...form, lowest_conversion_product_name: v })} type="text" placeholder="Nama produk" />
                  <F label="Biaya Konversi (Rp)" value={form.lowest_conversion_cost} onChange={(v: string) => setForm({ ...form, lowest_conversion_cost: v })} />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="label-text">Catatan & Insight</label>
                <textarea
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Perubahan modal iklan harian, perubahan strategi (GMV Max Auto, GMV Max ROAS, dll), insight penyebab naik/turun..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center">
                  {editingReport ? 'Simpan Perubahan' : 'Buat Laporan'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="copyright-footer">
        <p>© {new Date().getFullYear()} Realme Shopee Stores Management System · Surabaya</p>
        <p className="mt-0.5">Created by <span className="text-violet-400 font-medium">Fachrezy Zulfikar</span></p>
      </div>
    </div>
  )
}
