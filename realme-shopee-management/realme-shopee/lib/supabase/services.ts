/**
 * Supabase Data Services
 * Replace dummy data imports with these functions when Supabase is configured.
 * 
 * Created by Fachrezy Zulfikar
 */

import { supabase } from './client'
import { AdsReport, Note, Reminder, ActivityLog } from '../types'

// ─────────────────────────────────────────────────────────────
// ADS REPORTS
// ─────────────────────────────────────────────────────────────

export async function getAdsReports(storeId?: string) {
  let query = supabase
    .from('ads_reports')
    .select('*, store:stores(id, name)')
    .order('week_start', { ascending: false })

  if (storeId && storeId !== 'all') {
    query = query.eq('store_id', storeId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as AdsReport[]
}

export async function createAdsReport(report: Omit<AdsReport, 'id' | 'created_at' | 'updated_at' | 'store'>, userId: string) {
  const { data, error } = await supabase
    .from('ads_reports')
    .insert({ ...report, created_by: userId, updated_by: userId })
    .select('*, store:stores(id, name)')
    .single()

  if (error) throw error

  await logActivity('ads_reports', data.id, 'create', userId, {})
  return data as AdsReport
}

export async function updateAdsReport(id: string, updates: Partial<AdsReport>, userId: string) {
  const { data, error } = await supabase
    .from('ads_reports')
    .update({ ...updates, updated_by: userId })
    .eq('id', id)
    .select('*, store:stores(id, name)')
    .single()

  if (error) throw error

  await logActivity('ads_reports', id, 'update', userId, updates)
  return data as AdsReport
}

export async function deleteAdsReport(id: string, userId: string) {
  const { error } = await supabase.from('ads_reports').delete().eq('id', id)
  if (error) throw error
  await logActivity('ads_reports', id, 'delete', userId, {})
}

// ─────────────────────────────────────────────────────────────
// NOTES
// ─────────────────────────────────────────────────────────────

export async function getNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Note[]
}

export async function createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>, userId: string) {
  const { data, error } = await supabase
    .from('notes')
    .insert({ ...note, created_by: userId, updated_by: userId })
    .select()
    .single()

  if (error) throw error
  await logActivity('notes', data.id, 'create', userId, {})
  return data as Note
}

export async function updateNote(id: string, updates: Partial<Note>, userId: string) {
  const { data, error } = await supabase
    .from('notes')
    .update({ ...updates, updated_by: userId })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  await logActivity('notes', id, 'update', userId, updates)
  return data as Note
}

export async function deleteNote(id: string, userId: string) {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
  await logActivity('notes', id, 'delete', userId, {})
}

// ─────────────────────────────────────────────────────────────
// REMINDERS
// ─────────────────────────────────────────────────────────────

export async function getReminders() {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .order('datetime', { ascending: true })

  if (error) throw error
  return data as Reminder[]
}

export async function createReminder(reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>, userId: string) {
  const { data, error } = await supabase
    .from('reminders')
    .insert({ ...reminder, created_by: userId, updated_by: userId })
    .select()
    .single()

  if (error) throw error
  await logActivity('reminders', data.id, 'create', userId, {})
  return data as Reminder
}

export async function updateReminder(id: string, updates: Partial<Reminder>, userId: string) {
  const { data, error } = await supabase
    .from('reminders')
    .update({ ...updates, updated_by: userId })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  await logActivity('reminders', id, 'update', userId, updates)
  return data as Reminder
}

export async function deleteReminder(id: string, userId: string) {
  const { error } = await supabase.from('reminders').delete().eq('id', id)
  if (error) throw error
  await logActivity('reminders', id, 'delete', userId, {})
}

// ─────────────────────────────────────────────────────────────
// ACTIVITY LOGS
// ─────────────────────────────────────────────────────────────

export async function getActivityLogs(tableName?: string, recordId?: string) {
  let query = supabase
    .from('activity_logs')
    .select('*, user:user_profiles(name)')
    .order('timestamp', { ascending: false })
    .limit(50)

  if (tableName) query = query.eq('table_name', tableName)
  if (recordId) query = query.eq('record_id', recordId)

  const { data, error } = await query
  if (error) throw error
  return data as ActivityLog[]
}

async function logActivity(
  tableName: string,
  recordId: string,
  action: 'create' | 'update' | 'delete',
  userId: string,
  changes: Record<string, unknown>
) {
  const { error } = await supabase.from('activity_logs').insert({
    table_name: tableName,
    record_id: recordId,
    action,
    changed_by: userId,
    changes,
  })
  if (error) console.error('Activity log error:', error)
}

// ─────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}
