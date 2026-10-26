# Togather

**Tagline:** Temukan komunitas dan event yang sesuai, mulai dari sekitarmu.

Platform web discovery komunitas dan event untuk seluruh Daerah Istimewa Yogyakarta (DIY).

---

## 🎯 Demo Scope (Competition Build)

Implementasi ini mengikuti **PRD Section 6.4 (Demo Scope)** dengan fokus pada fitur yang dapat didemonstrasikan end-to-end dengan data persisten.

### ✅ Tier 1: Fully Implemented
1. **Discovery Map** - Leaflet/OSM, guest-accessible, community vs event markers distinguishable
2. **Filters** - Interest categories (10 PRD categories) and distance filtering
3. **Community Profile** - All PRD 7.3 fields, online/offline and public/private clearly marked
4. **Auth** - Email/password signup, login, logout via Auth.js
5. **Membership** - Join/leave public communities, request to join private communities
6. **Events** - Catalog, detail pages, registration status display
7. **Location** - Manual area picker (5 DIY areas), GPS request not yet implemented

### ⚠️ Tier 2: Partially Implemented
- **Profile Completion** - Service layer ready, UI not built (time constraint)
- **Community Submission** - Service layer ready, UI not built
- **Organizer Functions** - Service layer ready, UI not built
- **Admin Functions** - Service layer ready, UI not built
- **Event Saya** - Service layer ready, UI not built

### ❌ Tier 3: Not Implemented
- UserActivityHistory (write-only)
- Attendance marking

---

## 🚀 Quick Start

### Prerequisites
- Node.js 24.21.0 or 22.18+
- Docker Desktop (daemon running)
- Git

### 1. Clone and Install
```bash
cd C:\Users\kalis\Togather
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/togather?schema=public"
AUTH_SECRET="aFNHWm9OSG5SckZ4QzRlYm04NjFKcE1zNWdhZmlrVnE="
NEXTAUTH_URL="http://localhost:3000"
SEED_DEMO_PASSWORD="demo123456"
```

### 3. Start Database
```bash
docker compose up -d db
```

Wait ~5 seconds for PostgreSQL to be ready.

### 4. Run Migrations and Seed
```bash
npm run db:migrate
npm run db:seed
```

### 5. Start Dev Server
```bash
npm run dev
```

Visit http://localhost:3000 (or 3001 if port 3000 is in use).

---

## 👤 Demo Accounts

All accounts use password: **`demo123456`**

| Email | Role | Status | Description |
|-------|------|--------|-------------|
| `admin@togather.demo` | Admin | VERIFIED | Full platform access, can approve submissions and create events |
| `user@togather.demo` | User | VERIFIED | Can join communities, register for events, submit communities |
| `incomplete@togather.demo` | User | INCOMPLETE | Logged in but profile incomplete, cannot submit communities |
| `organizer@togather.demo` | Organizer | VERIFIED | Manages multiple communities, can review join requests |

---

## 📊 Seeded Data

### Communities (11 DEMO communities)
- **Geographic Coverage:** All 5 DIY areas (Kota Yogyakarta, Sleman, Bantul, Kulon Progo, Gunungkidul)
- **Categories:** All 10 PRD interest categories
- **Types:** Online (4) and Offline (7)
- **Access:** Public (8) and Private (3)
- **Submission Status:** Approved (9), Pending (1), Rejected (1)

### Events (5 DEMO events)
- **Upcoming:** 4 events with future dates
- **Past:** 1 event for testing history
- **Registration:** 2 with open registration (1 with quota, 1 unlimited)
- **Standalone:** 1 event without related community
- **Related:** 2 events linked to communities

### Empty Result Scenario
**Filter combination for zero results:**
- Categories: `[KEAGAMAAN]`
- Area: `GUNUNGKIDUL`
- Type: `ONLINE`

