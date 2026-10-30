# API CONTRACT v1 — Togather

**Status:** frozen contract for WS-1 (backend) ↔ WS-2 (frontend).
**Version:** 1.0
**Last verified against runtime:** see §9.

This document is the source of truth for every HTTP endpoint the backend exposes or will expose.
Frontend developers may rely on the paths, methods, status codes and payload shapes described here.

---

## 1. How to run the project

### 1.1 Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL + PostGIS)

### 1.2 Start the database

```powershell
Start-Process 'C:\Users\USER\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'
Start-Sleep -Seconds 20
docker compose up -d db
```

Expected: container `togather_db` (`postgis/postgis:17-3.5`) reports `Up ... (healthy)` on port `5432`.

### 1.3 Migrate and seed

```powershell
npx prisma migrate status   # expect: "Database schema is up to date!"
npm run db:seed
```

> **WARNING — `npm run db:seed` DELETES ALL DATA**
> The seed script runs `deleteMany()` on every table before inserting demo data. Never run it
> against a database that holds data you want to keep, and never run it during a live demo
> without explicit permission. `npm run db:reset` is **not** supported for this project.

### 1.4 Run the dev server

```powershell
npm run dev
```

The app is served on `http://localhost:3000`. Verify the backend is up:

```powershell
Invoke-WebRequest -Uri 'http://localhost:3000/api/communities' -UseBasicParsing
```

Expected: HTTP `200`.

### 1.5 Demo accounts

| Email | Password | Role | Profile state |
|---|---|---|---|
| `Togather@gmail.com` | `Togather30` | admin (`isAdmin = true`) | complete, phone verified |
| `operator@togather.demo` | `demo123456` | operator / organizer | complete, phone verified |
| `user@togather.demo` | `demo123456` | plain user | **incomplete** — no phone verification, no domicile, no address |

"Operator" is not a stored role: it is a user whose profile is complete (verified phone +
domicile + address). "Admin" is the `isAdmin` flag. The admin credentials are fixed by the
product requirement, so they are not derived from `SEED_DEMO_PASSWORD`.

The `user@` account is deliberately left incomplete so the `INCOMPLETE -> VERIFIED`
progression can be demonstrated end to end.

### 1.6 Demo data produced by the seed

- 11 communities: 9 `APPROVED`, 1 `PENDING` (`Bantul Organic Farming`), 1 `REJECTED` (`Spam Community Test`).
- 5 events: 4 upcoming/ongoing, 1 past (`Sleman Photography Workshop`).
- Community coverage per area: `KOTA_YOGYAKARTA`, `SLEMAN`, `BANTUL`, `KULON_PROGO`, `GUNUNGKIDUL`.
- `Full Quota Event Demo` (quota 2) is **pre-filled with 2 active registrations** by
  `organizer@togather.demo` and `admin@togather.demo`, so "event is full" can be demonstrated
  immediately.
- `user@togather.demo` has one active registration on an upcoming event
  (`Tech Startup Networking Night`), so `/event-saya?status=TERDAFTAR` has content.
- `user@togather.demo` has one registration **plus an attendance record** on the past event
  (`Sleman Photography Workshop 2026`), so `/event-saya?status=RIWAYAT` has content.
- `incomplete@togather.demo` has one **PENDING** join request on the private community
  `Jogja Startup Founders`, which is organized by `organizer@togather.demo`, so the
  organizer review flow can be demonstrated.
- `Bantul Organic Farming` stays `PENDING`, so the admin approval flow has a resource to review.

The seed is **idempotent**: it deletes every row before inserting, so running it two or three
times always produces exactly the same result.

---

## 2. Error format

**Every** non-2xx response uses exactly this envelope. There are no exceptions.

```json
{
  "error": {
    "code": "EVENT_FULL",
    "message": "Event is full"
  }
}
```

- `error.code` — a stable, machine-readable `SCREAMING_SNAKE_CASE` string. Branch on this.
- `error.message` — a human-readable sentence (Indonesian is acceptable). Never branch on this.

Additional optional field:

- `error.details` — present on `422 VALIDATION_ERROR` only. It contains the Zod issue list
  (`{ path: string[], message: string, code: string }[]`). Clients should surface it in forms.

### 2.1 Status code table

| HTTP | `error.code` | When it is returned |
|---|---|---|
| 401 | `UNAUTHORIZED` | Not logged in, or session expired. |
| 403 | `FORBIDDEN` | Logged in, but not allowed: not an admin, not an organizer of that community, or profile not verified. |
| 403 | `PROFILE_NOT_VERIFIED` | Action requires a `VERIFIED` profile (e.g. submitting a community). |
| 404 | `NOT_FOUND` | Resource does not exist, or exists but is not public (e.g. a `PENDING` community). |
| 404 | `COMMUNITY_NOT_FOUND` | Community id does not resolve to an approved community. |
| 404 | `EVENT_NOT_FOUND` | Event id does not resolve to a published event. |
| 409 | `CONFLICT` | Generic state conflict (e.g. already reviewed). |
| 409 | `EVENT_FULL` | Event quota is already reached. |
| 409 | `REGISTRATION_CLOSED` | `registrationOpen` is `false` for the event. |
| 409 | `EVENT_ENDED` | The event has already started/ended. |
| 409 | `LAST_ORGANIZER` | The last organizer of a community tried to leave it. |
| 422 | `VALIDATION_ERROR` | Request body or query parameters failed schema validation. |
| 500 | `INTERNAL_ERROR` | Unexpected server error. The response never contains a stack trace. |

`EVENT_FULL`, `REGISTRATION_CLOSED`, `EVENT_ENDED` and `LAST_ORGANIZER` are all `409 Conflict`
because they represent a conflict with the current state of the resource.

---

## 3. Success shapes

These shapes are stable and must not change without a version bump.

