import { ReportReason, ReportTargetType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCommunityAccess } from "@/server/posts";

/**
 * Reporting, hiding comments and blocking users.
 *
 * These are viewer-scoped actions: a report is private to the reporter, a
 * hidden comment stays visible to everybody else, and a block hides both
 * sides from each other without removing either account.
 */

async function assertCommunityVisible(userId: string, communityId: string) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { accessType: true },
  });

  if (!community) {
    throw new Error("NOT_FOUND");
  }

  if (community.accessType === "PRIVATE") {
    const access = await getCommunityAccess(userId, communityId);
    if (!access?.isMember) {
      throw new Error("FORBIDDEN");
    }
  }
}

async function assertPostVisible(userId: string, postId: string) {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { communityId: true },
  });

  if (!post) {
    throw new Error("NOT_FOUND");
  }

  await assertCommunityVisible(userId, post.communityId);
}

async function assertCommentVisible(userId: string, commentId: string) {
  const comment = await prisma.postComment.findUnique({
    where: { id: commentId },
    select: { post: { select: { communityId: true } } },
  });

  if (!comment) {
    throw new Error("NOT_FOUND");
  }

  await assertCommunityVisible(userId, comment.post.communityId);
}

/**
 * Record a report for a post or comment. Re-reporting the same target updates
 * the reason instead of creating a duplicate row.
 */
export async function reportContent(
  userId: string,
  targetType: ReportTargetType,
  targetId: string,
  reason: ReportReason
) {
  if (targetType === ReportTargetType.POST) {
    await assertPostVisible(userId, targetId);
  } else {
    await assertCommentVisible(userId, targetId);
  }

  await prisma.contentReport.upsert({
    where: {
      reporterId_targetType_targetId: { reporterId: userId, targetType, targetId },
    },
    create: { reporterId: userId, targetType, targetId, reason },
    update: { reason, createdAt: new Date() },
  });

  return { reported: true };
}

/**
 * Hide one comment from the viewer's thread. Hiding a root comment also hides
 * its replies. The comment is not deleted: `getPostComments` returns it with
 * `hidden: true` and without its content, so the viewer can expand it again.
 */
export async function hideComment(userId: string, commentId: string) {
  await assertCommentVisible(userId, commentId);

  await prisma.hiddenComment.upsert({
    where: { userId_commentId: { userId, commentId } },
    create: { userId, commentId },
    update: {},
  });

  return { hidden: true };
}

/**
 * Expand a hidden comment again. Deleting a row that is not there is a no-op,
 * so a double click is harmless.
 */
export async function unhideComment(userId: string, commentId: string) {
  await assertCommentVisible(userId, commentId);

  await prisma.hiddenComment.deleteMany({ where: { userId, commentId } });

  return { hidden: false };
}

/**
 * Toggle a block between the viewer and another user.
 *
 * A block is mutual for visibility: `getCommunityPosts` and `getPostComments`
 * exclude authors on either side of it.
 */
export async function toggleBlock(userId: string, targetUserId: string) {
  if (userId === targetUserId) {
    throw new Error("CONFLICT");
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true },
  });

  if (!target) {
    throw new Error("NOT_FOUND");
  }

  const existing = await prisma.userBlock.findUnique({
    where: {
      blockerId_blockedId: { blockerId: userId, blockedId: targetUserId },
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.userBlock.delete({ where: { id: existing.id } });
  } else {
    await prisma.userBlock.create({
      data: { blockerId: userId, blockedId: targetUserId },
    });
  }

  return { blocked: !existing };
}

export type BlockedUserItem = {
  id: string;
  name: string;
  avatarUrl: string | null;
  blockedAt: string;
};

/**
 * The accounts this viewer has blocked, newest first.
 *
 * Only the viewer's own block rows: a block is mutual for visibility, but the
 * list belongs to whoever made it.
 */
export async function getBlockedUsers(userId: string): Promise<BlockedUserItem[]> {
  const rows = await prisma.userBlock.findMany({
    where: { blockerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      blocked: {
        select: {
          id: true,
          profile: { select: { name: true, avatarUrl: true } },
        },
      },
    },
  });

  return rows.map(({ createdAt, blocked }) => ({
    id: blocked.id,
    name: blocked.profile?.name ?? "Pengguna",
    avatarUrl: blocked.profile?.avatarUrl ?? null,
    blockedAt: createdAt.toISOString(),
  }));
}

/**
 * Undo a block. Deleting a row that is not there is a no-op.
 */
export async function unblockUser(userId: string, targetUserId: string) {
  await prisma.userBlock.deleteMany({
    where: { blockerId: userId, blockedId: targetUserId },
  });

  return { blocked: false };
}
