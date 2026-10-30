"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PostMedia = {
  url: string;
  type: "image" | "video";
  name: string;
};

type PickedFile = {
  file: File;
  previewUrl: string;
  kind: "image" | "video";
};

const MAX_FILES = 4;
const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB per file
const ACCEPTED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
const ACCEPTED_SET = new Set(ACCEPTED);

function kindOf(file: File): "image" | "video" {
  return file.type.startsWith("video/") ? "video" : "image";
}

/**
 * The "+" trigger and the post composer dialog.
 *
 * Files are uploaded first (`/api/upload`) and the returned URLs go into the
 * post body, so the feed only ever renders files the server accepted.
 */
export function PostComposer({
  communityId,
  canPost,
  onPosted,
}: {
  communityId: string;
  canPost: boolean;
  onPosted: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filesRef = useRef<PickedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const syncFiles = (next: PickedFile[]) => {
    filesRef.current = next;
    setFiles(next);
  };

  const reset = useCallback(() => {
    filesRef.current.forEach((picked) => URL.revokeObjectURL(picked.previewUrl));
    filesRef.current = [];
    setFiles([]);
    setContent("");
    setError(null);
  }, []);

  const close = useCallback(() => {
    if (busy) return;
    reset();
    setOpen(false);
  }, [busy, reset]);

  // Focus the textarea when the dialog opens, and close on Escape.
  useEffect(() => {
    if (!open) return;

    textareaRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const addFiles = (selected: FileList | null) => {
    if (!selected) return;

    const next = [...filesRef.current];
    let message: string | null = null;

    for (const file of Array.from(selected)) {
      if (next.length >= MAX_FILES) {
        message = `Maksimal ${MAX_FILES} lampiran.`;
        break;
      }
      if (!ACCEPTED_SET.has(file.type)) {
        message = "Tipe file tidak didukung. Gunakan gambar JPG/PNG/WEBP/GIF atau video MP4/MOV/WEBM.";
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        message = "Ukuran file maksimal 50 MB.";
        continue;
      }

      next.push({
        file,
        previewUrl: URL.createObjectURL(file),
        kind: kindOf(file),
      });
    }

    syncFiles(next);
    setError(message);

    // Allow picking the same file again after removing it.
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    syncFiles(filesRef.current.filter((picked) => picked.previewUrl !== previewUrl));
  };

  const submit = async () => {
    const body = content.trim();
    const picked = filesRef.current;
    if (!body && picked.length === 0) return;

    setBusy(true);
    setError(null);

    try {
      let media: PostMedia[] = [];

      if (picked.length > 0) {
        const data = new FormData();
        picked.forEach((item) => data.append("files", item.file));

        const upload = await fetch("/api/upload", { method: "POST", body: data });
        if (!upload.ok) {
          const payload = await upload.json().catch(() => null);
          setError(payload?.error?.message ?? "Gagal mengunggah lampiran.");
          return;
        }

        const payload = await upload.json();
        media = payload.files ?? [];
      }

      const response = await fetch(`/api/communities/${communityId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: body, media }),
      });

      if (!response.ok) {
        setError("Gagal memposting. Coba lagi.");
        return;
      }

      reset();
      setOpen(false);
      await onPosted();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  if (!canPost) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 text-left transition-colors hover:bg-gray-50"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7960D7] text-white">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
        <span className="text-sm font-medium text-gray-500">Buat postingan…</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-composer-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="post-composer-title" className="text-lg font-bold text-gray-900">
                Buat postingan
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Tutup"
                className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <label htmlFor="post-composer-text" className="sr-only">
              Tulis postingan
            </label>
            <textarea
              ref={textareaRef}
              id="post-composer-text"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Apa yang ingin kamu bagikan ke komunitas ini?"
              rows={4}
              className="w-full resize-y rounded-lg border border-gray-200 p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#7960D7] focus:outline-none focus:ring-1 focus:ring-[#7960D7]"
            />

            {files.length > 0 && (
              <div className={`mt-3 grid gap-2 ${files.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                {files.map((picked) => (
                  <div
                    key={picked.previewUrl}
                    className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                  >
                    {picked.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={picked.previewUrl}
                        alt={picked.file.name}
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <video src={picked.previewUrl} controls className="h-36 w-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(picked.previewUrl)}
                      aria-label={`Hapus ${picked.file.name}`}
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="mt-3 text-xs text-red-600" role="alert">
                {error}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <input
                  ref={inputRef}
                  id="post-composer-media"
                  type="file"
                  accept={ACCEPTED.join(",")}
                  multiple
                  className="sr-only"
                  onChange={(event) => addFiles(event.target.files)}
                />
                <label
                  htmlFor="post-composer-media"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <svg className="h-5 w-5 text-[#7960D7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Foto/Video
                </label>
                <p className="mt-1 text-[11px] text-gray-500">Maks 4 file · 50 MB per file</p>
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={busy || (!content.trim() && files.length === 0)}
                className="rounded-lg bg-[#7960D7] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6850C7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Memposting..." : "Posting"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
