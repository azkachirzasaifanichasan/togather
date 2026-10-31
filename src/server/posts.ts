import { prisma } from "@/lib/prisma";
import {
  NotificationType,
  ReportReason,
  ReportTargetType,
  type Prisma,
} from "@prisma/client";
import { notify } from "@/server/notifications";

/**
 * Community posting, comments, likes and shares.
 *
 * Permissions:
 * - posting requires membership; in a PRIVATE community only organizers may
 *   post, so members of a private circle cannot start their own threads;
 * - comments, likes and shares require membership in any access type, and
 *   an organizer is always allowed;
 * - every write is idempotent where it matters (like toggles, shares are
 *   counted, comments are appended).
 */

export type PostMedia = {
  url: string;
  type: "image" | "video";
  name: string;
};

/**
 * How much extra "freshness" an organizer's post gets in the feed.
 *
 * An organizer post behaves as if it were written 24 hours later, so it stays
 * above member posts for its first day without being permanently pinned.
 */
export const ORGANIZER_BOOST_MS = 24 * 60 * 60 * 1000;

/**
 * Feed ranking score. Higher means closer to the top.
 */
export function feedScore(createdAt: Date, isOrganizerPost: boolean): number {
  return createdAt.getTime() + (isOrganizerPost ? ORGANIZER_BOOST_MS : 0);
}

/**
 * Read the attachments of a post, tolerating rows written before `media`
 * existed (null) and malformed JSON.
 */
function readMedia(value: Prisma.JsonValue | null): PostMedia[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];

    const media = item as Record<string, unknown>;
    if (
      typeof media.url === "string" &&
      (media.type === "image" || media.type === "video") &&
      typeof media.name === "string"
    ) {
      return [{ url: media.url, type: media.type, name: media.name }];
    }

    return [];
  });
}

type ViewerModerationState = {
  blockedUserIds: string[];
  hiddenCommentIds: string[];
  notInterestedPostIds: string[];
  notInterestedCommentIds: string[];
};

const EMPTY_MODERATION: ViewerModerationState = {
  blockedUserIds: [],
  hiddenCommentIds: [],
  notInterestedPostIds: [],
  notInterestedCommentIds: [],
};

/**
 * The viewer's moderation state, applied when reading a feed or a thread:
 * blocked users, hidden comments, and posts/comments the viewer reported as
 * "I don't want to see this".
 */
async function getViewerModerationState(
  viewerId?: string
): Promise<ViewerModerationState> {
  if (!viewerId) return EMPTY_MODERATION;

  const [blocks, hiddenComments, reports] = await Promise.all([
    prisma.userBlock.findMany({
      where: {
        OR: [{ blockerId: viewerId }, { blockedId: viewerId }],
      },
      select: { blockerId: true, blockedId: true },
    }),
    prisma.hiddenComment.findMany({
      where: { userId: viewerId },
      select: { commentId: true },
    }),
    prisma.contentReport.findMany({
      where: { reporterId: viewerId, reason: ReportReason.NOT_INTERESTED },
      select: { targetType: true, targetId: true },
    }),
  ]);

  const blocked = new Set<string>();
  for (const block of blocks) {
    blocked.add(block.blockerId === viewerId ? block.blockedId : block.blockerId);
  }

  return {
    blockedUserIds: [...blocked],
    hiddenCommentIds: hiddenComments.map((row) => row.commentId),
    notInterestedPostIds: reports
      .filter((report) => report.targetType === ReportTargetType.POST)
      .map((report) => report.targetId),
    notInterestedCommentIds: reports
      .filter((report) => report.targetType === ReportTargetType.COMMENT)
      .map((report) => report.targetId),
  };
}

/**
 * Is there a block between these two users, in either direction? Used to stop
 * a comment/reply from crossing a block even if the UI is bypassed.
 */
async function isBlockedBetween(userA: string, userB: string) {
  if (userA === userB) return false;

  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userA, blockedId: userB },
        { blockerId: userB, blockedId: userA },
      ],
    },
    select: { id: true },
  });

  return Boolean(block);
}

