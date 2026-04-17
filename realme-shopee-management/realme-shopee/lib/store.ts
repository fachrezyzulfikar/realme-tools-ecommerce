import { create } from 'zustand'
import { AdsReport, Note, Reminder, Store } from './types'
import { DUMMY_ADS_REPORTS, DUMMY_NOTES, DUMMY_REMINDERS } from './dummy-data'
import { STORES } from './types'

interface AppState {
  // User
  user: { id: string; name: string; email: string } | null
  setUser: (user: AppState['user']) => void

  // Stores
  stores: Store[]

  // Ads Reports
  adsReports: AdsReport[]
  setAdsReports: (reports: AdsReport[]) => void
  addAdsReport: (report: AdsReport) => void
  updateAdsReport: (id: string, report: AdsReport) => void
  deleteAdsReport: (id: string) => void

  // Notes
  notes: Note[]
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, note: Note) => void
  deleteNote: (id: string) => void

  // Reminders
  reminders: Reminder[]
  setReminders: (reminders: Reminder[]) => void
  addReminder: (reminder: Reminder) => void
  updateReminder: (id: string, reminder: Reminder) => void
  deleteReminder: (id: string) => void

  // UI State
  selectedStoreId: string
  setSelectedStoreId: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  stores: STORES,

  adsReports: DUMMY_ADS_REPORTS,
  setAdsReports: (adsReports) => set({ adsReports }),
  addAdsReport: (report) => set((s) => ({ adsReports: [report, ...s.adsReports] })),
  updateAdsReport: (id, report) => set((s) => ({
    adsReports: s.adsReports.map(r => r.id === id ? report : r)
  })),
  deleteAdsReport: (id) => set((s) => ({
    adsReports: s.adsReports.filter(r => r.id !== id)
  })),

  notes: DUMMY_NOTES,
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
  updateNote: (id, note) => set((s) => ({
    notes: s.notes.map(n => n.id === id ? note : n)
  })),
  deleteNote: (id) => set((s) => ({
    notes: s.notes.filter(n => n.id !== id)
  })),

  reminders: DUMMY_REMINDERS,
  setReminders: (reminders) => set({ reminders }),
  addReminder: (r) => set((s) => ({ reminders: [r, ...s.reminders] })),
  updateReminder: (id, r) => set((s) => ({
    reminders: s.reminders.map(x => x.id === id ? r : x)
  })),
  deleteReminder: (id) => set((s) => ({
    reminders: s.reminders.filter(r => r.id !== id)
  })),

  selectedStoreId: 'all',
  setSelectedStoreId: (id) => set({ selectedStoreId: id }),
}))