| Kind | Shape |
|---|---|
| Community list | `{ "communities": CommunitySummary[] }` |
| Event list | `{ "events": EventSummary[] }` |
| Community detail | the community object itself (no wrapper) |
| Event detail | the event object itself (no wrapper) |
| Mutation | `{ "success": true, ... }` plus endpoint-specific fields |

List responses are always wrapped in a named key. Detail responses are always the raw object.
Mutations always include `success: true` on success.

---

## 4. Event field consistency

### 4.1 Canonical name

The canonical field for an event's title is **`name`**.

### 4.2 `title` is a deprecated alias

`title` is a **temporary alias** that exists only so that `src/app/discovery/page.tsx`
(owned by the frontend team) can keep reading `e.title` while it is being migrated.

- `title` **always equals** `name`. They are never different values.
- `title` is marked **deprecated**.
- **Do not build new features on `title`.** Use `name`.
- `title` **will be removed** in a future contract version once the frontend has migrated to `name`.
  The removal will be announced in this document before it happens.

Both the event **list** and the event **detail** response include `name`.
Both the event **list** and the event **detail** response include the deprecated `title` alias.

### 4.3 Coordinates

Both the event list and the event detail return `latitude` and `longitude` as
`number | null`. They are derived from the PostGIS `geography(Point,4326)` column
(`ST_Y` = latitude, `ST_X` = longitude).

A response must never contain coordinates only inside a nested `location` object without
also exposing the flat `latitude` / `longitude` fields. `null` means "no location recorded".

---

## 5. Authentication and authorization rules

| Rule | Meaning |
|---|---|
| **Public** | No session required. |
| **Logged in** | A valid session is required. The account does **not** need to be verified. |
| **VERIFIED** | A valid session **and** a complete profile with a verified phone number. |
| **ADMIN** | A valid session and `user.isAdmin === true`. |
| **ORGANIZER** | A valid session and the user is an organizer of **that specific community**. Admins are organizers everywhere. |

### 5.1 Per-endpoint access

| Endpoint | Access |
|---|---|
| `GET /api/communities` | Public |
| `GET /api/communities/[id]` | Public |
| `GET /api/events` | Public |
| `GET /api/events/[id]` | Public |
| `POST /api/communities` | VERIFIED |
| `POST /api/communities/[id]/join` | Logged in |
| `DELETE /api/communities/[id]/join` | Logged in |
| `POST /api/events/[id]/rsvp` | Logged in |
| `DELETE /api/events/[id]/rsvp` | Logged in |
| `GET /api/me` | Logged in |
| `PATCH /api/me/profile` | Logged in |
| `POST /api/me/phone/activate` | Logged in |
| `GET /api/me/events` | Logged in |
| `GET /api/me/communities` | Logged in |
| `GET /api/admin/submissions` | ADMIN |
| `POST /api/admin/submissions/[id]/approve` | ADMIN |
| `POST /api/admin/submissions/[id]/reject` | ADMIN |
| `GET /api/admin/communities` | ADMIN |
| `PATCH /api/admin/communities/[id]` | ADMIN |
| `DELETE /api/admin/communities/[id]` | ADMIN |
| `GET /api/organizer/join-requests` | ORGANIZER (of at least one community) |
| `POST /api/organizer/join-requests/[id]/review` | ORGANIZER of that request's community, or ADMIN |
| `GET /api/organizer/communities/[id]/members` | ORGANIZER of that community, or ADMIN |

---

## 6. Public endpoints

### 6.1 `GET /api/communities`

Returns approved communities only. A community is visible only if it has a
`CommunitySubmission` row with `status = "APPROVED"`. There is no "approved OR missing submission"
fallback — a community without an approved submission is never returned.

**Query parameters** (all optional, all repeatable where noted):

| Param | Type | Notes |
|---|---|---|
| `categories` | enum `InterestCategory` | **Repeatable**: `?categories=OLAHRAGA&categories=HOBI`. Matches if the community has **any** of the listed categories. |
| `area` | enum `Area` | `KOTA_YOGYAKARTA`, `SLEMAN`, `BANTUL`, `KULON_PROGO`, `GUNUNGKIDUL`. |
| `type` | `ONLINE` \| `OFFLINE` | |
| `accessType` | `PUBLIC` \| `PRIVATE` | |
| `search` | string, **min 2 characters** | Case-insensitive match on `name` OR `description`. A bare `?searook` (valueless unknown parameter) is also accepted as the search term, so `?searook` and `?search=searook` behave identically. |
| `sw_lat`, `sw_lng`, `ne_lat`, `ne_lng` | number | Bounding box. All four must be present or none are applied. |
| `lat`, `lng` | number | User location, used for distance computation. |
| `distance` | number, km | Radius around `lat`/`lng`. |

Empty values (`?area=`, `?search=`) are treated as **no filter**, not as a validation error.

> **Distance filter excludes ONLINE communities.** When a distance filter is active, only
> `OFFLINE` communities inside the radius are returned. An online community has no physical
> location, so a distance result would be misleading. Without a distance filter, online
> communities are listed normally. The same rule applies to `GET /api/events`.

**Response `200`:**

```json
{
  "communities": [
    {
      "id": "clx...",
      "name": "Jogja Runners Club",
      "description": "Komunitas lari untuk semua level...",
      "type": "OFFLINE",
      "accessType": "PUBLIC",
      "categories": ["OLAHRAGA"],
      "externalLinks": [],
      "dataSource": "DEMO",
      "area": "KOTA_YOGYAKARTA",
      "addressText": "Alun-Alun Kidul, Kota Yogyakarta",
      "latitude": -7.8127,
      "longitude": 110.3645,
      "memberCount": 1,
      "distance": 1.23
    }
  ]
}
```

