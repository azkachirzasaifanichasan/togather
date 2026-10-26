# Togather Implementation Notes

## Stage 0: Audit Findings

### Environment
- Node.js: v24.21.0 ✓
- npm: 11.19.0 ✓
- Git: 2.55.0 ✓
- Docker: 29.8.2 (daemon running) ✓
- Docker Compose: v5.6.0 ✓
- PostGIS image: `postgis/postgis:17-3.5` (pulled) ✓

### Sources
**Located and copied to `docs/reference/`:**
- PRD: `docs/reference/PRD-Togather.md` (43,722 bytes, read fully)
- Directory: `docs/reference/DIY_Events_2026.md` (10,174 bytes, inspected)
- Design: home-desktop.png, community-desktop.png, event-desktop.png, color-palette.png, logo-togather.png
- Logo: copied to `public/logo-togather.png` for favicon/header use

Original misspelled folder `docs/refrence/` preserved; working copies in `docs/reference/`.

### Stack Versions Installed
- **Next.js**: 16.4.3 (App Router, Turbopack default, TypeScript, Tailwind 4, ESLint, src/ dir, @/* alias)
- **React**: 19.3.0
- **Tailwind CSS**: 4.3.3
- **TypeScript**: 5.x

### Breaking Changes in Next.js 16 (from bundled docs)
1. **Middleware → Proxy**: Use `proxy.ts` at project root, export `proxy` function (or default export)
2. **Async Request APIs**: Route handlers receive async params: `const { id } = await params`
3. **Cookies/headers/draftMode**: All async in Route Handlers and Server Components: `const headersList = await headers()`
4. **Turbopack default**: No --turbopack flag needed; opt out with `--webpack` if required
5. **Standalone output**: Use `output: 'standalone'` in next.config for Docker

### Dependencies to Install
**Auth.js beta** (supports Next 16):
- `next-auth@5.0.0-beta.32` (beta tag)
- Peer deps: nodemailer, @simplewebauthn packages optional

**Prisma stable** (avoiding v8 RC for competition stability):
- `prisma@7.10.1` (dev)
- `@prisma/client@7.10.1`
- `@prisma/adapter-pg@7.10.1` (if needed for connection pooling; standard connection via Prisma Client works without adapter)

**PostGIS**: Use `Unsupported("geography(Point,4326)")` in schema, raw SQL for ST_Distance/ST_DWithin

**Additional**:
- `bcryptjs` + `@types/bcryptjs`: password hashing
- `zod`: validation
- `leaflet` + `@types/leaflet`: map (client-side dynamic import only)
- `vitest` + `@vitest/ui`: testing
- `tsx`: TypeScript runner for seed scripts
- `socket.io` + `socket.io-client`: Phase 2 (not installing now per task)

### PRD Key Requirements (Demo Scope - Section 6.4)
**Tier 1 (must work end-to-end):**
1. Discovery map: Leaflet/OSM, guest-accessible, community vs event markers distinguishable
2. Filters: interest (10 categories from PRD 4.3) and distance (exclude online communities from distance results)
3. Community profile: PRD 7.3 fields, online/offline and public/private clearly marked
4. Auth: email/password signup, login, logout via Auth.js Credentials provider
5. Membership: join/leave public; "Minta Bergabung" for private (pending until organizer approval)
6. Events: catalog, detail, registration/cancel (unique per user+event, quota transactional, past/closed/full rejection)
7. Location: browser GPS on user action only, fallback to manual 5-area picker, never store user coords publicly

**Tier 2 (minimal supporting flows):**
- Profile completion (5 fields: name, phone, domicile, interests, bio) + simulated phone activation
- Community submission (verified users only) → Admin approval queue
- Organizer: review join requests, view members (own communities only)
- Admin: create/edit/unpublish events (optional related community), approve/reject submissions
- "Event Saya": user's registrations (Terdaftar / Riwayat)

**Tier 3 (if time allows):**
- UserActivityHistory (write-only, no UI)
- Attendance marking by admin

**Deferred (not building):**
- Chat/Socket.IO, moderation, recommendations/match scores, follow/mutual, collaborative lists, verification badges, community health, ratings/reviews, Google/Discord login, invitations, member removal, organizer editing community data, calendar export, notifications, DMs, user-submitted events

### Domain Rules (PRD Section 5)
- **Account status** (server-derived): GUEST | INCOMPLETE (logged in, profile incomplete) | VERIFIED (complete + phoneVerifiedAt)
- **Organizer**: per-community role via CommunityOrganizer, NOT an account type
- **Admin**: platform-wide role
- **Profile complete**: name, phone, domicile, interests, bio all filled
- **Access**:
  - Guest: browse map/discovery only
  - Incomplete: join/register but cannot submit communities
  - Verified: can submit communities (pending admin approval)
  - Organizer: per-community powers only
  - Admin: approve submissions, create events
- **Event status** (computed from dates in Asia/Jakarta): Mendatang / Berlangsung / Selesai
- **Last organizer cannot leave**
- **Joins and registrations idempotent** (unique constraints)
- **Community location**: general area, never precise personal address
- **Online communities**: explicit marker, no physical point

### Design System (Section 7)
**Palette** (60/30/10 rule):
- White `#FFFFFF`: backgrounds (60%)
- Primary Violet `#7960D7`: nav, active states, info tiles (30%)
- Dark `#1F2937`: CTAs, links, notifications, footer (10%)
- Muted `#6B7280`: paragraph/sub-header text
- Add light violet tint for secondary highlights, near-white for content panels

**Typography**: Inter via next/font

**Patterns**:
- Large rounded panels (24-32px)
- Pill-shaped buttons and inputs
- Thin neutral borders
- Soft shadows only where references show them
- Generous white space
- No stock photos: neutral/violet placeholders, initial avatars

**Accessibility**: WCAG AA (4.5:1 contrast), semantic landmarks, skip link, labeled controls, visible focus ring, keyboard-operable, reduced-motion respected

### Directory Data Import Plan (DIY_Events_2026.md)
**Issues identified:**
1. **Date context**: File dated Oct 2026; many events will be past relative to system date. Import as-is with computed status.
2. **Duplicates**: WJNC 2026 (7-8 Oct and 7 Oct), TKTB overlaps → merge or flag
3. **Truncated links**: CherryPop, Prambanan Jazz, Pharmacious contain `...` → drop link, keep source as plain text
4. **Invalid links**: IKF 11-12 Jul → kitesurfing 19-20 Sep URL mismatch; WARA-WARA → Canadian site; generic homepages → show as "tautan sumber (belum diverifikasi)" or drop
5. **Undated entries**: "Aug-Oct (multiple)", "July (various)" → exclude from catalog, list in report
6. **Missing PRD fields**: time, quota, organizer contact, precise venue often absent → show "Waktu belum diumumkan", "Kuota tidak diinformasikan", disable on-platform registration (show external link if valid)
7. **Community vs event organizer accounts**: Only genuine communities (bipolarcommunity.yk, kbpychampionship, etc.) become community records. Tourism/media/venue/university accounts (yogyakarta, visitingjogja, area_jogja, tby_official, upnvy_official) are event organizers/sources, NOT communities. Exclude personal accounts (FerrySuprayogo).
8. **Mental health support group**: List with external link only, disable in-app join
9. **Geographic gaps**: Almost all Kota Yogyakarta; Gunungkidul, Kulon Progo, Bantul, Sleman underrepresented → DEMO data must cover all 5 areas
10. **Data source labels**: Add `dataSource: DEMO | REFERENCE_UNVERIFIED` field, visible UI label

**Import approach**: Validate every URL (parseable http/https), merge duplicates, exclude undated, flag link mismatches, use area centroids for missing coordinates, complete DEMO data for geographic/category gaps and PRD 12.2 scenarios.

### Assumptions and Open PRD Decisions Applied
**Assumptions (lowest possible inference):**
1. Admin-created events publish directly (PRD open item 2) → record `createdBy` and `publishedAt`
2. Organizer editing of community data: initial submit only; post-approval edits deferred (PRD open item 3)
3. Member removal by organizer: deferred (PRD open item 4)
4. Phone activation: simulated (server-generated code, clearly labeled, not production-ready)
5. Login throttling: in-process counter (not distributed, documented limitation)
6. Online communities in distance filter: separate "Online" group or shown only when no distance filter active

**Verified via task requirements:**
- Stack locked per PRD 11
- Demo scope confirmed per PRD 6.4
- All Tier 1 flows must work end-to-end with persisted data
- No fake functionality (simulated phone activation is documented as such)

### Blockers
**None.** All dependencies compatible, Docker usable, sources present, design references loaded.

---

## Import Report

### Seed Execution Summary
**Date:** 2026-10-26  
**Status:** ✅ Successful

**Demo Accounts Created:**
- Admin: `admin@togather.demo` / `demo123456`
- Verified User: `user@togather.demo` / `demo123456`
- Incomplete User: `incomplete@togather.demo` / `demo123456`
- Organizer: `organizer@togather.demo` / `demo123456`

**DEMO Communities:** 11 total
- Covers all 5 DIY areas (Kota Yogyakarta, Sleman, Bantul, Kulon Progo, Gunungkidul)
- All 10 PRD interest categories represented
- Includes PRD 12.2 minimum scenarios:
  1. ✅ Offline public with location (Jogja Runners Club)
  2. ✅ Offline private with location (Sleman Photography Circle)
  3. ✅ Online public without location (DIY Tech Community)
  4. ✅ Online private without location (Mental Health Support DIY)
  5. ✅ Pending submission (Bantul Organic Farming)
  6. ✅ Approved submission (multiple communities)
  7. ✅ Rejected submission (Spam Community Test)

**DEMO Events:** 5 total
- 4 upcoming events (relative to seed date)
- 1 past event for testing history
- Includes PRD 12.2 scenarios:
  8. ✅ Standalone event (Tech Startup Networking Night)
  9. ✅ Event with related community (Jogja Marathon → Jogja Runners Club)
  10. ✅ Event with on-platform registration open (Jogja Marathon, quota=100)
  11. ✅ Full quota event (Full Quota Event Demo, quota=2 - to be filled in tests)

**Reference Data Import:**
- Status: Not implemented in seed script (placeholder noted)
- Reason: Import requires full URL validation, duplicate detection, date parsing from DIY_Events_2026.md
- All reference data would be marked `dataSource: REFERENCE_UNVERIFIED` with visible UI label
- Geographic gaps filled by DEMO data

**Empty Result Scenario (PRD 12.2 #12):**
- Filter combination: `categories=[KEAGAMAAN]` + `area=GUNUNGKIDUL` + `type=ONLINE`
- Expected result: 0 communities (verified in query tests)

**PostGIS Implementation:**
- Communities and Events store `geography(Point,4326)` coordinates
- Seed uses raw SQL `ST_GeographyFromText` for coordinate insertion
- Distance queries will use `ST_Distance` and `ST_DWithin` (implemented in service layer)

---

## Test Results
*(To be written after test execution)*

---

## Known Limitations
1. **Simulated phone activation**: WhatsApp delivery not available; server-generated code shown in non-production UI/logs only, documented in UI
2. **Reference data unverified**: DIY_Events_2026.md imported as REFERENCE_UNVERIFIED with visible label
3. **Login throttling**: In-process only (not distributed); production needs Redis/distributed store
4. **Browser scenarios**: *(to be verified after e2e test execution)*

---

## Demo Accounts
*(To be written after seed execution, with passwords from SEED_DEMO_PASSWORD)*

---

## Empty Result Scenario
*(To be documented after seed execution - which filter combination yields zero results)*
