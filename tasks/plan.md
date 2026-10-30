# Implementation Plan: Community Profile Images and Banners

## Overview
Implement comprehensive image support for Togather communities: profile pictures (avatar) and banner/thumbnail images. This includes database schema changes, upload API, frontend components for upload/preview, automatic thumbnail generation based on community name/category, and consistent display across all community pages.

## Architecture Decisions

1. **Database**: Add `avatarUrl` and `bannerUrl` fields to the `Community` model (Prisma schema)
2. **Storage**: Use existing local filesystem upload pattern (`public/uploads/communities/`) similar to posts
3. **Upload API**: Create new `/api/upload/community` endpoint for community images with validation
4. **Auto-thumbnails**: Implement a mapping of categories/keywords to curated Unsplash images for relevant fallbacks
5. **Frontend**: Extend CreateCommunityForm with image upload components, update community cards and detail page

## Task List

### Phase 1: Database & Backend Foundation
- [ ] Task 1: Add avatarUrl and bannerUrl fields to Community Prisma model
- [ ] Task 2: Create and run database migration
- [ ] Task 3: Create community image upload API endpoint (`/api/upload/community`)
- [ ] Task 4: Update community server functions to include avatarUrl/bannerUrl in responses
- [ ] Task 5: Update createCommunitySchema validation to accept avatarUrl and bannerUrl
- [ ] Task 6: Update submitCommunity to save avatarUrl and bannerUrl

### Phase 2: Frontend Upload Components
- [ ] Task 7: Create CommunityImageUpload component (reusable for avatar and banner)
- [ ] Task 8: Integrate image upload into CreateCommunityForm (avatar + banner)
- [ ] Task 9: Add preview, loading states, and error handling to upload components

### Phase 3: Display Integration
- [ ] Task 10: Update community list page (komunitas/page.tsx) to use banner as card thumbnail
- [ ] Task 11: Update community detail page (komunitas/[id]/page.tsx) to use community's banner and avatar
- [ ] Task 12: Implement automatic thumbnail fallback system (category/keyword → curated image)

### Phase 4: Admin & Edit Support
- [ ] Task 13: Update admin community edit to support image changes
- [ ] Task 14: Update updateCommunitySchema and updateCommunityAsAdmin for images

### Phase 5: Testing & Polish
- [ ] Task 15: Test complete flow: create community with images, verify display on list and detail
- [ ] Task 16: Test edge cases: no images, only avatar, only banner, invalid files, large files
- [ ] Task 17: Verify existing communities still work (backward compatibility)
- [ ] Task 18: Clean up and documentation

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration breaks existing data | High | Add fields as nullable, provide defaults |
| Upload API conflicts with existing post upload | Low | Separate endpoint and directory |
| Auto-thumbnail images not loading | Medium | Use reliable CDN (Unsplash) with fallbacks |
| Large file uploads causing issues | Medium | Validate file size (max 5MB for images) |
| Breaking existing community creation flow | High | Make image fields optional, maintain backward compatibility |

## Open Questions
- Should we use a separate CDN for auto-thumbnails or local curated images?
- What's the recommended aspect ratio for banner (16:9) vs avatar (1:1)?
- Should organizers be able to change images after creation?