`distance` (km) is only present when `lat` + `lng` were supplied.

**Errors:** `422 VALIDATION_ERROR` (malformed filter), `500 INTERNAL_ERROR`.

### 6.2 `GET /api/communities/[id]`

Returns the public detail DTO for one approved community.

**Response `200`** — a raw object with exactly these fields:

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `name` | string | |
| `description` | string | |
| `type` | `ONLINE` \| `OFFLINE` | |
| `accessType` | `PUBLIC` \| `PRIVATE` | |
| `categories` | `InterestCategory[]` | |
| `externalLinks` | `string[]` | |
| `dataSource` | `DEMO` \| `REFERENCE_UNVERIFIED` | Provenance label for the UI badge. |
| `area` | `Area \| null` | |
| `addressText` | `string \| null` | |
| `latitude` | `number \| null` | |
| `longitude` | `number \| null` | |
| `memberCount` | number | |
| `isMember` | boolean | `false` for anonymous callers. |
| `joinRequestStatus` | `PENDING` \| `APPROVED` \| `REJECTED` \| null | The caller's pending join-request state for a private community. `null` otherwise. |

**Never returned:** `submission` (and therefore `submission.userId`, `submission.reviewedBy`,
`submission.rejectionReason`), organizer email addresses, or any other user email.
The response body must not contain the `@` character.

**Errors:** `404 NOT_FOUND` (unknown id, or the community is not `APPROVED` — a `PENDING`
community is indistinguishable from a non-existent one).

### 6.3 `GET /api/events`

Returns published events. By default only `MENDATANG` (upcoming) and `BERLANGSUNG` (ongoing)
events are returned.

**Query parameters:**

| Param | Type | Notes |
|---|---|---|
| `categories` | enum `InterestCategory` | **Repeatable**. |
| `area` | enum `Area` | |
| `status` | `MENDATANG` \| `BERLANGSUNG` \| `SELESAI` | Events only. Overrides the default. |
| `search` | string, min 2 chars | Case-insensitive match on `name`, `description` or `organizer`. Bare `?term` also accepted. |
| `startDate` | ISO datetime | Only events starting at or after this instant. |
| `sw_lat`, `sw_lng`, `ne_lat`, `ne_lng` | number | Bounding box. |
| `lat`, `lng` | number | User location for distance. |
| `distance` | number, km | Radius around `lat`/`lng`. |

Status semantics:

- no `status` → `MENDATANG` + `BERLANGSUNG` only.
- `status=MENDATANG` → upcoming only.
- `status=BERLANGSUNG` → ongoing only.
- `status=SELESAI` → past only.

**Response `200`:**

```json
{
  "events": [
    {
      "id": "clx...",
      "name": "Jogja Marathon 2026",
      "title": "Jogja Marathon 2026",
      "description": "Marathon tahunan di Yogyakarta...",
      "category": "OLAHRAGA",
      "startDate": "2026-11-11T05:00:00.000Z",
      "endDate": "2026-11-11T05:00:00.000Z",
      "startTime": "05:00 WIB",
      "venue": "Alun-Alun Kidul",
      "area": "KOTA_YOGYAKARTA",
      "organizer": "Jogja Runners Club",
      "contactInfo": "marathon@jogjahomepage.jpg",
      "quota": 100,
      "registrationOpen": true,
      "fee": "Rp 150.000",
      "externalLink": null,
      "latitude": -7.8127,
      "longitude": 110.3645,
      "attendeeCount": 0,
      "status": "MENDATANG",
      "relatedCommunities": [{ "id": "clx...", "name": "Jogja Runners Club" }]
    }
  ]
}
```

**Errors:** `422 VALIDATION_ERROR`, `500 INTERNAL_ERROR`.

### 6.4 `GET /api/events/[id]`

Returns the public detail DTO for one published event.

**Response `200`** — a raw object with exactly these fields:

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `name` | string | Canonical title. |
| `title` | string | **Deprecated** alias, identical to `name`. |
| `description` | string | |
| `category` | `InterestCategory` | |
| `dataSource` | `DEMO` \| `REFERENCE_UNVERIFIED` | Provenance label for the UI badge. |
| `startDate` | ISO datetime | |
| `endDate` | ISO datetime \| null | |
| `startTime` | string \| null | |
| `venue` | string \| null | |
| `area` | `Area \| null` | |
| `organizer` | string | |
| `contactInfo` | string \| null | |
| `quota` | number \| null | `null` means unlimited. |
| `registrationOpen` | boolean | |
| `fee` | string \| null | |
| `externalLink` | string \| null | |
| `latitude` | `number \| null` | |
| `longitude` | `number \| null` | |
| `attendeeCount` | number | Active (not cancelled) registrations. |
| `status` | `MENDATANG` \| `BERLANGSUNG` \| `SELESAI` | Computed from the dates. |
| `isRegistered` | boolean | `false` for anonymous callers. |
| `relatedCommunities` | `{ id, name }[]` | |

**Never returned:** `createdBy`, `dataSource`, or any internal Prisma bookkeeping field.

**Errors:** `404 NOT_FOUND` (unknown id or unpublished event), `500 INTERNAL_ERROR`.

---

## 7. Account endpoints

All endpoints in this section require a logged-in session (`401 UNAUTHORIZED` otherwise).
The user identity is always taken from the **session**, never from the request body.

### 7.1 `GET /api/me`

**Response `200`:**

```json
{
  "user": {
    "name": "Budi Santoso",
    "email": "user@togather.demo",
    "avatarUrl": null,
    "isAdmin": false
  },
  "status": "INCOMPLETE",
  "userId": "clx...",
  "isAdmin": false,
  "isComplete": false,
  "profile": {
    "name": "Budi Santoso",
    "phone": null,
    "phoneVerifiedAt": null,
    "domicile": null,
    "address": null,
    "avatarUrl": null,
    "interests": [],
    "bio": null
  }
}
```

