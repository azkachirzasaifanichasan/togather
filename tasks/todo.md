# Task List: Community Profile Images and Banners

## Phase 1: Database & Backend Foundation

### Task 1: Add avatarUrl and bannerUrl fields to Community Prisma model
**Description:** Add two optional string fields to the Community model for storing image URLs.
**Acceptance criteria:**
- [x] `avatarUrl String?` field added to Community model
- [x] `bannerUrl String?` field added to Community model
- [x] Prisma client regenerates without errors
**Verification:**
- [x] `npx prisma generate` succeeds
- [x] TypeScript types include new fields
**Dependencies:** None
**Files likely touched:**
- `prisma/schema.prisma`
**Estimated scope:** XS

### Task 2: Create and run database migration
**Description:** Generate and apply migration for new community image fields.
**Acceptance criteria:**
- [x] Migration file created
- [x] Migration applied to database successfully
- [x] Existing communities have NULL for new fields
**Verification:**
- [x] `npx prisma migrate dev` succeeds
- [x] Database schema shows new columns
**Dependencies:** Task 1
**Files likely touched:**
- `prisma/migrations/*`
**Estimated scope:** XS

### Task 3: Create community image upload API endpoint
**Description:** Create `/api/upload/community` endpoint for avatar and banner uploads with validation.
**Acceptance criteria:**
- [x] Endpoint accepts multipart form data with `avatar` and/or `banner` fields
- [x] Validates file types: JPG, JPEG, PNG, WebP only
- [x] Validates file size: max 5MB per image
- [x] Saves files to `public/uploads/communities/`
- [x] Returns URLs in format `/uploads/communities/{uuid}.{ext}`
- [x] Checks magic bytes for security
**Verification:**
- [x] POST with valid images returns 200 with URLs
- [x] POST with invalid type returns 400
- [x] POST with oversized file returns 400
- [x] Files appear in public/uploads/communities/
**Dependencies:** Task 2
**Files likely touched:**
- `src/app/api/upload/community/route.ts` (new)
**Estimated scope:** S

### Task 4: Update community server functions to include avatarUrl/bannerUrl
**Description:** Modify getDiscoveryCommunities, getCommunityProfileById, getCommunityById, getPublicCommunityById, getUserCommunities to return new fields.
**Acceptance criteria:**
- [x] CommunitySummary type includes avatarUrl and bannerUrl
- [x] All community fetch functions return the new fields
- [x] TypeScript compiles without errors
**Verification:**
- [x] TypeScript build succeeds
- [x] API responses include new fields
**Dependencies:** Task 1
**Files likely touched:**
- `src/server/communities.ts`
**Estimated scope:** S

### Task 5: Update createCommunitySchema validation
**Description:** Add optional avatarUrl and bannerUrl fields to the community creation schema.
**Acceptance criteria:**
- [x] createCommunitySchema accepts avatarUrl (string, URL format, optional)
- [x] createCommunitySchema accepts bannerUrl (string, URL format, optional)
- [x] Validation passes for valid URLs, fails for invalid
**Verification:**
- [x] Zod schema parses correctly
- [x] TypeScript types updated
**Dependencies:** Task 1
**Files likely touched:**
- `src/lib/validations.ts`
**Estimated scope:** XS

### Task 6: Update submitCommunity to save avatarUrl and bannerUrl
**Description:** Modify the submitCommunity function to persist avatarUrl and bannerUrl from input.
**Acceptance criteria:**
- [x] Community created with avatarUrl when provided
- [x] Community created with bannerUrl when provided
- [x] Fields remain NULL when not provided
**Verification:**
- [x] Create community API returns community with image URLs
- [x] Database records show saved URLs
**Dependencies:** Task 3, Task 5
**Files likely touched:**
- `src/server/communities.ts` (submitCommunity function)
**Estimated scope:** XS

## Phase 2: Frontend Upload Components

### Task 7: Create CommunityImageUpload component
**Description:** Build a reusable component for uploading community avatar/banner with preview, drag-drop, loading, and error states.
**Acceptance criteria:**
- [x] Component accepts `type: 'avatar' | 'banner'` prop
- [x] Shows circular preview for avatar, landscape for banner
- [x] Displays initial placeholder when no image
- [x] Click to upload, shows file input
- [x] Shows loading spinner during upload
- [x] Shows error message on failure
- [x] Allows remove/change image
- [x] Calls onChange callback with uploaded URL
**Verification:**
- [x] Component renders correctly for both types
- [x] Upload works and returns URL
- [x] Preview updates immediately
- [x] Error handling works
**Dependencies:** Task 3
**Files likely touched:**
- `src/components/communities/CommunityImageUpload.tsx` (new)
**Estimated scope:** M

### Task 8: Integrate image upload into CreateCommunityForm
**Description:** Add avatar and banner upload sections to the community creation form.
**Acceptance criteria:**
- [x] Avatar upload near community name (circular, shows initials as fallback)
- [x] Banner upload in landscape format with 16:9 hint
- [x] Both have preview before submit
- [x] Images included in form submission
- [x] Initials update when name changes (avatar fallback)
- [x] Form submits successfully with images
**Verification:**
- [x] Form displays both upload areas
- [x] Preview works for both
- [x] Submit creates community with images
- [x] Images appear on community list and detail pages
**Dependencies:** Task 7, Task 6
**Files likely touched:**
- `src/app/komunitas/buat/CreateCommunityForm.tsx`
**Estimated scope:** M