/**
 * What the user may do in a community.
 *
 * Public  -> members may post.
 * Private -> only organizers may start a post; members may still comment,
 *            like and share.
 */
export async function getCommunityAccess(userId: string, communityId: string) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: {
      accessType: true,
      organizers: { where: { userId }, select: { id: true } },
      members: { where: { userId }, select: { id: true } },
    },
  });

  if (!community) return null;

  const isOrganizer = community.organizers.length > 0;
  const isMember = isOrganizer || community.members.length > 0;

  return {
    accessType: community.accessType,
    isOrganizer,
    isMember,
    canPost: isOrganizer || (community.accessType === "PUBLIC" && isMember),
  };
}

/**
 * Can this user post in the community?
 *
 * Public  -> any member.
 * Private -> organizers only.
 */
export async function canPostInCommunity(
  userId: string,
  communityId: string
): Promise<boolean> {
  const access = await getCommunityAccess(userId, communityId);
  return access?.canPost ?? false;
}

/**
 * List the posts of a community, ranked for the feed.
 *
 * Organizer posts get a 24h freshness boost (see `feedScore`), so the people
 * who run the community stay visible without being permanently pinned.
 *
 * `viewerId` is used to mark which posts the viewer has liked. A private
 * community's posts are only readable by its members.
 */