- `user` is a **fresh** snapshot for the header/account dropdown (`name`, `email`,
  `avatarUrl`, `isAdmin`). The JWT only carries what was true at login time, so the avatar
  would be stale after a profile change.
- `status` is one of `GUEST` (no session), `INCOMPLETE`, `VERIFIED`.
- `profile` is `null` when the account has no profile row yet.
- **`passwordHash` is never returned.** No endpoint in this contract ever returns it.

**Errors:** `401 UNAUTHORIZED`, `500 INTERNAL_ERROR`.

### 7.2 `PATCH /api/me/profile`

**Body** (validated with `updateProfileSchema`, all fields required):

```json
{
  "name": "Budi Santoso",
  "phone": "+6281234567891",
  "domicile": "SLEMAN",
  "address": "Jl. Malioboro No. 1, Kota Yogyakarta",
  "interests": ["OLAHRAGA"],
  "bio": "Minimal 10 karakter, maksimal 500 karakter."
}
```

| Field | Rule |
|---|---|
| `name` | string, 1–100 chars |
| `phone` | string matching `/^(\+62\|0)[0-9]{9,12}$/` |
| `domicile` | `Area` enum |
| `address` | string, 5–300 chars |
| `interests` | non-empty array of `InterestCategory` |
| `bio` | string, 10–500 chars |

**Response `200`:** the updated profile object (same shape as `profile` in `GET /api/me`,
including `address` and `avatarUrl`).
**Never** returns `passwordHash`.

**Errors:** `401 UNAUTHORIZED`, `422 VALIDATION_ERROR`, `500 INTERNAL_ERROR`.

### 7.3 `POST /api/me/phone/activate`

**Body:**

```json
{ "code": "123456" }
```

`code` must be exactly 6 characters.

> **This is a simulation.** In production this would send an OTP over WhatsApp and verify the
> code server-side. In this build **any 6-digit code is accepted** and simply sets
> `phoneVerifiedAt` to the current time. It is not a real verification and must not be treated
> as one. This limitation is intentional for the demo and is documented here on purpose.

**Response `200`:**

```json
{ "success": true, "message": "Phone activated successfully" }
```

**Errors:** `401 UNAUTHORIZED`, `422 VALIDATION_ERROR` (code is not 6 characters),
`500 INTERNAL_ERROR`.

### 7.4 `GET /api/me/events`

**Query parameters:**

| Param | Type | Notes |
|---|---|---|
| `status` | `TERDAFTAR` \| `RIWAYAT` | Optional. `TERDAFTAR` = upcoming + ongoing registrations. `RIWAYAT` = past registrations. Omit for all. |

Any other value → `422 VALIDATION_ERROR`.

**Response `200`:**

```json
{
  "events": [
    {
      "registrationId": "clx...",
      "registeredAt": "2026-10-26T00:00:00.000Z",
      "cancelledAt": null,
      "attended": null,
      "event": {
        "id": "clx...",
        "name": "Jogja Marathon 2026",
        "title": "Jogja Marathon 2026",
        "description": "...",
        "category": "OLAHRAGA",
        "startDate": "2026-11-11T05:00:00.000Z",
        "endDate": "2026-11-11T05:00:00.000Z",
        "startTime": "05:00 WIB",
        "venue": "Alun-Alun Kidul",
        "area": "KOTA_YOGYAKARTA",
        "latitude": -7.8127,
        "longitude": 110.3645,
        "status": "MENDATANG",
        "relatedCommunities": [{ "id": "clx...", "name": "Jogja Runners Club" }]
      }
    }
  ]
}
```

**Errors:** `401 UNAUTHORIZED`, `422 VALIDATION_ERROR`, `500 INTERNAL_ERROR`.

### 7.5 `GET /api/me/communities`

Returns the communities the caller has joined plus the communities they organize.

**Response `200`:**

```json
{
  "communities": [
    {
      "id": "clx...",
      "name": "Jogja Runners Club",
      "description": "...",
      "type": "OFFLINE",
      "accessType": "PUBLIC",
      "categories": ["OLAHRAGA"],
      "area": "KOTA_YOGYAKARTA",
      "addressText": "Alun-Alun Kidul, Kota Yogyakarta",
      "latitude": -7.8127,
      "longitude": 110.3645,
      "memberCount": 1,
      "joinedAt": "2026-10-26T00:00:00.000Z",
      "isOrganizer": true
    }
  ]
}
```

**Errors:** `401 UNAUTHORIZED`, `500 INTERNAL_ERROR`.

### 7.6 `POST /api/communities`

Submits a new community for admin approval. Requires a **VERIFIED** profile.

An **ADMIN** caller is exempt from the profile requirement, and the community is
approved immediately (`submissionStatus: "APPROVED"`) with the admin as its first
organizer and member.

**Body** (validated with `createCommunitySchema`):

```json
{
  "name": "Komunitas Sepeda Jogja",
  "description": "Minimal 20 karakter, maksimal 2000 karakter.",
  "type": "OFFLINE",
  "accessType": "PUBLIC",
  "categories": ["OLAHRAGA", "HOBI"],
  "externalLinks": ["https://example.com"],
  "area": "KOTA_YOGYAKARTA",
  "addressText": "Alun-Alun Kidul",
  "coordinates": { "lat": -7.8127, "lng": 110.3645 }
}
```

`area`, `addressText`, `coordinates` and `externalLinks` are optional.
`coordinates` is `{ lat: number (-90..90), lng: number (-180..180) }`.

**Response `201`:**

```json
{
  "success": true,
  "communityId": "clx...",
  "submissionStatus": "PENDING"
}
```

