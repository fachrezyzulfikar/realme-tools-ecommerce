'use client'

import { useState, useMemo } from 'react'
import {
  Plus, Search, X, Edit2, Trash2, Tag, Users, Clock,
  CheckCircle2, Circle, Bell, AlertCircle, ChevronDown,
  Activity, Calendar, CheckCheck
} from 'lucide-react'
import { DUMMY_REMINDERS, DUMMY_ACTIVITY_LOGS } from '@/lib/dummy-data'
import { Reminder, ActionItem, REMINDER_TYPES } from '@/lib/types'
import { formatDateTime, formatDate, generateId, isOverdue, isDueSoon } from '@/lib/utils'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  title: '',
  type: '',
  datetime: new Date().toISOString().slice(0, 16),
  tags: [] as string[],
  participants: [] as string[],
  content: '',
  action_items: [] as ActionItem[],
  additional_notes: '',
  status: 'pending' as 'pending' | 'completed',
}

const TAG_COLORS = [
  'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'bg-green-500/15 text-green-400 border-green-500/30',
  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'bg-rose-500/15 text-rose-400 border-rose-500/30',
]

function getTagColor(tag: string) {
  return TAG_COLORS[tag.charCodeAt(0) % TAG_COLORS.length]
}

function getReminderStatus(reminder: Reminder) {
  if (reminder.status === 'completed') return { label: 'Selesai', color: 'badge-completed', icon: CheckCircle2 }
  if (isOverdue(reminder.datetime)) return { label: 'Terlambat', color: 'badge-overdue', icon: AlertCircle }
  if (isDueSoon(reminder.datetime)) return { label: 'Segera', color: 'badge-pending', icon: Clock }
  return { label: 'Tertunda', color: 'badge-pending', icon: Clock }
}