export async function getCommunityPosts(
  communityId: string,
  viewerId?: string,
  limit = 20
) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: {
      accessType: true,
      organizers: { select: { userId: true } },
    },
  });

  if (!community) {
    throw new Error("COMMUNITY_NOT_FOUND");
  }

  if (community.accessType === "PRIVATE") {
    const access = viewerId
      ? await getCommunityAccess(viewerId, communityId)
      : null;

    if (!access?.isMember) {
      throw new Error("FORBIDDEN");
    }
  }

  const moderation = await getViewerModerationState(viewerId);

  // shortcut: read twice the page and re-rank in memory. A real ranking
  // would live in SQL once the feed grows past a demo.
  const posts = await prisma.communityPost.findMany({
    where: {
      communityId,
      ...(moderation.blockedUserIds.length > 0
        ? { authorId: { notIn: moderation.blockedUserIds } }
        : {}),
      ...(moderation.notInterestedPostIds.length > 0
        ? { id: { notIn: moderation.notInterestedPostIds } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit * 2,
    include: {
      author: { select: { id: true, profile: { select: { name: true, avatarUrl: true } } } },
      _count: { select: { likes: true, comments: true, shares: true } },
    },
  });

  const organizerIds = new Set(community.organizers.map((o) => o.userId));
  const ranked = posts
    .map((post) => ({
      post,
      isOrganizerPost: organizerIds.has(post.authorId),
    }))
    .sort(
      (a, b) =>
        feedScore(b.post.createdAt, b.isOrganizerPost) -
          feedScore(a.post.createdAt, a.isOrganizerPost) ||
        b.post.createdAt.getTime() - a.post.createdAt.getTime()
    )
    .slice(0, limit);

  const likedIds = viewerId
    ? new Set(
        (
          await prisma.postLike.findMany({
            where: {
              userId: viewerId,
              postId: { in: ranked.map(({ post }) => post.id) },
            },
            select: { postId: true },
          })
        ).map((l) => l.postId)
      )
    : new Set<string>();

  const savedIds = viewerId
    ? new Set(
        (
          await prisma.postSave.findMany({
            where: {
              userId: viewerId,
              postId: { in: ranked.map(({ post }) => post.id) },
            },
            select: { postId: true },
          })
        ).map((s) => s.postId)
      )
    : new Set<string>();

  // The `_count.comments` relation counts every comment, including authors
  // the viewer blocked and comments they reported as not interested. Hidden
  // comments still count: they stay in the thread as a row the viewer can
  // expand again. Recompute only when the viewer has some of that moderation
  // state, so the common path stays one query.
  const moderated =
    moderation.blockedUserIds.length > 0 ||
    moderation.notInterestedCommentIds.length > 0;

  const visibleCommentCounts = new Map<string, number>();
  if (viewerId && moderated && ranked.length > 0) {
    const comments = await prisma.postComment.findMany({
      where: {
        postId: { in: ranked.map(({ post }) => post.id) },
        ...(moderation.blockedUserIds.length > 0
          ? { authorId: { notIn: moderation.blockedUserIds } }
          : {}),
        ...(moderation.notInterestedCommentIds.length > 0
          ? { id: { notIn: moderation.notInterestedCommentIds } }
          : {}),
      },
      select: { id: true, postId: true, parentId: true },
    });

    for (const comment of comments) {
      visibleCommentCounts.set(
        comment.postId,
        (visibleCommentCounts.get(comment.postId) ?? 0) + 1
      );
    }
  }

  return ranked.map(({ post, isOrganizerPost }) => ({
    id: post.id,
    content: post.content,
    media: readMedia(post.media),
    createdAt: post.createdAt.toISOString(),
    author: {
      id: post.author.id,
      name: post.author.profile?.name ?? "Anggota",
      avatarUrl: post.author.profile?.avatarUrl ?? null,
    },
    isOrganizerPost,
    likeCount: post._count.likes,
    commentCount: moderated
      ? visibleCommentCounts.get(post.id) ?? 0
      : post._count.comments,
    shareCount: post._count.shares,
    likedByViewer: likedIds.has(post.id),
    savedByViewer: savedIds.has(post.id),
  }));
}

/**
 * List the comments of a post, oldest first.
 *
 * Comments are only readable by members when the post lives in a private
 * community.
 */
export async function getPostComments(postId: string, viewerId?: string) {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { communityId: true, community: { select: { accessType: true } } },
  });

  if (!post) {
    throw new Error("NOT_FOUND");
  }

  if (post.community.accessType === "PRIVATE") {
    const access = viewerId
      ? await getCommunityAccess(viewerId, post.communityId)
      : null;

    if (!access?.isMember) {
      throw new Error("FORBIDDEN");
    }
  }

  const moderation = await getViewerModerationState(viewerId);

  const comments = await prisma.postComment.findMany({
    where: {
      postId,
      ...(moderation.blockedUserIds.length > 0
        ? { authorId: { notIn: moderation.blockedUserIds } }
        : {}),
      ...(moderation.notInterestedCommentIds.length > 0
        ? { id: { notIn: moderation.notInterestedCommentIds } }
        : {}),
    },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, profile: { select: { name: true, avatarUrl: true } } } },
    },
  });

  // Hiding is a viewer preference, not a delete: the comment stays in the
  // thread as a collapsed row the viewer can expand again, and the content is
  // withheld from the response until they do.
  const hidden = new Set(moderation.hiddenCommentIds);

  return comments.map((comment) => {
    const isHidden =
      hidden.has(comment.id) ||
      Boolean(comment.parentId && hidden.has(comment.parentId));

    return {
      id: comment.id,
      content: isHidden ? "" : comment.content,
      parentId: comment.parentId,
      hidden: isHidden,
      createdAt: comment.createdAt.toISOString(),
      author: {
        id: comment.author.id,
        name: comment.author.profile?.name ?? "Anggota",
        avatarUrl: comment.author.profile?.avatarUrl ?? null,
      },
    };
  });
}

/**
 * Create a post and notify the other members of the community.
 */
export async function createPost(
  userId: string,
  communityId: string,
  content: string,
  media: PostMedia[] = []
) {
  const allowed = await canPostInCommunity(userId, communityId);
  if (!allowed) {
    throw new Error("FORBIDDEN");
  }

  const post = await prisma.communityPost.create({
    data: {
      communityId,
      authorId: userId,
      content,
      ...(media.length > 0 ? { media } : {}),
    },
  });

  // Everyone in the community hears about a new post, except the author.
  const members = await prisma.communityMembership.findMany({
    where: { communityId, userId: { not: userId } },
    select: { userId: true },
  });

  const authorName =
    (
      await prisma.userProfile.findUnique({
        where: { userId },
        select: { name: true },
      })
    )?.name ?? "Seorang anggota";

  await notify({
    recipients: members.map((m) => m.userId),
    actorId: userId,
    communityId,
    type: NotificationType.COMMUNITY_POST,
    personal: false,
    postId: post.id,
    message: `${authorName} memposting di komunitas ini.`,
  });

  return { id: post.id };
}