**Errors:** `401 UNAUTHORIZED`, `403 PROFILE_NOT_VERIFIED` (profile incomplete or phone not verified),
`422 VALIDATION_ERROR`, `500 INTERNAL_ERROR`.

---

## 8. Membership and event registration endpoints

### 8.1 `POST /api/communities/[id]/join`

Joins a public community, or creates a join request for a private one. **Idempotent**:
calling it twice never produces an error.

**Response `200` — one of:**

```json
{ "success": true, "status": "joined" }
{ "success": true, "status": "already_member" }
{ "success": true, "status": "request_created" }
{ "success": true, "status": "request_exists", "requestStatus": "PENDING" }
```

`status` values:

| `status` | Meaning |
|---|---|
| `joined` | Membership created (public community). |
| `already_member` | The caller is already a member. |
| `request_created` | A join request was created (private community). |
| `request_exists` | A join request already exists. `requestStatus` carries its state. |

**Errors:** `401 UNAUTHORIZED`, `404 COMMUNITY_NOT_FOUND` (unknown or not approved),
`500 INTERNAL_ERROR`.

### 8.2 `DELETE /api/communities/[id]/join`

Leaves a community. **Idempotent**: leaving a community you are not in is a success, not an error.

**Response `200` — one of:**

```json
{ "success": true, "status": "left" }
{ "success": true, "status": "not_member" }
```

**Errors:** `401 UNAUTHORIZED`, `409 LAST_ORGANIZER` (the caller is the only organizer of the
community and therefore cannot leave), `500 INTERNAL_ERROR`.

### 8.3 `POST /api/events/[id]/rsvp`

Registers the caller for an event. **Idempotent**.

The quota is enforced inside a **serializable** transaction, so a full event can never be
over-subscribed, even under concurrent requests.

**Response `200` — one of:**

```json
{ "success": true, "status": "registered" }
{ "success": true, "status": "already_registered" }
{ "success": true, "status": "re_registered" }
```

`re_registered` is returned when the caller had previously cancelled and is registering again.

**Errors:** `401 UNAUTHORIZED`, `404 EVENT_NOT_FOUND`, `409 EVENT_FULL` (quota reached),
`409 REGISTRATION_CLOSED` (`registrationOpen` is `false`), `409 EVENT_ENDED` (event already
started/ended), `500 INTERNAL_ERROR`.

### 8.4 `DELETE /api/events/[id]/rsvp`

Cancels the caller's registration. **Idempotent**.

**Response `200` — one of:**

```json
{ "success": true, "status": "cancelled" }
{ "success": true, "status": "not_registered" }
```

**Errors:** `401 UNAUTHORIZED`, `500 INTERNAL_ERROR`.

---

## 9. Admin endpoints

All endpoints in this section require an **ADMIN** session.
A logged-in non-admin receives `403 FORBIDDEN`; an anonymous caller receives `401 UNAUTHORIZED`.

### 9.1 `GET /api/admin/submissions`

**Query parameters:**

| Param | Type | Notes |
|---|---|---|
| `status` | `PENDING` \| `APPROVED` \| `REJECTED` | Optional. Defaults to `PENDING`. |

**Response `200`:**

```json
{
  "submissions": [
    {
      "id": "clx...",
      "communityId": "clx...",
      "userId": "clx...",
      "status": "PENDING",
      "submittedAt": "2026-10-26T00:00:00.000Z",
      "reviewedAt": null,
      "reviewedBy": null,
      "rejectionReason": null,
      "community": {
        "id": "clx...",
        "name": "Bantul Organic Farming",
        "description": "...",
        "type": "OFFLINE",
        "accessType": "PUBLIC",
        "categories": ["LINGKUNGAN"],
        "area": "BANTUL",
        "addressText": "Wilayah Bantul",
        "latitude": -7.8875,
        "longitude": 110.3287
      },
      "submitter": {
        "id": "clx...",
        "email": "user@togather.demo",
        "name": "Budi Santoso",
        "phone": "+6281234567891"
      }
    }
  ]
}
```

**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `422 VALIDATION_ERROR`, `500 INTERNAL_ERROR`.

### 9.2 `POST /api/admin/submissions/[id]/approve`

Approves a pending community submission. On success the submitter becomes the first
**organizer** and the first **member** of the community.

**Body:** none.

**Response `200`:**

```json
{ "success": true, "status": "approved", "communityId": "clx..." }
```

The operation is **idempotent**: if the organizer/membership rows already exist, the call
still succeeds and does not raise a unique-constraint error.

**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 NOT_FOUND` (unknown id, or already reviewed),
`500 INTERNAL_ERROR`.

### 9.3 `POST /api/admin/submissions/[id]/reject`

**Body:**

```json
{ "rejectionReason": "Deskripsi komunitas belum jelas." }
```

`rejectionReason` is required and must be **at least 10 characters** and at most 500.

**Response `200`:**

```json
{ "success": true, "status": "rejected" }
```

**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 NOT_FOUND` (unknown id, or already reviewed),
`422 VALIDATION_ERROR` (missing or too-short `rejectionReason`),
`500 INTERNAL_ERROR`.

### 9.4 `GET /api/admin/events`

Lists every event (published and unpublished) for the admin event manager.

**Response `200`:**

```json
{
  "events": [
    {
      "id": "clx...",
      "name": "Jogja Marathon 2026",
      "description": "...",
      "category": "OLAHRAGA",
      "dataSource": "DEMO",
      "startDate": "2026-11-11T05:00:00.000Z",
      "endDate": "2026-11-11T05:00:00.000Z",
      "startTime": "05:00 WIB",
      "venue": "Alun-Alun Kidul",
      "area": "KOTA_YOGYAKARTA",
      "organizer": "Jogja Runners Club",
      "contactInfo": "marathon@jogjahomepage.jpg",
      "quota": 100,
      "registrationOpen": true,
      "fee": "Rp 150.000",
      "externalLink": null,
      "isPublished": true,
      "createdBy": "clx...",
      "publishedAt": "2026-10-26T00:00:00.000Z",
      "attendeeCount": 12,
      "relatedCommunities": [{ "id": "clx...", "name": "Jogja Runners Club" }],
      "registrations": [
        {
          "id": "clx...",
          "userId": "clx...",
          "registeredAt": "2026-10-26T00:00:00.000Z",
          "attended": null,
          "user": { "id": "clx...", "email": "user@togather.demo", "name": "Budi Santoso" }
        }
      ]
    }
  ]
}
```

