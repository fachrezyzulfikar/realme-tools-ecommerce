export type Store = {
  id: string
  name: string
}

export type AdsReport = {
  id: string
  store_id: string
  store?: Store
  week_start: string
  week_end: string
  impressions: number
  products_sold: number
  clicks: number
  revenue: number
  ctr: number
  ad_spend: number
  orders: number
  roas: number
  best_roas_product_name: string
  best_roas_value: number
  lowest_conversion_product_name: string
  lowest_conversion_cost: number
  notes: string
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

export type Note = {
  id: string
  title: string
  type: string
  datetime: string
  tags: string[]
  participants: string[]
  content: string
  action_items: ActionItem[]
  additional_notes: string
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

export type Reminder = {
  id: string
  title: string
  type: string
  datetime: string
  tags: string[]
  participants: string[]
  content: string
  action_items: ActionItem[]
  additional_notes: string
  status: 'pending' | 'completed'
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

export type ActionItem = {
  id: string
  text: string
  completed: boolean
}

export type ActivityLog = {
  id: string
  table_name: string
  record_id: string
  action: 'create' | 'update' | 'delete'
  changed_by: string
  timestamp: string
  changes: Record<string, unknown>
  user_name?: string
}

export type User = {
  id: string
  email: string
  name: string
  created_at: string
}

export const STORES: Store[] = [
  { id: '1', name: 'Realme Surabaya' },
  { id: '2', name: 'Holyfon' },
  { id: '3', name: 'Devilmimi' },
  { id: '4', name: 'Optima' },
  { id: '5', name: 'Top Gadget' },
  { id: '6', name: 'Prime Gadget' },
  { id: '7', name: 'Storm Bytes' },
]

export const NOTE_TYPES = [
  'Rapat Tim',
  'Evaluasi Performa',
  'Strategi Iklan',
  'Diskusi Produk',
  'Review Mingguan',
  'Lainnya',
]

export const REMINDER_TYPES = [
  'Follow Up',
  'Deadline Laporan',
  'Update Iklan',
  'Evaluasi Toko',
  'Meeting',
  'Lainnya',
]
