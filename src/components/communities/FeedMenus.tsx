"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Close a dropdown on an outside click or Escape. `setOpen` comes from
 * `useState`, so it is stable and safe as an effect dependency.
 */
function useMenuDismiss(
  open: boolean,
  setOpen: (open: boolean) => void
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return ref;
}

function DotsIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 10a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  );
}

/**
 * The three-dot menu in the corner of a post. Supports reporting the post,
 * and blocking the author when viewing someone else's post.
 */
export function PostMenu({
  authorName,
  canBlock = false,
  disabled = false,
  onReport,
  onBlock,
}: {
  authorName?: string;
  canBlock?: boolean;
  disabled?: boolean;
  onReport: () => void;
  onBlock?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useMenuDismiss(open, setOpen);
  const firstName = authorName?.split(" ")[0] || authorName || "User";

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Opsi postingan"
        className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
      >
        <DotsIcon />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 top-9 z-30 overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-xl ${
            canBlock && onBlock ? "w-64" : "w-44"
          }`}
        >
          {canBlock && onBlock && (
            <button
              type="button"
              role="menuitem"
              disabled={disabled}
              onClick={() => {
                setOpen(false);
                onBlock();
              }}
              className="block w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="block text-sm font-semibold text-gray-900">
                Block {firstName}
              </span>
              <span className="mt-0.5 block text-xs font-normal leading-snug text-gray-500">
                You won&apos;t be able to see or contact each other.
              </span>
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            disabled={disabled}
            onClick={() => {
              setOpen(false);
              onReport();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
            Report post
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * The three-dot menu on a comment: hide it from this viewer, block its author,
 * or report it. The block row carries the explanatory subtitle from the
 * reference design.
 */
export function CommentMenu({
  authorName,
  canBlock,
  disabled = false,
  onHide,
  onBlock,
  onReport,
}: {
  authorName: string;
  canBlock: boolean;
  disabled?: boolean;
  onHide: () => void;
  onBlock: () => void;
  onReport: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useMenuDismiss(open, setOpen);
  const firstName = authorName.split(" ")[0] || authorName;

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Opsi komentar"
        className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
      >
        <DotsIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-8 z-30 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            disabled={disabled}
            onClick={() => run(onHide)}
            className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hide comment
          </button>

          {canBlock && (
            <button
              type="button"
              role="menuitem"
              disabled={disabled}
              onClick={() => run(onBlock)}
              className="block w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="block text-sm font-semibold text-gray-900">
                Block {firstName}
              </span>
              <span className="mt-0.5 block text-xs font-normal leading-snug text-gray-500">
                You won&apos;t be able to see or contact each other.
              </span>
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            disabled={disabled}
            onClick={() => run(onReport)}
            className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Report comment
          </button>
        </div>
      )}
    </div>
  );
}