`registrations` contains the **active** (not cancelled) registrations, each with its
`attended` flag, so the admin can mark attendance without a second request.

**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `500 INTERNAL_ERROR`.

### 9.5 `POST /api/admin/events`

Creates an event. The event is published immediately (`isPublished: true`).

**Body** (validated with `createEventSchema`):

```json
{
  "name": "Konser Komunitas",
  "description": "Deskripsi event minimal 20 karakter.",
  "category": "SENI_DAN_HIBURAN",
  "startDate": "2026-12-01T10:00:00.000Z",
  "endDate": null,
  "startTime": "10:00 WIB",
  "venue": "Balai Kota",
  "area": "KOTA_YOGYAKARTA",
  "coordinates": { "lat": -7.8127, "lng": 110.3645 },
  "organizer": "Panitia Demo",
  "contactInfo": "panitia@example.com",
  "quota": 50,
  "registrationOpen": true,
  "fee": "Gratis",
  "externalLink": null,
  "relatedCommunityId": null,
  "dataSource": "DEMO"
}
```

Every optional field also accepts `null`, because HTML forms submit empty selects and inputs
as `null` rather than omitting the key.

**Response `201`:**

```json
{ "success": true, "eventId": "clx...", "isPublished": true }
```

**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `422 VALIDATION_ERROR`, `500 INTERNAL_ERROR`.

### 9.6 `PATCH /api/admin/events/[id]`

Updates an existing event. Admin only.

**Body** (validated with `updateEventSchema` — every field optional):

```json
{ "name": "Konser Komunitas (revisi)", "isPublished": false }
```

Setting `isPublished: false` **unpublishes** the event: it disappears from
`GET /api/events` and `GET /api/events/[id]` returns `404`, but the row and its
registrations are kept.

**Response `200`:**

```json
{ "success": true, "eventId": "clx...", "isPublished": false }
```

**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `422 VALIDATION_ERROR`, `500 INTERNAL_ERROR`.

### 9.7 `POST /api/admin/events/registrations/[id]/attendance`

Marks (or unmarks) attendance for one event registration. Admin only.

**Body:**

```json
{ "attended": true }
```

**Response `200`:**

```json
{ "success": true, "registrationId": "clx...", "attended": true }
```

Calling it twice with the same value is safe — the attendance row is upserted.

**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 NOT_FOUND` (unknown registration id),
`422 VALIDATION_ERROR` (missing/invalid `attended`), `500 INTERNAL_ERROR`.

### 9.8 `GET /api/admin/communities`

Lists every community regardless of submission status (approved, pending, rejected, or
none), with counts. Admin only.

**Response `200`:**

```json
{
  "communities": [
    {
      "id": "clx...",
      "name": "Sleman Youth Islamic Study",
      "description": "...",
      "type": "OFFLINE",
      "accessType": "PUBLIC",
      "categories": ["KEAGAMAAN"],
      "area": "SLEMAN",
      "addressText": "Jl. ...",
      "createdAt": "2026-10-29T11:17:34.999Z",
      "memberCount": 12,
      "organizerCount": 2,
      "eventCount": 3,
      "submission": {
        "id": "clx...",
        "status": "APPROVED",
        "submittedAt": "2026-10-29T11:17:34.999Z",
        "rejectionReason": null
      }
    }
  ]
}
```

`submission` is `null` when the community has no submission row. `area`/`addressText`
are `null` for online communities.

**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `500 INTERNAL_ERROR`.

### 9.9 `PATCH /api/admin/communities/[id]`

Rewrites a community's fields. Admin only. Every field is optional; only the fields sent
are changed.

**Body:**

```json
{
  "name": "New name",
  "description": "New description",
  "type": "OFFLINE",
  "accessType": "PUBLIC",
  "categories": ["OLAHRAGA"],
  "area": "SLEMAN",
  "addressText": "Jl. Kaliurang Km 5"
}
```

Switching `type` to `ONLINE` clears `area` and `addressText`. Switching to `OFFLINE`
stores the ones provided.

**Response `200`:**

```json
{ "success": true, "communityId": "clx..." }
```

**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 COMMUNITY_NOT_FOUND`,
`422 VALIDATION_ERROR`, `500 INTERNAL_ERROR`.

### 9.10 `DELETE /api/admin/communities/[id]`

Hard-deletes a community. Admin only. Location, organizers, memberships, join requests,
submission and event links cascade; the events themselves are kept.

**Response `200`:**

```json
{ "success": true }
```

**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 COMMUNITY_NOT_FOUND`, `500 INTERNAL_ERROR`.

---

## 10. Organizer endpoints

### 10.1 `GET /api/organizer/join-requests`

Lists pending join requests for every community the caller organizes.

**Response `200`:**

```json
{
  "requests": [
    {
      "id": "clx...",
      "communityId": "clx...",
      "userId": "clx...",
      "status": "PENDING",
      "requestedAt": "2026-10-26T00:00:00.000Z",
      "reviewedAt": null,
      "reviewedBy": null,
      "community": { "id": "clx...", "name": "Jogja Startup Founders" },
      "user": {
        "id": "clx...",
        "email": "incomplete@togather.demo",
        "name": "Ani Wijaya",
        "interests": []
      }
    }
  ]
}
```

**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN` (the caller organizes no community),
`500 INTERNAL_ERROR`.

