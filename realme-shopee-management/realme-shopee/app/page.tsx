'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Zap, LogIn, UserPlus } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Demo mode: simulate auth without Supabase
    await new Promise(r => setTimeout(r, 900))

    if (mode === 'login') {
      if (form.email && form.password) {
        localStorage.setItem('rsms_user', JSON.stringify({ 
          id: 'user-1', 
          email: form.email, 
          name: form.email.split('@')[0] 
        }))
        toast.success('Selamat datang kembali!')
        router.push('/dashboard')
      } else {
        toast.error('Email dan password harus diisi')
      }
    } else {
      if (form.name && form.email && form.password) {
        localStorage.setItem('rsms_user', JSON.stringify({ 
          id: 'user-new', 
          email: form.email, 
          name: form.name 
        }))
        toast.success('Akun berhasil dibuat!')
        router.push('/dashboard')
      } else {
        toast.error('Semua field harus diisi')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-900/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4"
            style={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)' }}>
            <Zap className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Realme Shopee</h1>
          <p className="text-sm text-muted-foreground mt-1">Stores Management · Surabaya</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          {/* Tab switcher */}
          <div className="flex bg-secondary/60 rounded-lg p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all duration-150
                ${mode === 'login' ? 'bg-violet-600 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LogIn className="w-4 h-4" />
              Masuk
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all duration-150
                ${mode === 'signup' ? 'bg-violet-600 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <UserPlus className="w-4 h-4" />
              Daftar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label-text">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Masukkan nama kamu"
                  className="input-field"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                placeholder="nama@email.com"
                className="input-field"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-2.5 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === 'login' ? 'Masuk...' : 'Mendaftar...'}
                </span>
              ) : (
                mode === 'login' ? 'Masuk ke Dashboard' : 'Buat Akun'
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
            <p className="text-xs text-violet-300 text-center">
              💡 <strong>Demo Mode</strong> — Gunakan email & password apapun untuk masuk
            </p>
          </div>
        </div>

        <div className="copyright-footer mt-6">
          <p>© {new Date().getFullYear()} Realme Shopee Stores Management System</p>
          <p className="mt-0.5">Created by <span className="text-violet-400 font-medium">Fachrezy Zulfikar</span></p>
        </div>
      </div>
    </div>
  )
}
