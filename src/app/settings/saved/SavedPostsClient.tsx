"use client";

import Link from "next/link";
import { useState } from "react";
import type { SavedPostItem } from "@/server/posts";

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

export function SavedPostsClient({
  initialPosts,
}: {
  initialPosts: SavedPostItem[];
}) {
  const [posts, setPosts] = useState<SavedPostItem[]>(initialPosts);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleUnsave = async (postId: string) => {
    setBusyId(postId);
    try {
      const response = await fetch(`/api/posts/${postId}/save`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to unsave post");
      }

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      // Leave in place if request failed
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937]">Saved Posts</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Postingan yang kamu simpan dari berbagai komunitas.
            </p>
          </div>
          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#7960D7]">
            {posts.length} {posts.length === 1 ? "postingan" : "postingan"}
          </span>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-[#7960D7]">
            <svg
              className="h-7 w-7"
              fill="none"
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
          </div>
          <h3 className="mt-4 text-base font-bold text-gray-900">
            Belum ada postingan tersimpan
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
            Simpan postingan menarik dari beranda komunitas untuk dibaca atau
            dilihat kembali kapan saja di sini.
          </p>
          <div className="mt-6">
            <Link
              href="/discovery"
              className="inline-flex items-center gap-2 rounded-xl bg-[#7960D7] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#684fc9]"
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
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Jelajahi Komunitas
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <article
              key={post.saveId}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Header: Author & Community */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                    <Avatar
                      name={post.author.name}
                      url={post.author.avatarUrl}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {post.author.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {relativeTime(post.createdAt)}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/komunitas/${post.community.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#7960D7] transition-colors hover:bg-purple-100"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {post.community.name}
                </Link>
              </div>

              {/* Content */}
              {post.content && (
                <p className="mt-3.5 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                  {post.content}
                </p>
              )}

              {/* Media Preview */}
              {post.media.length > 0 && (
                <div
                  className={`mt-3.5 grid gap-2 ${
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
                            post.media.length > 1 ? "h-40" : "max-h-[360px]"
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

              {/* Footer actions */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-400">
                  Disimpan {relativeTime(post.savedAt)}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/komunitas/${post.community.id}#post-${post.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    Buka di Komunitas
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleUnsave(post.id)}
                    disabled={busyId === post.id}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" />
                    </svg>
                    {busyId === post.id ? "Menghapus..." : "Hapus simpanan"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