### 10.2 `POST /api/organizer/join-requests/[id]/review`

**Body:**

```json
{ "action": "APPROVE" }
```

`action` is `APPROVE` or `REJECT`. On `APPROVE`, a membership row is created for the requester.

**Response `200`:**

```json
{ "success": true, "status": "approved" }
```

The caller must be an organizer **of the community the request belongs to**, or an admin.
Being an organizer of a *different* community is not sufficient and returns `403 FORBIDDEN`.

**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 NOT_FOUND` (unknown request id, or
already reviewed), `422 VALIDATION_ERROR` (missing/invalid `action`), `500 INTERNAL_ERROR`.

### 10.3 `GET /api/organizer/communities/[id]/members`

Lists the members of one community.

**Response `200`:**

```json
{
  "members": [
    {
      "id": "clx...",
      "communityId": "clx...",
      "userId": "clx...",
      "joinedAt": "2026-10-26T00:00:00.000Z",
      "user": {
        "id": "clx...",
        "email": "user@togather.demo",
        "name": "Budi Santoso",
        "interests": ["OLAHRAGA"]
      }
    }
  ]
}
```

The caller must be an organizer of **that** community, or an admin.

**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 NOT_FOUND` (unknown community),
`500 INTERNAL_ERROR`.

---

## 11. Auth endpoints

| Endpoint | Method | Access | Status |
|---|---|---|---|
| `/api/auth/signin` | `GET` | Public | NextAuth v5 built-in flow. |
| `/api/auth/signin/google` | `POST` | Public | Only available when Google is configured. See below. |
| `/api/auth/callback/credentials` | `POST` | Public | NextAuth v5 built-in flow. |
| `/api/auth/callback/google` | `GET` | Public | Google OAuth callback. |
| `/api/auth/session` | `GET` | Public | Returns the current session, or `null`. |
| `/api/auth/csrf` | `GET` | Public | Returns `{ "csrfToken": "..." }`. |
| `/api/auth/providers` | `GET` | Public | Returns the **active** providers as a map, e.g. `{ "credentials": {...} }`. |
| `/api/auth/signout` | `POST` | Logged in | NextAuth v5 built-in flow. |
| `/api/auth/register` | `POST` | Public | Creates an account. |

These are provided by NextAuth v5 and are **not** part of the error-envelope contract
(NextAuth returns its own error bodies). Do not rely on the `error.code` envelope for them.

### 11.1 Sign-in methods

Two sign-in methods are supported:

1. **Email + password** — always active. The password is a bcrypt hash stored in
   `User.passwordHash`.
