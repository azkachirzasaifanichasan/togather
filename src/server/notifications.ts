import { prisma } from "@/lib/prisma";
import { NotificationLevel, NotificationType } from "@prisma/client";

/**
 * Notifications for the bell dropdown.
 *
 * Two levels of filtering:
 * - `NotificationPreference` (per user, per community) decides whether a
 *   notification is created at all. OFF means nothing is delivered;
 *   PERSONAL means only personal notifications are;
 * - `Notification.mutedAt` mutes a single notification from the dropdown.
 *
 * A missing preference row means ALL.
 */

export type NotificationTab = "all" | "personal" | "off";

/**
 * Does a notification level deliver a notification of this kind?
 *
 * OFF      -> nothing
 * PERSONAL -> only personal notifications
 * ALL      -> everything
 */
export function levelDelivers(level: NotificationLevel, personal: boolean): boolean {
  if (level === NotificationLevel.OFF) return false;
  if (level === NotificationLevel.PERSONAL) return personal;
  return true;
}

/**
 * The filter for one tab of the bell dropdown.
 */
export function notificationFilter(tab: NotificationTab) {
  if (tab === "off") return { mutedAt: { not: null } };
  if (tab === "personal") return { mutedAt: null, personal: true };
  return { mutedAt: null };
}

/**
 * The notification level of a user in a community. Defaults to ALL.
 */
export async function getNotificationLevel(
  userId: string,
  communityId: string
): Promise<NotificationLevel> {
  const pref = await prisma.notificationPreference.findUnique({
    where: { userId_communityId: { userId, communityId } },
    select: { level: true },
  });

  return pref?.level ?? NotificationLevel.ALL;
}

/**
 * Set the notification level of a user in a community.
 */
export async function setNotificationLevel(
  userId: string,
  communityId: string,
  level: NotificationLevel
) {
  return prisma.notificationPreference.upsert({
    where: { userId_communityId: { userId, communityId } },
    create: { userId, communityId, level },
    update: { level },
    select: { level: true },
  });
}

/**
 * Create notifications for a list of recipients.
 *
 * Recipients whose community level is OFF get nothing; recipients whose
 * level is PERSONAL only get personal notifications.
 */
export async function notify({
  recipients,
  actorId,
  communityId,
  type,
  personal,
  postId,
  commentId,
  message,
}: {
  recipients: string[];
  actorId: string;
  communityId: string;
  type: NotificationType;
  personal: boolean;
  postId?: string;
  commentId?: string;
  message: string;
}) {
  const targets = [...new Set(recipients)].filter((id) => id !== actorId);
  if (targets.length === 0) return;

  const prefs = await prisma.notificationPreference.findMany({
    where: { userId: { in: targets }, communityId },
    select: { userId: true, level: true },
  });

  const levelByUser = new Map(prefs.map((p) => [p.userId, p.level]));

  const deliverable = targets.filter((userId) => {
    const level = levelByUser.get(userId) ?? NotificationLevel.ALL;
    return levelDelivers(level, personal);
  });

  if (deliverable.length === 0) return;

  await prisma.notification.createMany({
    data: deliverable.map((userId) => ({
      userId,
      actorId,
      communityId,
      type,
      personal,
      postId: postId ?? null,
      commentId: commentId ?? null,
      message,
    })),
  });
}

/**
 * List the notifications of a user for one tab of the bell dropdown.
 *
 * - "all"      -> everything that is not muted
 * - "personal" -> only personal notifications that are not muted
 * - "off"      -> only muted notifications
 */
export async function getNotifications(userId: string, tab: NotificationTab) {
  const notifications = await prisma.notification.findMany({
    where: { userId, ...notificationFilter(tab) },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      actor: { select: { id: true, profile: { select: { name: true, avatarUrl: true } } } },
      community: { select: { id: true, name: true } },
      post: { select: { id: true, content: true } },
      comment: { select: { id: true, content: true } },
    },
  });

  return notifications.map((n) => ({
    id: n.id,
    type: n.type,
    personal: n.personal,
    message: n.message,
    createdAt: n.createdAt.toISOString(),
    readAt: n.readAt?.toISOString() ?? null,
    mutedAt: n.mutedAt?.toISOString() ?? null,
    postId: n.postId,
    commentId: n.commentId,
    actorName: n.actor?.profile?.name ?? "Anggota",
    actorAvatarUrl: n.actor?.profile?.avatarUrl ?? null,
    communityId: n.community.id,
    communityName: n.community.name,
    postPreview: n.post?.content.slice(0, 120) ?? null,
  }));
}

/**
 * Count the unread notifications per tab, for the bell badge.
 */
export async function getUnreadCounts(userId: string) {
  const [all, personal] = await Promise.all([
    prisma.notification.count({
      where: { userId, readAt: null, mutedAt: null },
    }),
    prisma.notification.count({
      where: { userId, readAt: null, mutedAt: null, personal: true },
    }),
  ]);

  return { all, personal };
}

/**
 * Mark notifications as read.
 *
 * With `id` only that one is marked, otherwise every notification of the
 * user is marked.
 */
export async function markNotificationsRead(userId: string, id?: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null, ...(id ? { id } : {}) },
    data: { readAt: new Date() },
  });
}

/**
 * Mute or unmute a single notification.
 */
export async function setNotificationMuted(
  userId: string,
  id: string,
  muted: boolean
) {
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { mutedAt: muted ? new Date() : null },
  });
}
