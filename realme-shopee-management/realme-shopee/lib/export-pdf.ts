/**
 * PDF Export Utility for Laporan Ads
 * Uses jsPDF + jsPDF-AutoTable
 * 
 * Created by Fachrezy Zulfikar
 */

import { AdsReport } from './types'
import { formatCurrency, formatNumber, formatWeekRange } from './utils'

export async function exportAdsReportsToPDF(reports: AdsReport[], title = 'Laporan Ads') {
  // Dynamic import to avoid SSR issues
  const jsPDF = (await import('jspdf')).default
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Header
  doc.setFillColor(26, 26, 46)
  doc.rect(0, 0, 297, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Realme Shopee Stores Management', 14, 18)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(167, 139, 250)
  doc.text(title, 14, 28)

  doc.setTextColor(148, 163, 184)
  doc.setFontSize(9)
  doc.text(`Diekspor: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 36)

  // Summary stats
  const totalRevenue = reports.reduce((s, r) => s + r.revenue, 0)
  const totalSpend = reports.reduce((s, r) => s + r.ad_spend, 0)
  const avgROAS = reports.length > 0 ? reports.reduce((s, r) => s + r.roas, 0) / reports.length : 0
  const totalOrders = reports.reduce((s, r) => s + r.orders, 0)

  const summaryY = 48
  const summaryData = [
    ['Total Penjualan', formatCurrency(totalRevenue)],
    ['Total Biaya Iklan', formatCurrency(totalSpend)],
    ['Rata-rata ROAS', `${avgROAS.toFixed(2)}x`],
    ['Total Pesanan', formatNumber(totalOrders)],
  ]

  doc.setTextColor(30, 30, 60)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Ringkasan Performa', 14, summaryY)

  autoTable(doc, {
    startY: summaryY + 4,
    head: [],
    body: summaryData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, fillColor: [245, 245, 255] },
      1: { cellWidth: 50 },
    },
    margin: { left: 14, right: 14 },
    tableWidth: 100,
  })

  // Main table
  const tableY = (doc as any).lastAutoTable.finalY + 10

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 60)
  doc.text('Detail Laporan Mingguan', 14, tableY)

  const tableRows = reports.map(r => [
    r.store?.name || '-',
    formatWeekRange(r.week_start, r.week_end),
    formatCurrency(r.revenue),
    formatCurrency(r.ad_spend),
    `${r.roas.toFixed(2)}x`,
    formatNumber(r.orders),
    formatNumber(r.clicks),
    `${r.ctr.toFixed(2)}%`,
    formatNumber(r.impressions),
  ])

  autoTable(doc, {
    startY: tableY + 4,
    head: [['Toko', 'Periode', 'Penjualan', 'Biaya Iklan', 'ROAS', 'Pesanan', 'Klik', 'CTR', 'Impresi']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [139, 92, 246],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 248, 255] },
    margin: { left: 14, right: 14 },
    styles: { overflow: 'linebreak', cellPadding: 3 },
  })

  // Notes per report
  const notesY = (doc as any).lastAutoTable.finalY + 10

  const reportsWithNotes = reports.filter(r => r.notes)
  if (reportsWithNotes.length > 0) {
    doc.addPage()
    doc.setFillColor(26, 26, 46)
    doc.rect(0, 0, 297, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Catatan & Insight per Laporan', 14, 13)

    let y = 30
    reportsWithNotes.forEach(r => {
      if (y > 180) {
        doc.addPage()
        y = 20
      }
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 60)
      doc.text(`${r.store?.name} — ${formatWeekRange(r.week_start, r.week_end)}`, 14, y)

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 100)
      doc.setFontSize(9)

      const lines = doc.splitTextToSize(r.notes, 265)
      doc.text(lines, 14, y + 5)
      y += 12 + (lines.length * 4.5)
    })
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 170)
    doc.text(
      `© ${new Date().getFullYear()} Realme Shopee Stores Management · Dibuat oleh Fachrezy Zulfikar`,
      14,
      doc.internal.pageSize.height - 8
    )
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 8
    )
  }

  const fileName = `laporan-ads-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(fileName)
  return fileName
}