This combination yields 0 communities (documented per PRD 12.2 #12).

---

## 🏗️ Tech Stack (Locked per PRD)

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 16.4.3 |
| React | React | 19.3.0 |
| Styling | Tailwind CSS | 4.3.3 |
| Map | Leaflet + OpenStreetMap | 1.9.4 |
| Backend API | Next.js Route Handlers | (built-in) |
| Auth | Auth.js (NextAuth v5 beta) | 5.0.0-beta.32 |
| ORM | Prisma | 6.19.3 |
| Database | PostgreSQL + PostGIS | 17-3.5 |
| Container | Docker + Docker Compose | - |
| Validation | Zod | 3.24.1 |
| Testing | Vitest | 2.1.8 |
| TypeScript | TypeScript | 5.x |

**Notable Decisions:**
- **Prisma 6.19.3** instead of 7.x (v7 has breaking datasource config changes unsuitable for competition timeline)
- **Auth.js beta** required for Next.js 16 compatibility
- **PostGIS** via Docker (not installed locally)

---

## 📁 Project Structure

```
C:\Users\kalis\Togather\
├── docs/
│   ├── reference/              # PRD, DIY directory, design assets
│   └── IMPLEMENTATION_NOTES.md # Audit findings, assumptions, limitations
├── prisma/
│   ├── schema.prisma           # Full domain model (User, Community, Event, etc.)
│   ├── migrations/             # Initial migration with PostGIS extension
│   └── seed.ts                 # Idempotent seed script
├── public/
│   └── logo-togather.png       # Logo for header/footer/favicon
├── src/
│   ├── app/
│   │   ├── api/                # Route Handlers (communities, events)
│   │   ├── event/[id]/         # Event detail page
│   │   ├── komunitas/[id]/     # Community detail page
│   │   ├── page.tsx            # Discovery page (home)
│   │   ├── layout.tsx          # Root layout with Inter font
│   │   └── globals.css         # Tailwind theme tokens
│   ├── components/
│   │   └── Map.tsx             # Leaflet map (client-side dynamic import)
│   ├── lib/
│   │   ├── auth.ts             # Auth.js configuration
│   │   ├── prisma.ts           # Prisma Client singleton
│   │   └── validations.ts      # Zod schemas
│   ├── server/
│   │   ├── auth.ts             # Account status helpers (requireUser, etc.)
│   │   ├── communities.ts      # Community service layer
│   │   ├── events.ts           # Event service layer
│   │   ├── membership.ts       # Membership service layer
│   │   ├── users.ts            # User profile service
│   │   └── admin.ts            # Admin operations service
│   ├── types/
│   │   └── next-auth.d.ts      # Auth.js type extensions
│   └── middleware.ts           # Auth.js middleware (Next 16 uses proxy.ts, not migrated)
├── .env.example                # Environment template
├── docker-compose.yml          # PostGIS database + app service
├── Dockerfile                  # Production build with standalone output
└── package.json                # Dependencies and scripts
```

---

## 🔑 Key Features Implemented

### 1. Discovery Map
- **Leaflet integration** with OpenStreetMap tiles
- **Dynamic import** (client-side only, no SSR)
- **Distinguishable markers:**
  - Community = Violet circle (`#7960D7`)
  - Event = Dark square (`#1F2937`)
- **Popup on click** with name and type
- **Navigation to detail pages**
- **Map legend** visible in sidebar

### 2. Filters
- **Interest Categories:** 10 PRD categories with Indonesian labels
- **Area Filter:** 5 DIY administrative areas
- **Live updates:** Refetch data on filter change
- **Reset button** to clear all filters
- **Empty state** with helpful message

### 3. PostGIS Distance Queries
- **ST_GeographyFromText** for coordinate insertion
- **ST_Distance** for distance calculation (meters)
- **ST_DWithin** for radius filtering
- **Online communities excluded** from distance results (service layer logic)

### 4. Business Rules (Server-Side Enforcement)
- **Account Status:** GUEST | INCOMPLETE | VERIFIED (derived from DB)
- **Last organizer cannot leave** community
- **Quota enforcement** for event registration (transactional)
- **Past events reject registration**
- **Private communities** require join request approval
- **Pending/rejected communities** hidden from discovery

### 5. Design System
- **Color Palette:** White (60%), Primary Violet (30%), Dark (10%)
- **Typography:** Inter font via next/font
- **Shapes:** Pill buttons, large rounded panels (24-32px)
- **Accessibility:** Semantic HTML, WCAG AA contrast checked, reduced-motion support

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Discovery map loads with markers
- [ ] Filters update results correctly
- [ ] Empty result scenario displays message
- [ ] Community detail shows all PRD 7.3 fields
- [ ] Event detail shows quota and status correctly
- [ ] Online communities don't show physical location
- [ ] Data source labels visible (DEMO / REFERENCE_UNVERIFIED)

### Automated Tests (Not Implemented - Time Constraint)
Test infrastructure ready:
```bash
npm run test        # Run Vitest
npm run test:watch  # Watch mode
npm run test:ui     # UI mode
```

**Planned test coverage:**
- Unit: Account status logic, quota enforcement, distance filtering
- Integration: Join/leave flows, registration flows, admin approval
- Security: Authorization checks, guest blocking, role restrictions

---

## 🐳 Docker Deployment

### Local Development
```bash
docker compose up -d db    # Database only
npm run dev                # Next.js dev server
```

### Full Docker Deployment
```bash
docker compose up --build
```

Runs migrations automatically via `docker-compose.yml` entrypoint.

**Access:** http://localhost:3000

---

## 📝 npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start dev server (Turbopack) |
| `build` | `next build` | Production build (standalone output) |
| `start` | `next start` | Start production server |
| `lint` | `eslint` | Run ESLint |
| `typecheck` | `tsc --noEmit` | TypeScript type checking |
| `db:migrate` | `prisma migrate dev` | Run migrations |
| `db:seed` | `tsx prisma/seed.ts` | Populate database |
| `db:reset` | `prisma migrate reset --force` | Reset DB and re-seed |
| `db:studio` | `prisma studio` | Open Prisma Studio GUI |
| `test` | `vitest run` | Run tests once |
| `test:watch` | `vitest` | Run tests in watch mode |
| `test:ui` | `vitest --ui` | Open Vitest UI |

---

## 🚨 Known Limitations (Documented per PRD)

### 1. **Simulated Phone Activation**
WhatsApp delivery not available. Server generates 6-digit code shown in logs (demo only).
- UI clearly labels this as "simulasi aktivasi"
- `phoneVerifiedAt` set server-side on any valid 6-digit code
- **NOT production-ready**

### 2. **Reference Data Import**
DIY_Events_2026.md not parsed in seed script.
- Placeholder noted in seed output
- All validation rules documented in IMPLEMENTATION_NOTES
- All data currently marked `dataSource: DEMO`

### 3. **Login Throttling**
In-process counter only (not distributed).
- Production needs Redis or distributed store
- Documented in IMPLEMENTATION_NOTES

### 4. **Browser GPS Request**
Not implemented (UI shows manual area picker only).
- PRD requires "after user action, never on page load"
- Fallback to manual picker works per PRD 5.5

### 5. **Middleware Warning**
Next.js 16 recommends `proxy.ts` instead of `middleware.ts`.
- Current `middleware.ts` works but shows deprecation warning
- Migration command: `npx @next/codemod@canary middleware-to-proxy .`
- **Non-blocking** for demo

---

## 📚 Documentation References

- **PRD:** `docs/reference/PRD-Togather.md` (authority for requirements)
- **Implementation Notes:** `docs/IMPLEMENTATION_NOTES.md` (audit, assumptions, limitations)
- **Design Assets:** `docs/reference/design/` (color palette, screenshots, logo)
- **Directory Data:** `docs/reference/DIY_Events_2026.md` (reference events/communities)

---

## 🔐 Security Notes

- **Passwords hashed** with bcrypt (10 rounds)
- **JWT sessions** via Auth.js (SameSite cookies)
- **Input validation** with Zod on all mutations
- **Authorization checks** server-side (never trust client)
- **No secrets in repo** (.env in .gitignore)
- **SQL injection prevention** via Prisma parameterized queries
- **PostGIS raw SQL** uses template literals (safe for demo, needs parameterization for production)

---

## 🤝 Contributing

This is a competition demo build. For handover or continuation:

1. Read `docs/IMPLEMENTATION_NOTES.md` for context and assumptions
2. Check `docs/reference/PRD-Togather.md` for deferred features (Tier 2/3)
3. Review service layer (`src/server/`) for business logic
4. Test with demo accounts before adding features
5. Run `npm run db:reset` to get clean seed data

---

## 📄 License

Competition project - License TBD by team.

---

## 🙏 Acknowledgments

- **PRD Author:** Team Togather
- **Design Assets:** Team Togather
- **Reference Data:** DIY_Events_2026.md compilation
- **Tech Stack:** As locked per PRD Section 11
- **Map Tiles:** OpenStreetMap contributors

---

**Last Updated:** 2026-10-26  
**Competition:** UINIC 8.0  
**Build Status:** Demo-ready with documented limitations
