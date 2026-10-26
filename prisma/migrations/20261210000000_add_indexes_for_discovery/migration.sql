-- Add indexes for Homepage Discovery MVP performance

-- PostGIS spatial indexes
CREATE INDEX IF NOT EXISTS idx_community_location_coordinates ON "CommunityLocation" USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_event_coordinates ON "Event" USING GIST (coordinates);

-- Filter indexes  
CREATE INDEX IF NOT EXISTS idx_community_categories ON "Community" USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_event_category ON "Event"(category);
CREATE INDEX IF NOT EXISTS idx_event_published ON "Event"("isPublished");
CREATE INDEX IF NOT EXISTS idx_community_location_area ON "CommunityLocation"(area);
CREATE INDEX IF NOT EXISTS idx_event_area ON "Event"(area);

-- Date range index for events
CREATE INDEX IF NOT EXISTS idx_event_start_date ON "Event"("startDate");

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_community_search ON "Community" USING GIN (to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_event_search ON "Event" USING GIN (to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '')));

-- Membership indexes for counts
CREATE INDEX IF NOT EXISTS idx_membership_community ON "CommunityMembership"("communityId");
CREATE INDEX IF NOT EXISTS idx_registration_event ON "EventRegistration"("eventId");
