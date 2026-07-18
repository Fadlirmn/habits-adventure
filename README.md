# 🎮 Benkyou Japanis (勉強JAPANIS) - Isekai Nihongo RPG

Aplikasi pelacak target belajar harian bahasa Jepang (Quest Tracker) dengan tema retro RPG/Isekai yang imersif. Dirancang untuk membantu Anda meningkatkan konsistensi belajar bahasa Jepang melalui mekanik gamifikasi!

---

## 🌟 Fitur Utama

- **⚔️ Quest Harian Terstruktur**: Target belajar harian yang dibagi berdasarkan fase belajar (Fase 1 sampai Fase 5 + Rute Alternatif).
- **❤️ RPG Stats System**: Karakter Anda memiliki HP (Health Points), MP (Mana Points), Level, dan EXP (Experience Points).
- **👾 Lazy Monster Penalty**: Hati-hati! Jika Anda melewatkan aktivitas belajar harian, Anda akan terkena damage HP dari monster malas saat masuk kembali.
- **🎒 Inventaris Tas & Toko**: Kumpulkan Gold dari penyelesaian quest untuk membeli Ramuan HP, Ramuan MP, Elixir XP, atau Buku Mantra Kanji di Toko.
- **📖 Kanji Grimoire**: Buka mantra Kanji level N3/N2 acak dari Toko untuk melatih hafalan kosakata dan cara bacanya (Onyomi/Kunyomi).
- **☁️ Supabase Cloud Sync**: Dukungan mode offline penuh (Local Storage) secara default, serta sinkronisasi cloud real-time otomatis menggunakan Supabase.
- **🔑 Google OAuth Login**: Masuk aman menggunakan akun Google untuk sinkronisasi data yang mulus di berbagai perangkat.

---

## 🛠️ Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Styling**: Vanilla CSS (Pixel Art / Dark Fantasy Design System)
- **Backend & Auth**: Supabase (Database, Auth, Row Level Security)

---

## 🚀 Cara Menjalankan Project

### 1. Prasyarat
Pastikan Anda sudah menginstal **Node.js** di perangkat Anda.

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Jalankan Development Server
```bash
npm run dev
```
Buka `http://localhost:5173` di browser Anda.

---

## 🗄️ Setup Database & Google Login

1. **Jalankan Skema SQL**:
   Salin dan jalankan seluruh query SQL dari file `supabase_auth_schema.sql` di SQL Editor proyek Supabase Anda. Ini akan membuat tabel `profiles` dan memicu integrasi trigger RLS.

2. **Salin Environment Variables**:
   Salin `.env.example` menjadi `.env` lalu isi kredensial Supabase dan LLM Anda:
   ```bash
   cp .env.example .env
   ```

3. **Konfigurasi Auth**:
   Aktifkan provider Google OAuth di dashboard Supabase Anda dengan memasukkan Client ID dan Secret dari Google Cloud Console. Jangan lupa tambahkan Redirect URI dari Supabase ke pengaturan Google OAuth.

---

## 📄 Lisensi
Project ini dibuat untuk membantu mempercepat proses belajar bahasa Jepang secara mandiri dengan metode gamifikasi yang menyenangkan. Silakan dikustomisasi sesuai rute belajar Anda sendiri!