/**
 * Comment on a post, or reply to a comment.
 *
 * A top-level comment notifies the post author (personal) and the rest of the
 * community (community-wide). A reply notifies the person being replied to
 * with POST_REPLY, plus the post author; replies are not broadcast to the
 * whole community, so a thread does not spam everyone.
 */
export async function createComment(
  userId: string,
  postId: string,
  content: string,
  parentId?: string
) {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true, communityId: true, authorId: true },
  });

  if (!post) {
    throw new Error("NOT_FOUND");
  }

  const access = await getCommunityAccess(userId, post.communityId);
  if (!access?.isMember) {
    throw new Error("FORBIDDEN");
  }

  // A blocked author's thread is not a place to start or continue a
  // conversation.
  if (await isBlockedBetween(userId, post.authorId)) {
    throw new Error("FORBIDDEN");
  }

  // The parent must belong to the same post. Replies are flattened to one
  // level: replying to a reply attaches to its top-level comment.
  let rootId: string | null = null;
  let parentAuthorId: string | null = null;

  if (parentId) {
    const parent = await prisma.postComment.findUnique({
      where: { id: parentId },
      select: { id: true, postId: true, authorId: true, parentId: true },
    });

    if (!parent || parent.postId !== postId) {
      throw new Error("NOT_FOUND");
    }

    if (await isBlockedBetween(userId, parent.authorId)) {
      throw new Error("FORBIDDEN");
    }

    rootId = parent.parentId ?? parent.id;
    parentAuthorId = parent.authorId;
  }

  const comment = await prisma.postComment.create({
    data: { postId, authorId: userId, content, parentId: rootId },
  });

  const authorName =
    (
      await prisma.userProfile.findUnique({
        where: { userId },
        select: { name: true },
      })
    )?.name ?? "Seorang anggota";

  if (rootId) {
    // The person being replied to.
    await notify({
      recipients: parentAuthorId ? [parentAuthorId] : [],
      actorId: userId,
      communityId: post.communityId,
      type: NotificationType.POST_REPLY,
      personal: true,
      postId,
      commentId: comment.id,
      message: `${authorName} membalas komentarmu.`,
    });

    // The post author, unless they are already the person being replied to.
    if (post.authorId !== userId && post.authorId !== parentAuthorId) {
      await notify({
        recipients: [post.authorId],
        actorId: userId,
        communityId: post.communityId,
        type: NotificationType.POST_COMMENT,
        personal: true,
        postId,
        commentId: comment.id,
        message: `${authorName} mengomentari postinganmu.`,
      });
    }

    return { id: comment.id };
  }

  // The post author: personal notification.
  if (post.authorId !== userId) {
    await notify({
      recipients: [post.authorId],
      actorId: userId,
      communityId: post.communityId,
      type: NotificationType.POST_COMMENT,
      personal: true,
      postId,
      commentId: comment.id,
      message: `${authorName} mengomentari postinganmu.`,
    });
  }

  // The rest of the community: community-wide notification.
  const members = await prisma.communityMembership.findMany({
    where: { communityId: post.communityId, userId: { not: userId } },
    select: { userId: true },
  });

  await notify({
    recipients: members
      .filter((m) => m.userId !== post.authorId)
      .map((m) => m.userId),
    actorId: userId,
    communityId: post.communityId,
    type: NotificationType.COMMUNITY_COMMENT,
    personal: false,
    postId,
    commentId: comment.id,
    message: `${authorName} mengomentari sebuah postingan.`,
  });

  return { id: comment.id };
}

/**
 * Toggle the like on a post. Returns the new state.
 */