### Task 9: Add preview, loading states, and error handling
**Description:** Polish the upload UX with proper states and feedback.
**Acceptance criteria:**
- [x] Immediate preview after file selection (before upload)
- [x] Loading indicator during upload
- [x] Success toast/notification
- [x] Clear error messages for: invalid type, too large, upload failed
- [x] Disable submit while uploads in progress
- [x] Responsive on mobile
**Verification:**
- [x] All states work visually
- [x] No layout shift during upload
- [x] Mobile layout works
**Dependencies:** Task 8
**Files likely touched:**
- `src/components/communities/CommunityImageUpload.tsx`
- `src/app/komunitas/buat/CreateCommunityForm.tsx`
**Estimated scope:** S

## Phase 3: Display Integration

### Task 10: Update community list page to use banner as card thumbnail
**Description:** Replace gradient background with community banner image on community cards.
**Acceptance criteria:**
- [x] Card uses bannerUrl as background image with object-fit: cover
- [x] Falls back to auto-thumbnail when no banner
- [x] Falls back to gradient when no auto-thumbnail
- [x] Avatar displayed as small circle overlay
- [x] Layout unchanged otherwise
- [x] Images load without layout shift
**Verification:**
- [x] Community cards show banners
- [x] Fallback works for communities without banners
- [x] No visual regression
**Dependencies:** Task 4
**Files likely touched:**
- `src/app/komunitas/page.tsx`
**Estimated scope:** S

### Task 11: Update community detail page to use community's banner and avatar
**Description:** Replace hardcoded Unsplash image with community's banner, show avatar in header.
**Acceptance criteria:**
- [x] Hero banner uses community.bannerUrl with object-fit: cover
- [x] Avatar shown next to community name (or in header)
- [x] Falls back to auto-thumbnail when no banner
- [x] Falls back to gradient when no auto-thumbnail
- [x] Avatar falls back to initials
**Verification:**
- [x] Detail page shows correct banner
- [x] Avatar displayed correctly
- [x] Fallbacks work
**Dependencies:** Task 4
**Files likely touched:**
- `src/app/komunitas/[id]/page.tsx`
**Estimated scope:** S

### Task 12: Implement automatic thumbnail fallback system
**Description:** Create a mapping from category/keywords to relevant curated images for communities without custom images.
**Acceptance criteria:**
- [x] Mapping object: category → curated image URL
- [x] Keyword-based matching for community names
- [x] Function getCommunityThumbnail(community) returns best image URL
- [x] Used as fallback on list and detail pages
- [x] Images are relevant (running for sports, code for tech, books for education, etc.)
**Verification:**
- [x] "Jogja Runners Club" → running image
- [x] "DIY Tech Community" → tech image
- [x] "DIY Book Club" → book image
- [x] "Gunungkidul Batik" → batik/craft image
- [x] Unknown category → generic community image
**Dependencies:** Task 10, Task 11
**Files likely touched:**
- `src/lib/community-images.ts` (new)
- `src/app/komunitas/page.tsx`
- `src/app/komunitas/[id]/page.tsx`
**Estimated scope:** M

## Phase 4: Admin & Edit Support

### Task 13: Update admin community edit to support image changes
**Description:** Allow admins to update community avatar and banner in admin edit page.
**Acceptance criteria:**
- [x] Admin edit form shows current avatar/banner
- [x] Can upload new images
- [x] Can remove images
- [x] Changes saved to database
**Verification:**
- [x] Admin can update images
- [x] Changes reflect on public pages
**Dependencies:** Task 3, Task 14
**Files likely touched:**
- `src/app/admin/komunitas/[id]/edit/page.tsx`
**Estimated scope:** S

### Task 14: Update updateCommunitySchema and updateCommunityAsAdmin
**Description:** Add avatarUrl and bannerUrl to admin update schema and service.
**Acceptance criteria:**
- [x] updateCommunitySchema includes optional avatarUrl, bannerUrl
- [x] updateCommunityAsAdmin saves image URLs
- [x] Can clear images by sending null/empty
**Verification:**
- [x] Admin API updates images correctly
- [x] TypeScript compiles
**Dependencies:** Task 5
**Files likely touched:**
- `src/lib/validations.ts`
- `src/server/admin.ts`
**Estimated scope:** XS

## Phase 5: Testing & Polish

### Task 15: Test complete flow: create community with images
**Description:** End-to-end test of community creation with both avatar and banner.
**Acceptance criteria:**
- [x] Create community with avatar + banner
- [x] Verify images on list page card
- [x] Verify images on detail page
- [x] Verify images persist after refresh
**Verification:**
- [x] Build succeeds
- [x] TypeScript compiles
**Dependencies:** Task 8, Task 10, Task 11
**Estimated scope:** S

### Task 16: Test edge cases
**Description:** Test various edge cases for robustness.
**Acceptance criteria:**
- [x] Create community with only avatar
- [x] Create community with only banner
- [x] Create community with no images (uses fallbacks)
- [x] Upload invalid file type (shows error)
- [x] Upload file > 5MB (shows error)
- [x] Replace existing image
- [x] Remove image
**Verification:**
- [x] All edge cases handled gracefully
**Dependencies:** Task 15
**Estimated scope:** M

### Task 17: Verify existing communities still work
**Description:** Ensure backward compatibility with communities created before this feature.
**Acceptance criteria:**
- [x] Existing communities without images show fallbacks
- [x] No errors in console
- [x] All community pages load correctly
- [x] Member counts, categories, etc. unchanged
**Verification:**
- [x] Browse existing communities
- [x] Check detail pages
**Dependencies:** Task 2
**Estimated scope:** S

### Task 18: Clean up and documentation
**Description:** Final cleanup, remove unused code, add comments.
**Acceptance criteria:**
- [x] No console errors/warnings
- [x] Code follows project conventions
- [x] Unused imports removed
- [x] Component props documented
**Verification:**
- [x] Build succeeds
- [x] Lint passes
**Dependencies:** All previous tasks
**Estimated scope:** S