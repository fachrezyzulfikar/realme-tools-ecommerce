# 🚀 Realme Shopee Stores Management System
### Surabaya Internal Tool

> Sistem manajemen internal untuk tim e-commerce Realme Shopee Surabaya.  
> Dibangun dengan Next.js 14, Supabase, Tailwind CSS, dan Recharts.

**Created by Fachrezy Zulfikar**

---

## 📋 Daftar Fitur

| Halaman | Fitur |
|---------|-------|
| **Dashboard** | Ringkasan performa semua toko, grafik tren, pengingat & catatan terbaru |
| **Laporan Ads** | CRUD laporan mingguan per toko, auto-kalkulasi ROAS & CTR, visualisasi grafik, export PDF |
| **Catatan** | Diskusi internal dengan tag, partisipan, action items, activity log |
| **Pengingat** | Task reminder dengan deadline, status pending/completed, highlight overdue |

### Multi-Toko Support
- Realme Surabaya
- Holyfon
- Devilmimi
- Optima
- Top Gadget
- Prime Gadget
- Storm Bytes

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + custom design system
- **State**: React Hooks + Zustand
- **Charts**: Recharts
- **Backend & DB**: Supabase (Auth + PostgreSQL + Realtime)
- **Notifications**: react-hot-toast
- **Export**: jsPDF + jsPDF-AutoTable
- **Icons**: Lucide React
- **Fonts**: Syne (display) + DM Sans (body) — Google Fonts

---

## ⚡ Cara Menjalankan Lokal

### 1. Clone / Copy Project

```bash
# Masuk ke folder project
cd realme-shopee-management
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 3. Setup Environment Variables

```bash
# Copy file contoh
cp .env.local.example .env.local

# Edit .env.local dan isi dengan kredensial Supabase kamu:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

> **Tanpa Supabase?** App tetap berjalan dengan **dummy data** bawaan. Kamu bisa langsung jalankan `npm run dev` tanpa setup Supabase!

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

**Login Demo:**
- Gunakan email & password apapun (misal: `admin@realme.com` / `password123`)
- App berjalan dalam **demo mode** dengan data contoh

---

## 🗄️ Setup Supabase (Opsional — untuk production)

### 1. Buat Project Supabase

