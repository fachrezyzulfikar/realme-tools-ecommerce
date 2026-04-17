'use client'

import { useState, useMemo } from 'react'
import {
  Plus, Search, X, Edit2, Trash2, Tag, Users, Clock,
  CheckCircle2, Circle, ChevronDown, StickyNote, Activity
} from 'lucide-react'
import { DUMMY_NOTES, DUMMY_ACTIVITY_LOGS } from '@/lib/dummy-data'
import { Note, ActionItem, NOTE_TYPES } from '@/lib/types'
import { formatDateTime, generateId } from '@/lib/utils'
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
}

const TAG_COLORS = [
  'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'bg-green-500/15 text-green-400 border-green-500/30',
  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'bg-rose-500/15 text-rose-400 border-rose-500/30',
  'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
]

function getTagColor(tag: string) {
  const idx = tag.charCodeAt(0) % TAG_COLORS.length
  return TAG_COLORS[idx]
}

export default function CatatanPage() {
  const [notes, setNotes] = useState<Note[]>(DUMMY_NOTES)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [tagInput, setTagInput] = useState('')
  const [participantInput, setParticipantInput] = useState('')
  const [actionInput, setActionInput] = useState('')
  const [showLogs, setShowLogs] = useState(false)

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    notes.forEach(n => n.tags.forEach(t => tags.add(t)))
    return [...tags]
  }, [notes])

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const searchMatch = !searchQuery ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      const tagMatch = !activeTag || n.tags.includes(activeTag)
      return searchMatch && tagMatch
    })
  }, [notes, searchQuery, activeTag])

  const openCreate = () => {
    setEditingNote(null)
    setForm({ ...EMPTY_FORM, datetime: new Date().toISOString().slice(0, 16) })
    setShowModal(true)
  }

  const openEdit = (note: Note) => {
    setEditingNote(note)
    setForm({
      title: note.title,
      type: note.type,
      datetime: note.datetime.slice(0, 16),
      tags: [...note.tags],
      participants: [...note.participants],
      content: note.content,
      action_items: note.action_items.map(a => ({ ...a })),
      additional_notes: note.additional_notes,
    })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    if (selectedNote?.id === id) setSelectedNote(null)
    toast.success('Catatan berhasil dihapus')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const noteData: Note = {
      id: editingNote?.id || generateId(),
      ...form,
      datetime: new Date(form.datetime).toISOString(),
      created_by: 'user-1',
      updated_by: 'user-1',
      created_at: editingNote?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (editingNote) {
      setNotes(prev => prev.map(n => n.id === editingNote.id ? noteData : n))
      if (selectedNote?.id === editingNote.id) setSelectedNote(noteData)
      toast.success('Catatan berhasil diperbarui')
    } else {
      setNotes(prev => [noteData, ...prev])
      toast.success('Catatan baru berhasil dibuat')
    }
    setShowModal(false)
  }

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }

  const addParticipant = () => {
    if (participantInput.trim() && !form.participants.includes(participantInput.trim())) {
      setForm(prev => ({ ...prev, participants: [...prev.participants, participantInput.trim()] }))
      setParticipantInput('')
    }
  }

  const addActionItem = () => {
    if (actionInput.trim()) {
      setForm(prev => ({
        ...prev,
        action_items: [...prev.action_items, { id: generateId(), text: actionInput.trim(), completed: false }]
      }))
      setActionInput('')
    }
  }

  const toggleActionItem = (id: string) => {
    setForm(prev => ({
      ...prev,
      action_items: prev.action_items.map(a => a.id === id ? { ...a, completed: !a.completed } : a)
    }))
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <StickyNote className="w-6 h-6 text-violet-400" />
            Catatan untuk Kita
          </h1>
          <p className="page-subtitle">{notes.length} catatan tersimpan · Internal discussion</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          Buat Catatan
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari catatan, tag..."
            className="input-field pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {activeTag && (
            <button onClick={() => setActiveTag(null)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-violet-600 text-white">
              <X className="w-3 h-3" /> {activeTag}
            </button>
          )}
        </div>
      </div>

      {/* Tag cloud */}
      <div className="flex flex-wrap gap-2 mb-6">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${
              activeTag === tag 
                ? 'bg-violet-600 text-white border-violet-600' 
                : getTagColor(tag) + ' border'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
              <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Belum ada catatan</p>
            </div>
          ) : filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`glass-card-hover rounded-xl p-4 cursor-pointer transition-all ${
                selectedNote?.id === note.id ? 'border-violet-500/50 bg-violet-500/5' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-medium text-foreground text-sm leading-tight">{note.title}</h3>
                  <span className="text-xs text-violet-400 mt-0.5 block">{note.type}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(note)} className="p-1.5 rounded-lg hover:bg-violet-500/20 text-violet-400 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{note.content}</p>

              <div className="flex flex-wrap gap-1 mb-2">
                {note.tags.map(tag => (
                  <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border ${getTagColor(tag)}`}>{tag}</span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {note.participants.slice(0, 2).join(', ')}{note.participants.length > 2 ? ` +${note.participants.length - 2}` : ''}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDateTime(note.datetime).slice(0, 12)}
                </div>
              </div>

              {note.action_items.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                  {note.action_items.filter(a => a.completed).length}/{note.action_items.length} aksi selesai
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selectedNote ? (
            <div className="glass-card rounded-xl p-6 animate-fade-in sticky top-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className="text-xs text-violet-400 font-medium">{selectedNote.type}</span>
                  <h2 className="text-lg font-display font-bold text-foreground mt-0.5">{selectedNote.title}</h2>
                </div>
                <button onClick={() => setSelectedNote(null)} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDateTime(selectedNote.datetime)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {selectedNote.participants.join(', ')}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {selectedNote.tags.map(tag => (
                  <span key={tag} className={`text-xs px-2.5 py-1 rounded-full border ${getTagColor(tag)}`}>
                    <Tag className="w-2.5 h-2.5 inline mr-1" />{tag}
                  </span>
                ))}
              </div>

              <div className="p-4 bg-secondary/30 rounded-lg mb-4">
                <div className="text-xs text-muted-foreground font-medium mb-2">Isi Pembahasan</div>
                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selectedNote.content}</div>
              </div>

              {selectedNote.action_items.length > 0 && (
                <div className="p-4 bg-secondary/30 rounded-lg mb-4">
                  <div className="text-xs text-muted-foreground font-medium mb-3">Action Items</div>
                  <div className="space-y-2">
                    {selectedNote.action_items.map(item => (
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

              {selectedNote.additional_notes && (
                <div className="p-4 bg-secondary/30 rounded-lg mb-4">
                  <div className="text-xs text-muted-foreground font-medium mb-2">Catatan Tambahan</div>
                  <div className="text-sm text-foreground">{selectedNote.additional_notes}</div>
                </div>
              )}

              {/* Activity log */}
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Activity className="w-3.5 h-3.5" />
                Riwayat Aktivitas
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLogs ? 'rotate-180' : ''}`} />
              </button>
              {showLogs && (
                <div className="mt-3 space-y-2">
                  {DUMMY_ACTIVITY_LOGS.filter(l => l.table_name === 'notes').slice(0, 3).map(log => (
                    <div key={log.id} className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-secondary/20 rounded-lg">
                      <Clock className="w-3 h-3 flex-shrink-0" />
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
              <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Pilih catatan untuk melihat detail</p>
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
                {editingNote ? 'Edit Catatan' : 'Catatan Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text">Judul Pembahasan</label>
                <input type="text" className="input-field" placeholder="Judul catatan..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Tipe Pembahasan</label>
                  <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required>
                    <option value="">Pilih tipe</option>
                    {NOTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Tanggal & Waktu</label>
                  <input type="datetime-local" className="input-field" value={form.datetime} onChange={e => setForm({ ...form, datetime: e.target.value })} />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="label-text">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" className="input-field" placeholder="Tambah tag..." value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                  <button type="button" onClick={addTag} className="btn-secondary px-3">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map(tag => (
                    <span key={tag} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${getTagColor(tag)}`}>
                      {tag}
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}>
                        <X className="w-3 h-3" />
                      </button>
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
                  <button type="button" onClick={addParticipant} className="btn-secondary px-3">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.participants.map(p => (
                    <span key={p} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary border border-border text-foreground">
                      {p}
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, participants: prev.participants.filter(x => x !== p) }))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-text">Isi Pembahasan</label>
                <textarea rows={5} className="input-field resize-none" placeholder="Isi catatan diskusi..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
              </div>

              {/* Action Items */}
              <div>
                <label className="label-text">Action Items</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" className="input-field" placeholder="Tambah action item..." value={actionInput} onChange={e => setActionInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addActionItem())} />
                  <button type="button" onClick={addActionItem} className="btn-secondary px-3">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {form.action_items.map(item => (
                    <div key={item.id} className="flex items-center gap-2 p-2.5 bg-secondary/30 rounded-lg">
                      <button type="button" onClick={() => toggleActionItem(item.id)}>
                        {item.completed
                          ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                          : <Circle className="w-4 h-4 text-muted-foreground" />
                        }
                      </button>
                      <span className={`text-sm flex-1 ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.text}</span>
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, action_items: prev.action_items.filter(a => a.id !== item.id) }))}>
                        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-text">Catatan Tambahan</label>
                <textarea rows={2} className="input-field resize-none" placeholder="Catatan tambahan opsional..." value={form.additional_notes} onChange={e => setForm({ ...form, additional_notes: e.target.value })} />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center">
                  {editingNote ? 'Simpan Perubahan' : 'Buat Catatan'}
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
