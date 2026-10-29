-- Optional profile photo URL. When null the UI falls back to the user's initials.
ALTER TABLE "UserProfile" ADD COLUMN "avatarUrl" TEXT;