1. Pergi ke [supabase.com](https://supabase.com) dan buat akun
2. Klik **"New Project"**
3. Isi nama project: `realme-shopee-surabaya`
4. Pilih region: **Southeast Asia (Singapore)**
5. Set database password yang kuat

### 2. Jalankan SQL Schema

1. Di Supabase Dashboard, pergi ke **SQL Editor**
2. Buka file `supabase/schema.sql` dari project ini
3. Copy seluruh isi file
4. Paste di SQL Editor dan klik **Run**

Schema akan membuat:
- Tabel `stores` (dengan data 7 toko otomatis)
- Tabel `user_profiles`
- Tabel `ads_reports`
- Tabel `notes`
- Tabel `reminders`
- Tabel `activity_logs`
- Row Level Security (RLS) policies
- Triggers untuk auto-update `updated_at`
- Trigger untuk auto-create user profile saat signup

### 3. Ambil API Keys

1. Di Supabase Dashboard, pergi ke **Settings → API**
2. Copy **Project URL** → paste ke `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public key** → paste ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Enable Realtime (Opsional)

Di Supabase Dashboard → **Database → Replication**, tambahkan tabel:
- `ads_reports`
- `notes`
- `reminders`
- `activity_logs`

### 5. Aktifkan Supabase Auth di App

Di file `app/page.tsx`, ganti fungsi `handleSubmit` dengan:

```typescript
import { signIn, signUp } from '@/lib/supabase/services'

// Di handleSubmit:
if (mode === 'login') {
  const { user } = await signIn(form.email, form.password)
  // redirect ke dashboard
} else {
  const { user } = await signUp(form.email, form.password, form.name)
  // redirect ke dashboard  
}
```

Di setiap page, ganti `DUMMY_*` data dengan service functions dari `lib/supabase/services.ts`.

---

## 📁 Struktur Project

```
realme-shopee-management/
├── app/
│   ├── layout.tsx              # Root layout (fonts, toaster)
│   ├── globals.css             # Design system & CSS vars
│   ├── page.tsx                # Login/Signup page
│   ├── not-found.tsx           # 404 page
│   └── dashboard/
│       ├── layout.tsx          # Sidebar + main layout
│       ├── page.tsx            # Dashboard overview
│       ├── loading.tsx         # Loading state
│       ├── error.tsx           # Error boundary
│       ├── laporan-ads/
│       │   └── page.tsx        # Laporan Ads CRUD + charts
│       ├── catatan/
│       │   └── page.tsx        # Catatan discussion
│       └── pengingat/
│           └── page.tsx        # Reminder management
├── lib/
│   ├── types.ts                # TypeScript interfaces
│   ├── utils.ts                # Helper functions
│   ├── dummy-data.ts           # Sample data for demo
│   ├── store.ts                # Zustand global state
│   ├── export-pdf.ts           # jsPDF export utility
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # SSR Supabase client
│       └── services.ts         # CRUD service functions
├── supabase/
│   └── schema.sql              # Full PostgreSQL schema
├── .env.local.example          # Environment template
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🎨 Design System

### Warna Utama
| Token | Hex | Kegunaan |
|-------|-----|----------|
| Violet 600 | `#8b5cf6` | Primary brand, buttons |
| Violet 400 | `#a78bfa` | Accent, links |
| Amber 400 | `#f59e0b` | ROAS metrics, warnings |
| Green 400 | `#10b981` | Success, completed |
| Red 400 | `#ef4444` | Overdue, danger |
| Blue 400 | `#3b82f6` | Info |

### Tipografi
- **Display / Headings**: Syne (Google Fonts)
- **Body / UI**: DM Sans (Google Fonts)
- **Numbers / Code**: JetBrains Mono

### Komponen Utama (CSS Classes)
```css
.glass-card          /* Card transparan dengan backdrop blur */
.glass-card-hover    /* Card dengan hover effect */
.metric-card         /* Card metrik dengan top accent */
.btn-primary         /* Tombol utama (violet) */
.btn-secondary       /* Tombol sekunder */
.btn-ghost           /* Tombol ghost */
.btn-danger          /* Tombol hapus (merah) */
.input-field         /* Input form */
.label-text          /* Label form */
.data-table          /* Tabel data */
.sidebar-link        /* Link navigasi sidebar */
.badge-pending       /* Badge status tertunda */
.badge-completed     /* Badge status selesai */
.badge-overdue       /* Badge terlambat (animated) */
.copyright-footer    /* Footer copyright setiap halaman */
```

---

## 📊 Database Schema

### Tabel Utama

**`ads_reports`** — Laporan performa iklan mingguan
```sql
id, store_id, week_start, week_end, 
impressions, products_sold, clicks, revenue, ctr, ad_spend, orders, roas,
best_roas_product_name, best_roas_value,
lowest_conversion_product_name, lowest_conversion_cost,
notes, created_by, updated_by, created_at, updated_at
```

**`notes`** — Catatan diskusi internal
```sql
id, title, type, datetime, tags[], participants[],
content, action_items(jsonb), additional_notes,
created_by, updated_by, created_at, updated_at
```

**`reminders`** — Pengingat dan follow-up
```sql
id, title, type, datetime, tags[], participants[],
content, action_items(jsonb), additional_notes, status,
created_by, updated_by, created_at, updated_at
```

**`activity_logs`** — Log perubahan data
```sql
id, table_name, record_id, action, changed_by, timestamp, changes(jsonb)
```

---

## 🔧 Kustomisasi

### Tambah Toko Baru
Edit `lib/types.ts`:
```typescript
export const STORES: Store[] = [
  // ... toko yang ada
  { id: '8', name: 'Nama Toko Baru' },
]
```

Dan tambahkan ke `supabase/schema.sql`:
```sql
INSERT INTO stores (id, name) VALUES ('...uuid...', 'Nama Toko Baru');
```

### Tambah Tipe Note / Reminder
Edit `lib/types.ts`:
```typescript
export const NOTE_TYPES = [
  // ... tipe yang ada
  'Tipe Baru',
]
```

### Ganti Color Scheme
Edit CSS variables di `app/globals.css`:
```css
:root {
  --primary: 262 83% 68%;  /* Ubah ke hue warna lain */
}
```

---

## 🚀 Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel Dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Atau connect langsung ke GitHub repository di [vercel.com](https://vercel.com).

---

## 📦 Build Production

```bash
npm run build
npm start
```

---

## 🐛 Troubleshooting

**Q: Error `tailwindcss-animate` not found**
```bash
npm install tailwindcss-animate
```

**Q: Font tidak muncul**  
Pastikan ada koneksi internet saat development (Google Fonts CDN).

**Q: Supabase error saat deploy**  
Pastikan environment variables sudah di-set di platform deploy (Vercel/Railway/etc).

**Q: Chart tidak muncul**  
Recharts butuh `'use client'` directive, sudah ada di semua page component.

---

## 📝 Roadmap / Fitur Rencana

- [ ] Integrasi Supabase Realtime untuk live updates
- [ ] Push notification untuk reminder overdue
- [ ] Export Excel dengan xlsx library
- [ ] Dark/Light mode toggle
- [ ] Mobile app wrapper (Capacitor)
- [ ] Grafik perbandingan antar toko
- [ ] Import data dari CSV Shopee Ads
- [ ] Email notification via Supabase Edge Functions

---

## 📄 Lisensi

Internal use only — Realme Shopee Stores Management System, Surabaya.

---

**© 2024–{current_year} Realme Shopee Stores Management System · Surabaya**  
**Created by Fachrezy Zulfikar**
