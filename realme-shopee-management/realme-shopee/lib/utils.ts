import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns"
import { id as idLocale } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'dd MMM yyyy', { locale: idLocale })
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'dd MMM yyyy, HH:mm', { locale: idLocale })
  } catch {
    return dateString
  }
}

export function formatWeekRange(start: string, end: string): string {
  return `${formatDate(start)} – ${formatDate(end)}`
}

export function isOverdue(datetime: string): boolean {
  return isBefore(parseISO(datetime), new Date())
}

export function isDueSoon(datetime: string): boolean {
  const dueDate = parseISO(datetime)
  const now = new Date()
  const threeDaysLater = addDays(now, 3)
  return isAfter(dueDate, now) && isBefore(dueDate, threeDaysLater)
}

export function calculateROAS(revenue: number, adSpend: number): number {
  if (adSpend === 0) return 0
  return parseFloat((revenue / adSpend).toFixed(2))
}

export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0
  return parseFloat(((clicks / impressions) * 100).toFixed(2))
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
