-- Free-text address, required (with domicile + verified phone) to lift a user to organizer
ALTER TABLE "UserProfile" ADD COLUMN "address" TEXT;
