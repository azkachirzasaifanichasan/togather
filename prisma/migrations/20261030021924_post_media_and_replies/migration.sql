-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'POST_REPLY';

-- AlterTable
ALTER TABLE "CommunityPost" ADD COLUMN     "media" JSONB;

-- AlterTable
ALTER TABLE "PostComment" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "PostComment_parentId_idx" ON "PostComment"("parentId");

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