2. **Google OAuth** — active **only** when `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are
   set in the environment.

The frontend must **not** hard-code the presence of a social button. Read
`GET /api/auth/providers` and only render a social button for the providers that are
actually listed. The `/login` and `/register` pages already do this.

### 11.2 Google OAuth setup

```env
AUTH_GOOGLE_ID="your-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-client-secret"
```

Create the credentials at <https://console.cloud.google.com/apis/credentials> and add this
**Authorized redirect URI**:

```text
http://localhost:3000/api/auth/callback/google
```

When the credentials are **not** set, the Google provider is not registered at all. The app
still boots and email/password sign-in keeps working — no configuration error is thrown.

### 11.3 Account linking

When a person signs in with Google:

- If the Google account is already linked to a Togather user (via the `Account` table), that
  user is used.
- Otherwise, if a Togather user already exists with the **same email**, the Google account is
  **linked** to that user. The person can then use either sign-in method.
- Otherwise a **new** user is created with an empty profile, so the account starts in the
  `INCOMPLETE` state and has to be completed first.

An OAuth-only account cannot be used with the email/password provider: its `passwordHash` is
a random value that nobody knows.

The `session.user.id` returned to the API is always the **Togather** user id, never the
Google subject id.

---

## 12. Implementation status

All endpoints listed below are **implemented** and verified at runtime.

| Endpoint | Method | Status |
|---|---|---|
| `/api/communities` | GET | implemented |
| `/api/communities` | POST | implemented |
| `/api/communities/[id]` | GET | implemented |
| `/api/communities/[id]/join` | POST | implemented |
| `/api/communities/[id]/join` | DELETE | implemented |
| `/api/events` | GET | implemented |
| `/api/events/[id]` | GET | implemented |
| `/api/events/[id]/rsvp` | POST | implemented |
| `/api/events/[id]/rsvp` | DELETE | implemented |
| `/api/me` | GET | implemented |
| `/api/me/profile` | PATCH | implemented |
| `/api/me/phone/activate` | POST | implemented |
| `/api/me/events` | GET | implemented |
| `/api/me/communities` | GET | implemented |
| `/api/admin/submissions` | GET | implemented |
| `/api/admin/submissions/[id]/approve` | POST | implemented |
| `/api/admin/submissions/[id]/reject` | POST | implemented |
| `/api/admin/events` | GET | implemented |
| `/api/admin/events` | POST | implemented |
| `/api/admin/events/[id]` | PATCH | implemented |
| `/api/admin/events/registrations/[id]/attendance` | POST | implemented |
| `/api/admin/communities` | GET | implemented |
| `/api/admin/communities/[id]` | PATCH | implemented |
| `/api/admin/communities/[id]` | DELETE | implemented |
| `/api/organizer/join-requests` | GET | implemented |
| `/api/organizer/join-requests/[id]/review` | POST | implemented |
| `/api/organizer/communities/[id]/members` | GET | implemented |

---

## 13. Changelog

### v1.2 — coordination with WS-2/WS-3

- **Demo accounts changed.** `admin@togather.demo` / `organizer@togather.demo` /
  `incomplete@togather.demo` are replaced by `Togather@gmail.com` (admin),
  `operator@togather.demo` (organizer) and `user@togather.demo` (plain, deliberately
  incomplete). See §1.5.
- **`UserProfile` gained two fields**: `address` (required by the profile schema) and
  `avatarUrl`. Both are returned by `GET /api/me` and `PATCH /api/me/profile`.
- **`GET /api/me` gained a `user` block** (`name`, `email`, `avatarUrl`, `isAdmin`) so the
  header dropdown can show a fresh avatar — the JWT only carries what was true at login.
- **`isComplete` now means "verified phone + domicile + address"** (the organizer gate),
  not the old five-field rule. `GET /api/me` derives it from `status` so there is a single
  source of truth.
- **A bare `?term` is accepted as the search term** on both discovery endpoints, so
  `?searook` works as well as `?search=searook`.
- **`GET /api/events` detail includes `dataSource`** (the provenance label), like the
  community endpoints. It still never includes `createdBy`.

### v1.1 — gap closure

- **`dataSource` is now part of the public payload** for communities, events and the
  community detail. It carries the provenance label (`DEMO` | `REFERENCE_UNVERIFIED`) that
  PRD 4.3 / implementation notes item 10 requires the UI to display. The frontend should
  render it as a visible source badge.
- **A distance filter excludes ONLINE communities.** With `lat` + `lng` + `distance`, only
  `OFFLINE` records inside the radius are returned. Online records have no physical location,
  so a distance result would be misleading. Without a distance filter, online records are
  listed normally.
- **`GET /api/events` now honours `lat` / `lng` / `distance`** and returns a `distance`
  field in km, sorted nearest-first. The `bounds` parameters are still accepted.
- **Admin event management** is now available:
  `GET /api/admin/events`, `POST /api/admin/events`, `PATCH /api/admin/events/[id]`
  (including unpublishing via `isPublished: false`) and
  `POST /api/admin/events/registrations/[id]/attendance`.
- **Optional body fields accept `null`.** `createEventSchema` and `createCommunitySchema`
  now use `nullish()` for every optional field, because HTML forms submit empty selects and
  inputs as `null` instead of omitting the key. Previously that produced a `422`.
- **Google OAuth is supported.** It is registered only when `AUTH_GOOGLE_ID` and
  `AUTH_GOOGLE_SECRET` are set; otherwise the provider is absent and email/password sign-in
  is unaffected. The frontend reads `GET /api/auth/providers` to decide which buttons to
  render. The dead "Continue with Discord" button was removed (no provider existed for it).
- **OAuth account linking** is implemented through a new `Account` table (migration
  `20261220000000_add_oauth_account`). A Google account is linked to an existing Togather
  user with the same email, or creates a new one. `session.user.id` is always the Togather
  user id.

### v1.0

- Initial frozen contract.
- `name` is the canonical event title field. `title` is a **deprecated** alias kept only for
  `src/app/discovery/page.tsx`; it will be removed once the frontend migrates to `name`.
- `title` and `name` are always equal.
- Event list and detail both expose flat `latitude` / `longitude`.
- Phone activation is a **simulation**: any 6-digit code is accepted.
- All errors use the `{ "error": { "code", "message" } }` envelope.
- Quota enforcement uses a serializable transaction; a full event returns `409 EVENT_FULL`.
- Join / RSVP and their DELETE counterparts are idempotent.

### v1.0 — verification record

**Verified on:** 2026-10-28 (WS-1 backend pass, runtime + database).

Every endpoint above was exercised over HTTP against a live dev server and cross-checked with
direct PostgreSQL queries. Verified behaviours:

| Area | Verified result |
|---|---|
| Discovery filters | `area`, `categories` (repeatable), `type`, `accessType`, `search`, `status` all filter correctly; empty values (`?area=`) are ignored, invalid values return `422`. |
| Approved-only | A `PENDING` community returns `404` on its detail endpoint and never appears in the list. |
| No data leaks | The community detail body contains no `submission`, `reviewedBy`, `userId` or `@` (email). The event detail body contains no `createdBy` and no `dataSource`. |
| Idempotency | `POST` join twice → `already_member`; `DELETE` join twice → `not_member`; `POST` RSVP twice → `already_registered`; `DELETE` RSVP twice → `not_registered`. |
| Quota | The quota is enforced in a `Serializable` transaction. Under 4 concurrent registrations against a quota of 2, exactly 2 succeeded and 2 returned `409 EVENT_FULL`; the database never exceeded the quota. |
| Organizer rules | The last organizer leaving a community returns `409 LAST_ORGANIZER`. An organizer leaving while another organizer remains succeeds and also removes the organizer row. |
| Authorization | Admin routes return `403` for non-admins; organizer routes are **community-scoped** — organizing a different community returns `403`. |
| Idempotent approval | Approving a submission whose organizer/membership rows already exist returns `200` with no unique-constraint error. |
| Account safety | `userId` in a request body is ignored; the session identity always wins. `passwordHash` never appears in any response. |

**Decisions recorded:**

1. **`name` is canonical, `title` is deprecated.** `title` remains in the event list *and* detail
   for now so `src/app/discovery/page.tsx` keeps working. It will be removed in a future contract
   version after the frontend migrates to `name`.
2. **Phone activation is a simulation.** Any 6-digit code is accepted and sets `phoneVerifiedAt`.
   This is not a real verification and must not be treated as one.
3. **Coordinates are flat.** Both list and detail return `latitude` / `longitude` as
   `number | null`, never only inside a nested location object.
4. **Approved-only, always.** A community is visible only with an `APPROVED` submission. There is
   no "approved or missing submission" fallback.
5. **`DELETE` on membership and registration is idempotent**, returning `not_member` /
   `not_registered` rather than an error.

