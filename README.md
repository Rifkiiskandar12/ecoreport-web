# EcoReport - Sistem Pengaduan Sampah Kelurahan Tanjungpura

Aplikasi web untuk warga melaporkan masalah persampahan di lingkungan, dengan tracking status dan dashboard rekap untuk petugas.

## Fitur

- **Autentikasi**: Login, Register, Lupa/Reset Password (Supabase Auth)
- **Input Pengaduan**: form dengan kategori, lokasi (teks + peta interaktif), foto bukti, opsi anonim
- **Tracking Status**: riwayat pengaduan warga, dengan pencarian & filter status
- **Dashboard Laporan**: rekap statistik + tabel semua laporan untuk petugas/admin, dengan update status
- **Detail Pengaduan**: halaman detail per laporan (foto, catatan petugas, lokasi di peta)

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router v7
- Supabase (Auth, Database, Storage, Row Level Security)
- Leaflet / React-Leaflet (peta lokasi)

## Instalasi

1. Clone/download project ini
2. Install dependency:
   ```bash
   npm install
   ```
3. Buat file `.env` di root project:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   (Ambil dari Supabase Dashboard → Settings → API)
4. Jalankan `schema.sql` di Supabase SQL Editor untuk membuat tabel
5. Jika tabel sudah ada sebelumnya, jalankan juga `alter_add_koordinat.sql` dan `fix_rls_profiles.sql`
6. Buat storage bucket `pengaduan-foto` di Supabase Dashboard → Storage (set public)
7. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

## Struktur Folder

```
src/
├── components/     # Navbar, Sidebar, DashboardLayout, LocationPicker
├── context/        # AuthContext (state login)
├── models/         # Class Pengaduan (OOP)
├── services/       # Service layer ke Supabase
├── utils/          # Fungsi validasi form
├── pages/          # Halaman: Login, Register, Dashboard, dll
├── routes/         # AppRouter (React Router + ProtectedRoute)
├── lib/            # Koneksi Supabase client
└── App.jsx
```

## Role Pengguna

- **warga**: bisa membuat & melihat pengaduan sendiri
- **petugas/admin**: bisa melihat semua laporan & mengubah status

Role diatur manual di tabel `profiles` pada Supabase (kolom `role`).