export async function toggleLike(userId: string, postId: string) {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true, communityId: true, authorId: true },
  });

  if (!post) {
    throw new Error("NOT_FOUND");
  }

  const access = await getCommunityAccess(userId, post.communityId);
  if (!access?.isMember) {
    throw new Error("FORBIDDEN");
  }

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { postId_userId: { postId, userId } } });
  } else {
    await prisma.postLike.create({ data: { postId, userId } });
  }

  // Only notify on the transition to liked, never on un-like.
  if (!existing && post.authorId !== userId) {
    const authorName =
      (
        await prisma.userProfile.findUnique({
          where: { userId },
          select: { name: true },
        })
      )?.name ?? "Seorang anggota";

    await notify({
      recipients: [post.authorId],
      actorId: userId,
      communityId: post.communityId,
      type: NotificationType.POST_LIKE,
      personal: true,
      postId,
      message: `${authorName} menyukai postingammu.`,
    });
  }

  const likeCount = await prisma.postLike.count({ where: { postId } });

  return { liked: !existing, likeCount };
}

/**
 * Share a post. Shares are a counter, not a re-post.
 */
export async function sharePost(userId: string, postId: string) {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true, communityId: true, authorId: true },
  });

  if (!post) {
    throw new Error("NOT_FOUND");
  }

  const access = await getCommunityAccess(userId, post.communityId);
  if (!access?.isMember) {
    throw new Error("FORBIDDEN");
  }

  // One share per user: sharing again keeps the count and stays silent.
  const existing = await prisma.postShare.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (!existing) {
    await prisma.postShare.create({ data: { postId, userId } });
  }

  if (!existing && post.authorId !== userId) {
    const authorName =
      (
        await prisma.userProfile.findUnique({
          where: { userId },
          select: { name: true },
        })
      )?.name ?? "Seorang anggota";

    await notify({
      recipients: [post.authorId],
      actorId: userId,
      communityId: post.communityId,
      type: NotificationType.POST_SHARE,
      personal: true,
      postId,
      message: `${authorName} membagikan postingammu.`,
    });
  }

  const shareCount = await prisma.postShare.count({ where: { postId } });

  return { shared: true, alreadyShared: !!existing, shareCount };
}

/**
 * Toggle the save (bookmark) on a post.
 *
 * Unlike a share, saving is private: there is no count and no notification,
 * and the saved list feeds the "Saved" tab of the sidebar.
 */
export async function toggleSave(userId: string, postId: string) {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { communityId: true },
  });

  if (!post) {
    throw new Error("NOT_FOUND");
  }

  const access = await getCommunityAccess(userId, post.communityId);
  if (!access?.isMember) {
    throw new Error("FORBIDDEN");
  }

  const existing = await prisma.postSave.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.postSave.delete({ where: { postId_userId: { postId, userId } } });
  } else {
    await prisma.postSave.create({ data: { postId, userId } });
  }

  return { saved: !existing };
}

export type SavedPostItem = {
  saveId: string;
  savedAt: string;
  id: string;
  content: string;
  media: PostMedia[];
  createdAt: string;
  community: { id: string; name: string };
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  authorName: string;
};

/**
 * The posts this user saved, newest save first.
 *
 * Posts from blocked users are excluded so a viewer's blocks are respected
 * across the entire app.
 */
export async function getSavedPosts(userId: string): Promise<SavedPostItem[]> {
  const moderation = await getViewerModerationState(userId);

  const rows = await prisma.postSave.findMany({
    where: {
      userId,
      ...(moderation.blockedUserIds.length > 0
        ? { post: { authorId: { notIn: moderation.blockedUserIds } } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          media: true,
          community: { select: { id: true, name: true } },
          author: {
            select: {
              id: true,
              profile: { select: { name: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  });

  return rows.map(({ id, createdAt, post }) => ({
    saveId: id,
    savedAt: createdAt.toISOString(),
    id: post.id,
    content: post.content,
    media: readMedia(post.media),
    createdAt: post.createdAt.toISOString(),
    community: post.community,
    author: {
      id: post.author.id,
      name: post.author.profile?.name ?? "Anggota",
      avatarUrl: post.author.profile?.avatarUrl ?? null,
    },
    authorName: post.author.profile?.name ?? "Anggota",
  }));
}

/**
 * Remove a save. Deleting a row that is not there is a no-op, so the saved
 * list can call it twice without harm.
 */
export async function unsavePost(userId: string, postId: string) {
  await prisma.postSave.deleteMany({ where: { userId, postId } });
  return { saved: false };
}
