# GIT PULL DULU SEBELUM MEMBUAT DAN SEBELUM NGEPUSH PROJECT WOI


# 🤝 Togather

**Togather** adalah platform discovery untuk komunitas dan event lokal di Yogyakarta dan sekitarnya (DIY - Daerah Istimewa Yogyakarta). Platform ini memudahkan pengguna untuk menemukan, bergabung dengan komunitas, dan mengikuti berbagai acara sesuai minat mereka.

## ✨ Fitur Utama

### 🗺️ **Discovery Map**
- Peta interaktif untuk menemukan komunitas dan event di sekitar Yogyakarta
- Filter berdasarkan kategori dan area (Kota Yogyakarta, Sleman, Bantul, Kulon Progo, Gunungkidul)
- Real-time location-based discovery

### 👥 **Manajemen Komunitas**
- Browse dan join komunitas sesuai minat
- Komunitas online dan offline
- Public dan private communities
- Profile komunitas dengan upcoming events

### 📅 **Event Management**
- Discover upcoming events
- Register untuk event
- Track events: Going, Saved, Past
- Event dengan quota management
- Integration dengan komunitas

### 🔐 **Authentication**
- Secure login dengan NextAuth v5
- Registration dengan profile setup
- Role-based access (User, Admin, Organizer)

### 🎨 **Modern UI/UX**
- Responsive design dengan Tailwind CSS
- Clean & intuitive interface
- Purple theme (#7960D7)
- Smooth animations & transitions

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 16.4.3** - React framework with App Router
- **React 19.3.0** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety
- **Leaflet & React-Leaflet** - Interactive maps

### **Backend**
- **Next.js API Routes** - Backend API
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database with PostGIS extension
- **NextAuth v5** - Authentication

### **Tools & Libraries**
- **Zod** - Schema validation
- **bcryptjs** - Password hashing
- **ESLint** - Code linting
- **PostGIS** - Geographic queries

## 📦 Installation

### Prerequisites
- Node.js 20+ 
- PostgreSQL 14+ with PostGIS extension
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/togather.git
cd togather
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create `.env` file:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/togather?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Seed password (optional)
SEED_DEMO_PASSWORD="demo123456"
```

### 4. Setup Database
```bash
# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎭 Demo Accounts

Setelah running seed, gunakan akun berikut untuk testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@togather.demo | demo123456 |
| User | user@togather.demo | demo123456 |
| Organizer | organizer@togather.demo | demo123456 |
| Incomplete | incomplete@togather.demo | demo123456 |

## 🗂️ Project Structure

```
togather/
├── prisma/
│   ├── migrations/          # Database migrations
│   ├── schema.prisma        # Prisma schema
│   └── seed.ts              # Database seeding
├── public/
│   └── logo-togather.png    # App logo
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes
│   │   ├── discovery/       # Discovery page
│   │   ├── komunitas/       # Community pages
│   │   ├── event/           # Event pages
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   └── landing/         # Landing page
│   ├── components/          # React components
│   │   ├── Map.tsx          # Leaflet map
│   │   └── Sidebar/         # Sidebar components
│   ├── lib/                 # Utilities
│   │   ├── auth.ts          # NextAuth config
│   │   ├── prisma.ts        # Prisma client
│   │   └── validations.ts   # Zod schemas
│   ├── server/              # Server functions
│   │   ├── communities.ts   # Community logic
│   │   ├── events.ts        # Event logic
│   │   └── users.ts         # User logic
│   └── types/               # TypeScript types
├── .env                     # Environment variables
├── .gitignore               # Git ignore rules
├── next.config.ts           # Next.js config
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind config
└── tsconfig.json            # TypeScript config
```

## 🚀 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:reset         # Reset database
npm run db:studio        # Open Prisma Studio

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking

# Testing
npm run test             # Run tests
npm run test:watch       # Watch mode
npm run test:ui          # Test UI
```

## 📍 Routes

### Public Routes
- `/` - Root (redirects based on auth)
- `/landing` - Landing page for guests
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (Auth Required)
- `/discovery` - Main discovery page with map
- `/komunitas` - Community list
- `/komunitas/[id]` - Community detail
- `/event` - Event list (Going/Saved/Past)
- `/event/[id]` - Event detail

### API Routes
- `/api/auth/*` - NextAuth endpoints
- `/api/communities` - Community CRUD
- `/api/communities/[id]` - Community detail
- `/api/events` - Event CRUD
- `/api/events/[id]` - Event detail

## 🗄️ Database Schema

### Key Models
- **User** - User accounts
- **UserProfile** - User profile information
- **Community** - Communities
- **CommunityMembership** - User-Community relations
- **Event** - Events
- **EventRegistration** - Event registrations
- **CommunityLocation** - Geographic locations (PostGIS)

### Categories
- Olahraga, Teknologi, Pendidikan
- Seni & Hiburan, Sosial, Lingkungan
- Bisnis & Karier, Hobi, Keagamaan, Lainnya

### Areas (DIY)
- Kota Yogyakarta
- Sleman
- Bantul
- Kulon Progo
- Gunungkidul

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Kalis**

---

**Built with ❤️ in Yogyakarta**
