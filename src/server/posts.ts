import { prisma } from "@/lib/prisma";
import { NotificationType, type Prisma } from "@prisma/client";
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

  // shortcut: read twice the page and re-rank in memory. A real ranking
  // would live in SQL once the feed grows past a demo.
  const posts = await prisma.communityPost.findMany({
    where: { communityId },
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
    commentCount: post._count.comments,
    shareCount: post._count.shares,
    likedByViewer: likedIds.has(post.id),
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

  const comments = await prisma.postComment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, profile: { select: { name: true, avatarUrl: true } } } },
    },
  });

  return comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    parentId: comment.parentId,
    createdAt: comment.createdAt.toISOString(),
    author: {
      id: comment.author.id,
      name: comment.author.profile?.name ?? "Anggota",
      avatarUrl: comment.author.profile?.avatarUrl ?? null,
    },
  }));
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

  await prisma.postShare.create({ data: { postId, userId } });

  if (post.authorId !== userId) {
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

  return { shareCount };
}
