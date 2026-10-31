<p align="center">
  <img src="public/logo-togather.png" alt="Logo Togather" width="260" />
  <br />
 
</p>

<h1 align="center">Togather</h1>

<p align="center">
  <strong>Platform Discovery untuk Komunitas & Event Lokal di Daerah Istimewa Yogyakarta</strong><br />
  <em>Temukan teman satu frekuensi lewat hal yang kamu suka.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Web%20App-3B82F6?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Platform Web" />
  <img src="https://img.shields.io/badge/Region-Yogyakarta%20DIY-10B981?style=for-the-badge" alt="Region DIY" />
  <img src="https://img.shields.io/badge/Tech-Next.js%2016.4.3-8B5CF6?style=for-the-badge" alt="Next.js" />
  <img src="https://img.shields.io/badge/DB-PostgreSQL%20%2B%20PostGIS-795548?style=for-the-badge" alt="PostgreSQL" />
</p>

<p align="center">
  <img src="docs/design/Home%20Desktop%20(1).png" alt="Togather Showcase" width="760" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.12);" />
</p>

---

## 📌 Daftar Isi
1. [Tentang Togather (Overview)](#-tentang-togather-overview)
2. [Fitur Utama](#-fitur-utama)
3. [Teknologi & Stack](#-teknologi--stack)
4. [Instalasi](#-instalasi)
5. [Struktur Proyek](#-struktur-proyek)
6. [Script yang Tersedia](#-script-yang-terdapat)
7. [Rute Aplikasi](#-rute-aplikasi)
8. [Design System](#-design-system)
9. [FAQ](#-faq)

---

## 🌟 Tentang Togather (Overview)

**Togather** adalah platform yang memudahkan pengguna di DIY (Yogyakarta, Sleman, Bantul, Kulon Progo, Gunungkidul) untuk menemukan **komunitas** dan **event** yang relevan dengan minat mereka.  Platform ini menyatukan informasi yang biasanya tersebar di Instagram, Discord, WhatsApp, dan grup‑grup lain ke dalam satu katalog terstruktur dengan **peta interaktif**, **filter kategori**, dan **lokasi geografis**.

### Nilai Utama
- **🔎 Discovery Terpusat** – Semua komunitas & event dalam satu peta, dapat difilter berdasarkan kategori, wilayah, dan tipe (online/offline).
- **🤝 Kolaborasi Tanpa Registrasi Rumit** – Pengguna dapat *pairing* dengan kode 6‑digit untuk menghubungkan akun orang tua atau mengakses fitur lengkap.
- **🗺️ Geospasial Akurat** – Menggunakan PostgreSQL + PostGIS untuk penyimpanan titik koordinat dan query jarak.
- **🛠️ Modular & Extensible** – Built on **Next.js 16 (App Router)**, **Prisma**, **Tailwind CSS**, dan **Leaflet** sehingga mudah ditambah fitur di fase selanjutnya.

---

## 🎯 Fitur Utama

| Fitur | Manfaat |
|---|---|
| 🗺️ **Discovery Map** | Peta interaktif (Leaflet + OpenStreetMap) menampilkan komunitas (lingkaran) dan event (persegi) dengan filter wilayah dan kategori. |
| 👥 **Manajemen Komunitas** | Browse, join, serta lihat profil lengkap komunitas; dukungan komunitas publik & privat dengan proses *request to join*. |
| 📅 **Event Management** | Daftar event, filter kuota, lihat detail, dan register; event dapat berdiri sendiri atau terhubung ke komunitas. |
| 🔐 **Authentication** | NextAuth v5 (email/password + JWT) dengan *role‑based access* (Guest, User, User‑Verified, Pengurus, Admin). |
| 🎨 **Modern UI/UX** | Tailwind CSS 3, desain berwarna ungu #7960D7 (60/30/10 rule), komponen pill, rounded, dan aksesibilitas WCAG AA. |
| 🐳 **Docker & CI** | Dockerfile & Docker‑Compose untuk pengembangan lokal (app + PostGIS). |

---

## 🛠️ Teknologi & Stack

### Frontend
- **Next.js 16.4.3** – App Router, Server Components, Route Handlers.
- **React 19.3.0**
- **TypeScript** – End‑to‑end type safety.
- **Tailwind CSS 3** – Utility‑first styling.
- **Leaflet + React‑Leaflet** – Peta interaktif.

### Backend
- **Next.js API Routes** – Server‑side logic.
- **Prisma 6** – ORM untuk PostgreSQL.
- **PostgreSQL + PostGIS** – Penyimpanan data relasional & geospasial.
- **NextAuth v5** – Session JWT, proteksi route.
- **Zod** – Validasi schema request/response.

### DevOps
- **Docker & Docker‑Compose** – Containerisasi database + app.
- **Vitest** – Unit & integration testing.
- **ESLint** – Linting dengan konfigurasi standar.

---

## 📦 Instalasi

### Prasyarat
- **Node.js 20+**
- **Docker Desktop** (atau PostgreSQL + PostGIS secara terpisah)
- **npm** atau **yarn**

### Langkah‑langkah
```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/togather.git
cd togather

# 2. Install dependencies
npm install   # atau yarn install

# 3. Copy environment template
cp .env.example .env
#   Edit .env dengan kredensial PostgreSQL Anda atau gunakan Docker (see below)

# 4. Jalankan Docker (opsional)
docker compose up -d   # akan menyiapkan db dengan PostGIS

# 5. Migrate & seed database
npm run db:migrate
npm run db:seed

# 6. Start development server
npm run dev
```
Buka <http://localhost:3000> di browser.

---

## 🗂️ Struktur Proyek
```
togather/
├─ prisma/
│  ├─ migrations/          # Database migrations
│  ├─ schema.prisma        # Prisma schema (includes geography(Point))
│  └─ seed.ts              # Seed demo data
├─ public/
│  ├─ images/              # Assets – logo, hero, icons
│  └─ ...
├─ src/
│  ├─ app/                 # Next.js App Router (pages)
│  │  ├─ api/               # API routes (community, event, auth …)
│  │  ├─ discovery/        # Discovery map page
│  │  ├─ komunitas/        # Community list/detail
│  │  ├─ event/             # Event list/detail
│  │  ├─ login/            # Authentication UI
│  │  ├─ register/         # Registration UI
│  │  └─ landing/          # Public landing page
│  ├─ components/          # Re‑usable React components (Map, Card, Filter)
│  ├─ lib/                 # Utilities (auth, prisma client, zod schemas)
│  ├─ server/              # Business logic (communities.ts, events.ts, users.ts)
│  └─ types/               # TypeScript typings
├─ .env.example           # Template env file
├─ next.config.ts          # Next.js configuration
├─ tailwind.config.js      # Tailwind configuration (custom colors)
├─ tsconfig.json           # TypeScript config
└─ package.json           # Scripts & dependencies
```

---

## 🚀 Script yang Tersedia
```bash
# Development
npm run dev          # Start dev server
npm run build        # Build production bundle
npm run start        # Run production server

# Database
npm run db:migrate   # Apply migrations
npm run db:seed      # Seed demo data
npm run db:reset     # Drop & re‑seed
npm run db:studio    # Open Prisma Studio UI

# Lint & Type‑check
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking

# Testing
npm run test         # Vitest unit & integration tests
npm run test:watch   # Watch mode
npm run test:ui      # UI tests (if configured)
```

---

## 📍 Rute Aplikasi
### Public (tanpa otentikasi)
- `/` – Redirect ke `/landing` atau dashboard bila sudah login.
- `/landing` – Halaman pemasaran / introduksi.
- `/login` – Form login.
- `/register` – Form pendaftaran.

### Protected (memerlukan login)
- `/discovery` – Peta interaktif untuk temukan komunitas & event.
- `/komunitas` – Daftar komunitas.
- `/komunitas/[id]` – Detail komunitas, tombol *Join* atau *Request*.
- `/event` – Daftar event (filter: *Going*, *Saved*, *Past*).
- `/event/[id]` – Detail event, registrasi, kuota.
- `/profile` – Pengaturan profil, aktivasi nomor HP, kode pairing.

---

## 🎨 Design System (berdasarkan proposal)

### Palet Warna (60/30/10 Rule)
| Nama | Hex | Persentase | Penggunaan |
|------|-----|------------|------------|
| **Putih** | `#FFFFFF` | 60 % | Latar halaman, kartu, panel filter |
| **Ungu (Primary)** | `#7960D7` | 30 % | Header, navigasi aktif, marker komunitas, chip filter terpilih |
| **Abu‑Gelap** | `#1F2937` | 10 % | Heading, CTA utama, marker event, footer |
| **Abu‑Muted** | `#6B7280` | – | Teks sekunder, caption, label status |
| **Ungu‑Muda** | `#9F7AEA` | – | Badge status, tag kategori |

### Tipografi
- **Font Family:** *Inter* (import via Google Fonts).
- **Heading:** SemiBold / Bold (600‑700).
- **Body:** Regular (400).
- **Scale:** `text-4xl`, `text-2xl`, `text-base` sesuai hierarki.

### Komponen UI
- **Button Pill** – Rounded‑full, background primary, hover dengan opacity‑90.
- **Card** – Rounded‑lg, shadow‑sm, padding‑4, border‑muted.
- **Badge** – Rounded‑md, background secondary (Ungu‑Muda), text‑white.
- **Map Marker** – Lingkaran ungu untuk komunitas, persegi abu‑gelap untuk event.

---

## ❓ FAQ
**Q:** Apakah Togather dapat dijalankan di perangkat seluler?  
**A:** Ya. Aplikasi bersifat **responsive** dan didesain untuk bekerja baik di desktop, tablet, maupun smartphone.

**Q:** Bagaimana cara menghubungkan akun orang tua dengan anak?  
**A:** Di profil anak terdapat **Kode Pairing** 6‑digit. Masukkan kode tersebut pada *Parent Dashboard* > **Hubungkan Anak**.

**Q:** Apakah ada batasan wilayah?  
**A:** Versi MVP fokus pada **DIY (Yogyakarta, Sleman, Bantul, Kulon Progo, Gunungkidul)**. Batasan dapat diperluas di fase berikutnya.

**Q:** Bagaimana data lokasi disimpan?  
**A:** Menggunakan **PostGIS** – koordinat disimpan sebagai tipe `geography(Point,4326)`, memungkinkan query jarak dalam meter.

---

<p align="center">
  Dibuat dengan ❤️ oleh **Tim Azka Company** untuk komunitas DIY.
</p>
