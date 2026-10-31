"use client";

import { useEffect, useRef, useState } from "react";
import { PostComposer, type PostMedia } from "@/components/communities/PostComposer";
import { PostMenu, CommentMenu } from "@/components/communities/FeedMenus";
import {
  ReportDialog,
  type ReportReasonValue,
  type ReportTarget,
} from "@/components/communities/ReportDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export type FeedPost = {
  id: string;
  content: string;
  media: PostMedia[];
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
  isOrganizerPost: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  likedByViewer: boolean;
  savedByViewer: boolean;
};

export type FeedComment = {
  id: string;
  content: string;
  parentId: string | null;
  hidden: boolean;
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
};

function relativeTime(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.round(hours / 24)} hari lalu`;
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="h-full w-full object-cover" />;
  }
  return (
    <span className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-600">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

/**
 * The post feed of a community: composer, posts, media, likes, comments,
 * replies and shares.
 *
 * The list is kept in client state so a like or a comment updates in place
 * without a full page reload.
 */
export function CommunityFeed({
  communityId,
  canPost,
  initialPosts,
  viewerId,
}: {
  communityId: string;
  canPost: boolean;
  initialPosts: FeedPost[];
  viewerId: string;
}) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, FeedComment[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<Record<string, string | null>>({});
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [highlight, setHighlight] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<string | null>(null);
  const [shareNote, setShareNote] = useState<string | null>(null);
  // Blocking is mutual and not obvious to undo, so it asks first.
  const [blockTarget, setBlockTarget] = useState<{
    postId: string;
    author: { id: string; name: string };
  } | null>(null);
  const focused = useRef(false);
  const loadComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) return;
      const payload = await response.json();
      setComments((prev) => ({ ...prev, [postId]: payload.comments ?? [] }));
    } catch {
      // Ignore.
    }
  };

  // A notification links here with ?post=&comment=; open that thread and
  // flash the comment so the arrival point is obvious.
  useEffect(() => {
    if (focused.current) return;
    focused.current = true;

    const params = new URLSearchParams(window.location.search);
    const postId = params.get("post");
    if (!postId) return;
    const commentId = params.get("comment");

    setOpenComments((prev) => ({ ...prev, [postId]: true })); // eslint-disable-line

    loadComments(postId).then(() => {
      // Wait for the fetched comments to land in the DOM before scrolling.
      setTimeout(() => {
        setOpenComments((prev) => ({ ...prev, [postId]: true }));
        const target = document.getElementById(
          commentId ? `comment-${commentId}` : `post-${postId}`
        );
        target?.scrollIntoView({ behavior: "smooth", block: "center" });

        if (commentId) {
          setHighlight(commentId);
          setTimeout(() => setHighlight(null), 500);
        }
      }, 50);
    });
    // Runs once on mount: the query string does not change while mounted.
  }, []);

  const refresh = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}/posts`);
      if (!response.ok) return;
      const payload = await response.json();
      if (payload.posts) setPosts(payload.posts);
    } catch {
      // Keep the current list; the next refresh will pick it up.
    }
  };

  /**
   * Remove a comment and, when it is a root, its replies from the loaded
   * threads, keeping the post's comment count in sync.
   */
  const removeComment = (commentId: string) => {
    let removed = 0;
    let postId: string | null = null;

    for (const [key, list] of Object.entries(comments)) {
      const count = list.filter(
        (comment) => comment.id === commentId || comment.parentId === commentId
      ).length;
      if (count > 0) {
        postId = key;
        removed = count;
        break;
      }
    }

    setComments((prev) => {
      const next: Record<string, FeedComment[]> = {};
      for (const [key, list] of Object.entries(prev)) {
        next[key] = list.filter(
          (comment) =>
            comment.id !== commentId && comment.parentId !== commentId
        );
      }
      return next;
    });

    if (postId && removed > 0) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, commentCount: Math.max(0, post.commentCount - removed) }
            : post
        )
      );
    }
  };

  const hideComment = async (postId: string, comment: FeedComment) => {
    setBusy((prev) => ({ ...prev, [postId]: true }));

    try {
      const response = await fetch(`/api/comments/${comment.id}/hide`, {
        method: "POST",
      });
      if (!response.ok) return;
      // Hiding is a preference, not a delete: re-read the thread so the
      // comment comes back as a collapsed row the viewer can expand.
      await loadComments(postId);
    } catch {
      // Leave the comment in place; nothing was hidden.
    } finally {
      setBusy((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const unhideComment = async (postId: string, comment: FeedComment) => {
    setBusy((prev) => ({ ...prev, [postId]: true }));

    try {
      const response = await fetch(`/api/comments/${comment.id}/hide`, {
        method: "DELETE",
      });
      if (!response.ok) return;
      await loadComments(postId);
    } catch {
      // Keep it collapsed; the expand did not apply.
    } finally {
      setBusy((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const blockAuthor = async (
    postId: string,
    author: { id: string; name: string }
  ) => {
    setBusy((prev) => ({ ...prev, [postId]: true }));

    try {
      const response = await fetch(`/api/users/${author.id}/block`, {
        method: "POST",
      });
      if (!response.ok) return;

      setComments((prev) => {
        const next: Record<string, FeedComment[]> = {};
        for (const [key, list] of Object.entries(prev)) {
          next[key] = list.filter(
            (comment) => comment.author.id !== author.id
          );
        }
        return next;
      });

      // The server also hides this author's posts and comments, so re-read
      // the feed to apply the block everywhere at once.
      await refresh();
    } catch {
      // Keep the current view; the block did not apply.
    } finally {
      setBusy((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleReportSubmitted = (
    target: ReportTarget,
    reason: ReportReasonValue
  ) => {
    // "I don't want to see this" is a preference, not just a moderation
    // signal: drop the target from this view immediately.
    if (reason !== "NOT_INTERESTED") return;

    if (target.type === "POST") {
      setPosts((prev) => prev.filter((post) => post.id !== target.id));
    } else {
      removeComment(target.id);
    }
  };

  const toggleLike = async (postId: string) => {
    setBusy((prev) => ({ ...prev, [postId]: true }));

    try {
      const response = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!response.ok) return;

      const result = await response.json();
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, likedByViewer: result.liked, likeCount: result.likeCount }
            : post
        )
      );
    } catch {
      // Ignore: the next render shows the unchanged state.
    } finally {
      setBusy((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const share = async (postId: string) => {
    setBusy((prev) => ({ ...prev, [postId]: true }));

    try {
      const response = await fetch(`/api/posts/${postId}/share`, { method: "POST" });
      if (!response.ok) return;

      const result = await response.json();
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, shareCount: result.shareCount } : post
        )
      );
    } catch {
      // Ignore.
    } finally {
      setBusy((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const toggleSave = async (postId: string) => {
    if (busy[postId]) return;
    setBusy((prev) => ({ ...prev, [postId]: true }));

    try {
      const response = await fetch(`/api/posts/${postId}/save`, { method: "POST" });
      if (!response.ok) return;

      const result = await response.json();
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, savedByViewer: result.saved } : post
        )
      );
    } catch {
      // Ignore: the next render shows the unchanged state.
    } finally {
      setBusy((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Sharing counts once per viewer (the API is idempotent); the sheet opens
  // either way so the links stay reachable.
  const openShare = async (postId: string) => {
    setShareTarget(postId);
    setShareNote(null);
    await share(postId);
  };

  const postUrl = (postId: string) =>
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/komunitas/${communityId}?post=${postId}`;

  const copyLink = async (postId: string) => {
    try {
      await navigator.clipboard.writeText(postUrl(postId));
      setShareNote("Tautan disalin.");
    } catch {
      setShareNote("Tidak bisa menyalin tautan.");
    }
  };

  // Escape closes the share sheet, same as the other modals in the app.
  useEffect(() => {
    if (!shareTarget) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShareTarget(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shareTarget]);

  const toggleComments = async (postId: string) => {
    const next = !openComments[postId];
    setOpenComments((prev) => ({ ...prev, [postId]: next }));

    if (next && !comments[postId]) {
      await loadComments(postId);
    }
  };

  const postComment = async (
    postId: string,
    body: string,
    parentId?: string
  ): Promise<boolean> => {
    const text = body.trim();
    if (!text) return false;

    setBusy((prev) => ({ ...prev, [postId]: true }));

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, ...(parentId ? { parentId } : {}) }),
      });

      if (!response.ok) return false;

      const created = await response.json();
      setComments((prev) => ({
        ...prev,
        [postId]: [
          ...(prev[postId] ?? []),
          {
            id: created.id,
            content: text,
            parentId: parentId ?? null,
            hidden: false,
            createdAt: new Date().toISOString(),
            author: { id: "me", name: "Kamu", avatarUrl: null },
          },
        ],
      }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post
        )
      );

      return true;
    } catch {
      return false;
    } finally {
      setBusy((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const submitComment = async (postId: string) => {
    const ok = await postComment(postId, commentDraft[postId] ?? "");
    if (ok) setCommentDraft((prev) => ({ ...prev, [postId]: "" }));
  };

  const submitReply = async (postId: string, commentId: string) => {
    const ok = await postComment(postId, replyDraft[commentId] ?? "", commentId);
    if (ok) {
      setReplyDraft((prev) => ({ ...prev, [commentId]: "" }));
      setReplyingTo((prev) => ({ ...prev, [postId]: null }));
    }
  };

  return (
    <div className="space-y-6">
      <PostComposer communityId={communityId} canPost={canPost} onPosted={refresh} />

      {posts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm font-semibold text-gray-900">Belum ada postingan</p>
          <p className="mt-1 text-sm text-gray-600">
            {canPost
              ? "Jadilah yang memulai percakapan di komunitas ini."
              : "Bergabung untuk ikut berdiskusi di komunitas ini."}
          </p>
        </div>
      )}

      {posts.map((post) => {
        const list = comments[post.id] ?? [];
        const roots = list.filter((comment) => !comment.parentId);
        const repliesFor = (id: string) =>
          list.filter((comment) => comment.parentId === id);
        const replyingToId = replyingTo[post.id] ?? null;

        return (
          <article
            key={post.id}
            id={`post-${post.id}`}
            className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                  <Avatar name={post.author.name} url={post.author.avatarUrl} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {post.author.name}
                    </p>
                    {post.isOrganizerPost && (
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-[#7960D7]">
                        Pembuat komunitas
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{relativeTime(post.createdAt)}</p>
                </div>
              </div>

              <PostMenu
                authorName={post.author.name}
                canBlock={post.author.id !== viewerId}
                disabled={busy[post.id]}
                onBlock={() =>
                  setBlockTarget({
                    postId: post.id,
                    author: post.author,
                  })
                }
                onReport={() =>
                  setReportTarget({ type: "POST", id: post.id })
                }
              />
            </div>

            {post.content && (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {post.content}
              </p>
            )}

            {post.media.length > 0 && (
              <div
                className={`mt-3 grid gap-2 ${
                  post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"
                }`}
              >
                {post.media.map((media) =>
                  media.type === "image" ? (
                    <a
                      key={media.url}
                      href={media.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-xl border border-gray-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={media.url}
                        alt={media.name || "Lampiran postingan"}
                        loading="lazy"
                        className={`w-full object-cover ${
                          post.media.length > 1 ? "h-40" : "max-h-[420px]"
                        }`}
                      />
                    </a>
                  ) : (
                    <video
                      key={media.url}
                      src={media.url}
                      controls
                      preload="metadata"
                      className="w-full rounded-xl border border-gray-200 bg-black"
                    />
                  )
                )}
              </div>
            )}

            <div className="mt-4 flex items-center gap-1 border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => toggleLike(post.id)}
                disabled={busy[post.id]}
                aria-pressed={post.likedByViewer}
                aria-label={post.likedByViewer ? "Batalkan suka" : "Sukai"}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100 disabled:opacity-60 ${
                  post.likedByViewer ? "text-red-600" : "text-gray-600"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill={post.likedByViewer ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {post.likeCount}
              </button>

              <button
                type="button"
                onClick={() => toggleComments(post.id)}
                aria-expanded={!!openComments[post.id]}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {post.commentCount}
              </button>

              <button
                type="button"
                onClick={() => toggleSave(post.id)}
                disabled={busy[post.id]}
                aria-pressed={post.savedByViewer}
                aria-label={post.savedByViewer ? "Simpan dibatalkan" : "Simpan postingan"}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100 disabled:opacity-60 ${
                  post.savedByViewer ? "text-[#7960D7]" : "text-gray-600"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill={post.savedByViewer ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"
                  />
                </svg>
                Simpan
              </button>

              <button
                type="button"
                onClick={() => openShare(post.id)}
                disabled={busy[post.id]}
                aria-haspopup="dialog"
                aria-label="Bagikan postingan"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-60"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9 14l6-4M9 10l6 4M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6z"
                  />
                </svg>
                {post.shareCount}
              </button>
            </div>

            {openComments[post.id] && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                {roots.length === 0 ? (
                  <p className="text-xs text-gray-500">Belum ada komentar.</p>
                ) : (
                  <ul className="space-y-4">
                    {roots.map((comment) => {
                      const replies = repliesFor(comment.id);
                      const replying = replyingToId === comment.id;

                      if (comment.hidden) {
                        return (
                          <li
                            key={comment.id}
                            id={`comment-${comment.id}`}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2"
                          >
                            <p className="text-xs italic text-gray-500">
                              Komentar disembunyikan.
                            </p>
                            <button
                              type="button"
                              onClick={() => unhideComment(post.id, comment)}
                              disabled={busy[post.id]}
                              className="text-xs font-semibold text-[#7960D7] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Tampilkan kembali
                            </button>
                          </li>
                        );
                      }

                      return (
                        <li
                          key={comment.id}
                          id={`comment-${comment.id}`}
                          className={`scroll-mt-24 rounded-lg transition-colors duration-500 ${
                            highlight === comment.id ? "bg-[#7960D7]/15" : "bg-transparent"
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                              <Avatar
                                name={comment.author.name}
                                url={comment.author.avatarUrl}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-xs font-semibold text-gray-900">
                                    {comment.author.name}
                                  </p>
                                  <span className="text-[11px] text-gray-400">
                                    {relativeTime(comment.createdAt)}
                                  </span>
                                </div>
                                <CommentMenu
                                  authorName={comment.author.name}
                                  canBlock={comment.author.id !== viewerId}
                                  disabled={busy[post.id]}
                                  onHide={() => hideComment(post.id, comment)}
                                  onBlock={() =>
                                    setBlockTarget({
                                      postId: post.id,
                                      author: comment.author,
                                    })
                                  }
                                  onReport={() =>
                                    setReportTarget({
                                      type: "COMMENT",
                                      id: comment.id,
                                    })
                                  }
                                />
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                              <button
                                type="button"
                                onClick={() =>
                                  setReplyingTo((prev) => ({
                                    ...prev,
                                    [post.id]: replying ? null : comment.id,
                                  }))
                                }
                                className="mt-1 text-xs font-semibold text-[#7960D7] hover:underline"
                              >
                                {replying ? "Batal" : "Balas"}
                              </button>
                            </div>
                          </div>

                          {replies.length > 0 && (
                            <ul className="mt-3 ml-11 space-y-3">
                              {replies.map((reply) => (
                                <li
                                  key={reply.id}
                                  id={`comment-${reply.id}`}
                                  className={`flex scroll-mt-24 gap-2.5 rounded-lg transition-colors duration-500 ${
                                    highlight === reply.id ? "bg-[#7960D7]/15" : "bg-transparent"
                                  }`}
                                >
                                  {reply.hidden ? (
                                    <>
                                      <p className="text-xs italic text-gray-500">
                                        Balasan disembunyikan.
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => unhideComment(post.id, reply)}
                                        disabled={busy[post.id]}
                                        className="text-xs font-semibold text-[#7960D7] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        Tampilkan kembali
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                  <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                                    <Avatar
                                      name={reply.author.name}
                                      url={reply.author.avatarUrl}
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-xs font-semibold text-gray-900">
                                          {reply.author.name}
                                        </p>
                                        <span className="text-[11px] text-gray-400">
                                          {relativeTime(reply.createdAt)}
                                        </span>
                                      </div>
                                      <CommentMenu
                                        authorName={reply.author.name}
                                        canBlock={reply.author.id !== viewerId}
                                        disabled={busy[post.id]}
                                        onHide={() => hideComment(post.id, reply)}
                                        onBlock={() =>
                                          setBlockTarget({
                                            postId: post.id,
                                            author: reply.author,
                                          })
                                        }
                                        onReport={() =>
                                          setReportTarget({
                                            type: "COMMENT",
                                            id: reply.id,
                                          })
                                        }
                                      />
                                    </div>
                                    <p className="text-sm text-gray-700">{reply.content}</p>
                                  </div>
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}

                          {replying && (
                            <div className="mt-2 ml-11 flex gap-2">
                              <input
                                autoFocus
                                type="text"
                                value={replyDraft[comment.id] ?? ""}
                                onChange={(event) =>
                                  setReplyDraft((prev) => ({
                                    ...prev,
                                    [comment.id]: event.target.value,
                                  }))
                                }
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    submitReply(post.id, comment.id);
                                  }
                                }}
                                placeholder={`Balas ${comment.author.name}…`}
                                aria-label={`Balas komentar ${comment.author.name}`}
                                className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7960D7] focus:outline-none focus:ring-1 focus:ring-[#7960D7]"
                              />
                              <button
                                type="button"
                                onClick={() => submitReply(post.id, comment.id)}
                                disabled={
                                  busy[post.id] || !(replyDraft[comment.id] ?? "").trim()
                                }
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Kirim
                              </button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={commentDraft[post.id] ?? ""}
                    onChange={(event) =>
                      setCommentDraft((prev) => ({ ...prev, [post.id]: event.target.value }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") submitComment(post.id);
                    }}
                    placeholder="Tulis komentar…"
                    aria-label="Tulis komentar"
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7960D7] focus:outline-none focus:ring-1 focus:ring-[#7960D7]"
                  />
                  <button
                    type="button"
                    onClick={() => submitComment(post.id)}
                    disabled={busy[post.id] || !(commentDraft[post.id] ?? "").trim()}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Kirim
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}

      <ReportDialog
        target={reportTarget}
        onClose={() => setReportTarget(null)}
        onSubmitted={handleReportSubmitted}
      />

      <ConfirmDialog
        open={blockTarget !== null}
        title={`Blokir ${blockTarget?.author.name ?? ""}?`}
        description={`Kamu dan ${
          blockTarget?.author.name ?? "pengguna ini"
        } tidak akan bisa saling melihat postingan dan komentar. Kamu bisa membatalkannya nanti di Settings → Block list.`}
        confirmLabel="Ya, blokir"
        busy={blockTarget ? busy[blockTarget.postId] : false}
        onCancel={() => setBlockTarget(null)}
        onConfirm={() => {
          if (!blockTarget) return;
          const target = blockTarget;
          setBlockTarget(null);
          void blockAuthor(target.postId, target.author);
        }}
      />

      {shareTarget && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setShareTarget(null);
          }}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Bagikan ke"
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Bagikan ke</h2>
              <button
                type="button"
                onClick={() => setShareTarget(null)}
                aria-label="Tutup"
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={async () => {
                  const url = postUrl(shareTarget);
                  if (navigator.share) {
                    await navigator.share({ url }).catch(() => {});
                    setShareTarget(null);
                  } else {
                    await navigator.clipboard.writeText(url).catch(() => {});
                    setShareNote("Tautan disalin.");
                  }
                }}
                className="flex w-20 flex-shrink-0 flex-col items-center gap-2"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0084FF] text-white">
                  <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.5 2 2 6 2 11c0 2.9 1.6 5.5 4 7.1V22l3.7-2c.7.2 1.5.3 2.3.3 5.5 0 10-4 10-9.3S17.5 2 12 2zm1 13l-2.5-2.6L5 15.5l5-5 2.6 2.6L18 8.5 13 13z" />
                  </svg>
                </span>
                <span className="text-xs text-gray-700">Messenger</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(postUrl(shareTarget))}`}
                target="_blank"
                rel="noreferrer"
                className="flex w-20 flex-shrink-0 flex-col items-center gap-2"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20zm4.6-5.9c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 01-3.3-2.9c-.1-.2 0-.4.1-.5l.5-.6c.1-.2.1-.3 0-.5l-.8-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.8 2.2.8 2.6.7 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.1-.4-.2z" />
                  </svg>
                </span>
                <span className="text-xs text-gray-700">WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => copyLink(shareTarget)}
                className="flex w-20 flex-shrink-0 flex-col items-center gap-2"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1m-1.1-4.9a4 4 0 015.656 0l4 4a4 4 0 11-5.656 5.656l-1.1-1.1"
                    />
                  </svg>
                </span>
                <span className="text-xs text-gray-700">Salin tautan</span>
              </button>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl(shareTarget))}`}
                target="_blank"
                rel="noreferrer"
                className="flex w-20 flex-shrink-0 flex-col items-center gap-2"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.9 2H22l-7.1 8.1L23 22h-6.6l-5.2-6.8L5.3 22H2.2l7.6-8.7L1.6 2h6.7l4.7 6.2L18.9 2zm-1.1 18h1.8L7.3 3.8H5.4L17.8 20z" />
                  </svg>
                </span>
                <span className="text-xs text-gray-700">X</span>
              </a>
            </div>

            {shareNote && (
              <p role="status" className="mt-3 text-xs text-gray-600">
                {shareNote}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