export default function PengingatPage() {
  const [reminders, setReminders] = useState<Reminder[]>(DUMMY_REMINDERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [tagInput, setTagInput] = useState('')
  const [participantInput, setParticipantInput] = useState('')
  const [actionInput, setActionInput] = useState('')
  const [showLogs, setShowLogs] = useState(false)

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    reminders.forEach(r => r.tags.forEach(t => tags.add(t)))
    return [...tags]
  }, [reminders])

  const counts = useMemo(() => ({
    all: reminders.length,
    pending: reminders.filter(r => r.status === 'pending').length,
    completed: reminders.filter(r => r.status === 'completed').length,
    overdue: reminders.filter(r => r.status === 'pending' && isOverdue(r.datetime)).length,
  }), [reminders])

  const filteredReminders = useMemo(() => {
    return reminders.filter(r => {
      const searchMatch = !searchQuery ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.content.toLowerCase().includes(searchQuery.toLowerCase())
      const tagMatch = !activeTag || r.tags.includes(activeTag)
      const filterMatch =
        activeFilter === 'all' ? true :
        activeFilter === 'pending' ? r.status === 'pending' :
        activeFilter === 'completed' ? r.status === 'completed' :
        activeFilter === 'overdue' ? (r.status === 'pending' && isOverdue(r.datetime)) : true
      return searchMatch && tagMatch && filterMatch
    })
  }, [reminders, searchQuery, activeTag, activeFilter])

  const openCreate = () => {
    setEditingReminder(null)
    setForm({ ...EMPTY_FORM, datetime: new Date().toISOString().slice(0, 16) })
    setShowModal(true)
  }

  const openEdit = (r: Reminder) => {
    setEditingReminder(r)
    setForm({
      title: r.title,
      type: r.type,
      datetime: r.datetime.slice(0, 16),
      tags: [...r.tags],
      participants: [...r.participants],
      content: r.content,
      action_items: r.action_items.map(a => ({ ...a })),
      additional_notes: r.additional_notes,
      status: r.status,
    })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id))
    if (selectedReminder?.id === id) setSelectedReminder(null)
    toast.success('Pengingat berhasil dihapus')
  }

  const toggleComplete = (id: string) => {
    setReminders(prev => prev.map(r => {
      if (r.id !== id) return r
      const newStatus = r.status === 'completed' ? 'pending' : 'completed'
      toast.success(newStatus === 'completed' ? 'Pengingat ditandai selesai ✓' : 'Pengingat dikembalikan ke tertunda')
      return { ...r, status: newStatus, updated_at: new Date().toISOString() }
    }))
    if (selectedReminder?.id === id) {
      setSelectedReminder(prev => prev ? { ...prev, status: prev.status === 'completed' ? 'pending' : 'completed' } : null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: Reminder = {
      id: editingReminder?.id || generateId(),
      ...form,
      datetime: new Date(form.datetime).toISOString(),
      created_by: 'user-1',
      updated_by: 'user-1',
      created_at: editingReminder?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (editingReminder) {
      setReminders(prev => prev.map(r => r.id === editingReminder.id ? data : r))
      if (selectedReminder?.id === editingReminder.id) setSelectedReminder(data)
      toast.success('Pengingat diperbarui')
    } else {
      setReminders(prev => [data, ...prev])
      toast.success('Pengingat baru dibuat')
    }
    setShowModal(false)
  }

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(p => ({ ...p, tags: [...p.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }
  const addParticipant = () => {
    if (participantInput.trim() && !form.participants.includes(participantInput.trim())) {
      setForm(p => ({ ...p, participants: [...p.participants, participantInput.trim()] }))
      setParticipantInput('')
    }
  }
  const addActionItem = () => {
    if (actionInput.trim()) {
      setForm(p => ({ ...p, action_items: [...p.action_items, { id: generateId(), text: actionInput.trim(), completed: false }] }))
      setActionInput('')
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Bell className="w-6 h-6 text-violet-400" />
            Pengingat untuk Kita
          </h1>
          <p className="page-subtitle">{counts.pending} tertunda · {counts.overdue} terlambat</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          Buat Pengingat
        </button>
      </div>

      {/* Overdue alert */}
      {counts.overdue > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-5 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">
            <strong>{counts.overdue} pengingat</strong> sudah melewati deadline! Segera ditangani.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari pengingat..."
            className="input-field pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex bg-secondary rounded-lg p-1 gap-1">
          {([
            { key: 'all', label: `Semua (${counts.all})` },
            { key: 'pending', label: `Tertunda (${counts.pending})` },
            { key: 'overdue', label: `Terlambat (${counts.overdue})` },
            { key: 'completed', label: `Selesai (${counts.completed})` },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap
                ${activeFilter === f.key
                  ? f.key === 'overdue' ? 'bg-red-600 text-white' : 'bg-violet-600 text-white'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tag cloud */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                activeTag === tag ? 'bg-violet-600 text-white border-violet-600' : getTagColor(tag) + ' border'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredReminders.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Tidak ada pengingat</p>
            </div>
          ) : filteredReminders.map(reminder => {
            const status = getReminderStatus(reminder)
            const StatusIcon = status.icon
            return (
              <div
                key={reminder.id}
                onClick={() => setSelectedReminder(reminder)}
                className={`glass-card-hover rounded-xl p-4 cursor-pointer transition-all
                  ${selectedReminder?.id === reminder.id ? 'border-violet-500/50 bg-violet-500/5' : ''}
                  ${isOverdue(reminder.datetime) && reminder.status === 'pending' ? 'border-red-500/30' : ''}
                `}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`badge-store ${status.color} flex items-center gap-1 text-xs`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                    <h3 className={`font-medium text-sm leading-tight ${reminder.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {reminder.title}
                    </h3>
                    <span className="text-xs text-violet-400 mt-0.5 block">{reminder.type}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => toggleComplete(reminder.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        reminder.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'hover:bg-green-500/20 text-muted-foreground hover:text-green-400'
                      }`}
                      title={reminder.status === 'completed' ? 'Tandai tertunda' : 'Tandai selesai'}
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openEdit(reminder)} className="p-1.5 rounded-lg hover:bg-violet-500/20 text-violet-400 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(reminder.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{reminder.content}</p>

                <div className="flex flex-wrap gap-1 mb-2">
                  {reminder.tags.map(tag => (
                    <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border ${getTagColor(tag)}`}>{tag}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {reminder.participants.slice(0, 2).join(', ')}
                  </div>
                  <div className={`flex items-center gap-1 ${isOverdue(reminder.datetime) && reminder.status === 'pending' ? 'text-red-400 font-medium' : ''}`}>
                    <Calendar className="w-3 h-3" />
                    {formatDate(reminder.datetime)}
                  </div>
                </div>

                {reminder.action_items.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="text-xs text-muted-foreground">
                      {reminder.action_items.filter(a => a.completed).length}/{reminder.action_items.length} aksi selesai
                    </div>
                    <div className="w-full bg-secondary/60 rounded-full h-1 mt-1.5">
                      <div
                        className="bg-violet-500 h-1 rounded-full transition-all"
                        style={{ width: `${(reminder.action_items.filter(a => a.completed).length / reminder.action_items.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selectedReminder ? (
            <div className="glass-card rounded-xl p-6 animate-fade-in sticky top-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {(() => {
                      const s = getReminderStatus(selectedReminder)
                      const Icon = s.icon
                      return <span className={`badge-store ${s.color} flex items-center gap-1 text-xs`}><Icon className="w-3 h-3" />{s.label}</span>
                    })()}
                    <span className="text-xs text-violet-400">{selectedReminder.type}</span>
                  </div>
                  <h2 className={`text-lg font-display font-bold ${selectedReminder.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {selectedReminder.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleComplete(selectedReminder.id)}
                    className={`btn-secondary text-xs px-3 py-1.5 ${selectedReminder.status === 'completed' ? 'text-muted-foreground' : 'text-green-400 border-green-500/30'}`}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    {selectedReminder.status === 'completed' ? 'Buka Kembali' : 'Tandai Selesai'}
                  </button>
                  <button onClick={() => setSelectedReminder(null)} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-5 text-xs text-muted-foreground">
                <div className={`flex items-center gap-1.5 ${isOverdue(selectedReminder.datetime) && selectedReminder.status === 'pending' ? 'text-red-400 font-medium' : ''}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  Deadline: {formatDateTime(selectedReminder.datetime)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {selectedReminder.participants.join(', ')}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {selectedReminder.tags.map(tag => (
                  <span key={tag} className={`text-xs px-2.5 py-1 rounded-full border ${getTagColor(tag)}`}>
                    <Tag className="w-2.5 h-2.5 inline mr-1" />{tag}
                  </span>
                ))}
              </div>

              {selectedReminder.content && (
                <div className="p-4 bg-secondary/30 rounded-lg mb-4">
                  <div className="text-xs text-muted-foreground font-medium mb-2">Isi Pengingat</div>
                  <div className="text-sm text-foreground whitespace-pre-wrap">{selectedReminder.content}</div>
                </div>
              )}

              {selectedReminder.action_items.length > 0 && (
                <div className="p-4 bg-secondary/30 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-muted-foreground font-medium">Action Items</div>
                    <span className="text-xs text-violet-400">
                      {selectedReminder.action_items.filter(a => a.completed).length}/{selectedReminder.action_items.length}
                    </span>
                  </div>
                  <div className="w-full bg-secondary/60 rounded-full h-1 mb-3">
                    <div
                      className="bg-violet-500 h-1 rounded-full transition-all"
                      style={{ width: `${(selectedReminder.action_items.filter(a => a.completed).length / selectedReminder.action_items.length) * 100}%` }}
                    />
                  </div>
                  <div className="space-y-2">
                    {selectedReminder.action_items.map(item => (
                      <div key={item.id} className="flex items-start gap-2">
                        {item.completed
                          ? <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          : <Circle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        }
                        <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReminder.additional_notes && (
                <div className="p-4 bg-secondary/30 rounded-lg mb-4">
                  <div className="text-xs text-muted-foreground font-medium mb-2">Catatan Tambahan</div>
                  <div className="text-sm text-foreground">{selectedReminder.additional_notes}</div>
                </div>
              )}

              <button
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Activity className="w-3.5 h-3.5" /> Riwayat Aktivitas
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLogs ? 'rotate-180' : ''}`} />
              </button>
              {showLogs && (
                <div className="mt-3 space-y-2">
                  {DUMMY_ACTIVITY_LOGS.slice(0, 3).map(log => (
                    <div key={log.id} className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-secondary/20 rounded-lg">
                      <Clock className="w-3 h-3" />
                      <span className="text-foreground">{log.user_name}</span>
                      <span>{log.action === 'create' ? 'membuat' : 'mengedit'}</span>
                      <span className="ml-auto">{formatDateTime(log.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Pilih pengingat untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-foreground">
                {editingReminder ? 'Edit Pengingat' : 'Buat Pengingat Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text">Judul Pengingat</label>
                <input type="text" className="input-field" placeholder="Judul pengingat..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Tipe Pengingat</label>
                  <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required>
                    <option value="">Pilih tipe</option>
                    {REMINDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Deadline</label>
                  <input type="datetime-local" className="input-field" value={form.datetime} onChange={e => setForm({ ...form, datetime: e.target.value })} />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="label-text">Status</label>
                <div className="flex gap-2">
                  {(['pending', 'completed'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                        form.status === s
                          ? s === 'completed' ? 'bg-green-600/30 text-green-400 border-green-600/50' : 'bg-amber-600/30 text-amber-400 border-amber-600/50'
                          : 'bg-secondary/30 text-muted-foreground border-border'
                      }`}
                    >
                      {s === 'pending' ? '⏳ Tertunda' : '✅ Selesai'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="label-text">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" className="input-field" placeholder="Tambah tag..." value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                  <button type="button" onClick={addTag} className="btn-secondary px-3"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map(tag => (
                    <span key={tag} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${getTagColor(tag)}`}>
                      {tag}
                      <button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Participants */}
              <div>
                <label className="label-text">Partisipan</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" className="input-field" placeholder="Nama partisipan..." value={participantInput} onChange={e => setParticipantInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addParticipant())} />
                  <button type="button" onClick={addParticipant} className="btn-secondary px-3"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.participants.map(p => (
                    <span key={p} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary border border-border text-foreground">
                      {p}
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, participants: prev.participants.filter(x => x !== p) }))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-text">Isi Pengingat</label>
                <textarea rows={4} className="input-field resize-none" placeholder="Detail pengingat..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
              </div>

              {/* Action Items */}
              <div>
                <label className="label-text">Action Items</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" className="input-field" placeholder="Tambah action item..." value={actionInput} onChange={e => setActionInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addActionItem())} />
                  <button type="button" onClick={addActionItem} className="btn-secondary px-3"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2">
                  {form.action_items.map(item => (
                    <div key={item.id} className="flex items-center gap-2 p-2.5 bg-secondary/30 rounded-lg">
                      <button type="button" onClick={() => setForm(p => ({ ...p, action_items: p.action_items.map(a => a.id === item.id ? { ...a, completed: !a.completed } : a) }))}>
                        {item.completed ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      <span className={`text-sm flex-1 ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.text}</span>
                      <button type="button" onClick={() => setForm(p => ({ ...p, action_items: p.action_items.filter(a => a.id !== item.id) }))}>
                        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-text">Catatan Tambahan</label>
                <textarea rows={2} className="input-field resize-none" value={form.additional_notes} onChange={e => setForm({ ...form, additional_notes: e.target.value })} />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center">
                  {editingReminder ? 'Simpan Perubahan' : 'Buat Pengingat'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
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
