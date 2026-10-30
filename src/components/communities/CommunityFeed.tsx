"use client";

import { useState } from "react";
import { PostComposer, type PostMedia } from "@/components/communities/PostComposer";

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
};

export type FeedComment = {
  id: string;
  content: string;
  parentId: string | null;
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
}: {
  communityId: string;
  canPost: boolean;
  initialPosts: FeedPost[];
}) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);

  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, FeedComment[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<Record<string, string | null>>({});
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

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

  const toggleComments = async (postId: string) => {
    const next = !openComments[postId];
    setOpenComments((prev) => ({ ...prev, [postId]: next }));

    if (next && !comments[postId]) {
      try {
        const response = await fetch(`/api/posts/${postId}/comments`);
        if (!response.ok) return;
        const payload = await response.json();
        setComments((prev) => ({ ...prev, [postId]: payload.comments ?? [] }));
      } catch {
        // Ignore.
      }
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
            className="rounded-2xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-center gap-3">
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
                onClick={() => share(post.id)}
                disabled={busy[post.id]}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-60"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M8.684 13.368l-4.21 2.665A1 1 0 003 15.5V5a2 2 0 012-2h14a2 2 0 012 2v10.5a1 1 0 01-1.53.533l-4.21-2.665a1 1 0 00-1.037 0l-4.21 2.665a1 1 0 01-1.037 0z"
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

                      return (
                        <li key={comment.id}>
                          <div className="flex gap-3">
                            <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                              <Avatar
                                name={comment.author.name}
                                url={comment.author.avatarUrl}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-xs font-semibold text-gray-900">
                                  {comment.author.name}
                                </p>
                                <span className="text-[11px] text-gray-400">
                                  {relativeTime(comment.createdAt)}
                                </span>
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
                                <li key={reply.id} className="flex gap-2.5">
                                  <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                                    <Avatar
                                      name={reply.author.name}
                                      url={reply.author.avatarUrl}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-xs font-semibold text-gray-900">
                                        {reply.author.name}
                                      </p>
                                      <span className="text-[11px] text-gray-400">
                                        {relativeTime(reply.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{reply.content}</p>
                                  </div>
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
    </div>
  );
}
