"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Area, InterestCategory } from "@prisma/client";
import { AREA_LABELS, INTEREST_LABELS } from "@/lib/community-labels";

export type PendingSubmission = {
  id: string;
  communityId: string;
  submittedAt: string;
  community: {
    id: string;
    name: string;
    description: string;
    type: "ONLINE" | "OFFLINE";
    accessType: "PUBLIC" | "PRIVATE";
    categories: InterestCategory[];
    area: Area | null;
    addressText: string | null;
    memberCount: number;
  };
  submitter: {
    name: string | null;
    email: string;
  };
};

type Decision = { id: string; mode: "approve" } | { id: string; mode: "reject" };

/**
 * The approval queue: one card per pending submission with the submitter's
 * details, plus approve/reject.
 *
 * Rejection asks for a reason in a small inline dialog rather than a browser
 * prompt, because the reason is shown back to the creator and needs to be
 * readable.
 */
export function AdminApprovalQueue({ submissions }: { submissions: PendingSubmission[] }) {
  const router = useRouter();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const call = async (id: string, path: string, body?: unknown) => {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/submissions/${id}/${path}`, {
        method: "POST",
        ...(body
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }
          : {}),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(
          (payload as { error?: { message?: string } } | null)?.error?.message ??
            "Aksi gagal. Coba lagi."
        );
        return false;
      }

      setDecision(null);
      setReason("");
      router.refresh();
      return true;
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const confirmDecision = () => {
    if (!decision) return;

    if (decision.mode === "approve") {
      void call(decision.id, "approve");
      return;
    }

    const trimmed = reason.trim();
    if (trimmed.length < 10) {
      setError("Alasan penolakan minimal 10 karakter.");
      return;
    }
    void call(decision.id, "reject", { rejectionReason: trimmed });
  };

  if (submissions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#1F2937]">Tidak ada yang menunggu</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[#6B7280]">
          Semua pengajuan komunitas sudah diproses. Pengajuan baru akan muncul di
          sini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {submissions.map((submission) => {
        const busy = busyId === submission.id;
        return (
          <article
            key={submission.id}
            className="rounded-2xl border border-gray-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#EEE9FF] text-base font-semibold text-[#7960D7]">
                  {submission.community.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/admin/komunitas/${submission.communityId}/edit`}
                    className="font-semibold text-[#1F2937] hover:text-[#7960D7]"
                  >
                    {submission.community.name}
                  </Link>
                  <p className="mt-1 line-clamp-2 max-w-xl text-sm text-[#6B7280]">
                    {submission.community.description}
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                Menunggu review
              </span>
            </div>

            <dl className="mt-4 grid gap-3 border-t border-gray-100 pt-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="font-medium uppercase tracking-wider text-gray-400">
                  Pengaju
                </dt>
                <dd className="mt-0.5 text-[#1F2937]">
                  {submission.submitter.name ?? "Tanpa nama"}
                </dd>
                <dd className="truncate text-[#6B7280]">{submission.submitter.email}</dd>
              </div>
              <div>
                <dt className="font-medium uppercase tracking-wider text-gray-400">
                  Kategori
                </dt>
                <dd className="mt-0.5 text-[#1F2937]">
                  {submission.community.categories
                    .map((category) => INTEREST_LABELS[category])
                    .join(", ")}
                </dd>
              </div>
              <div>
                <dt className="font-medium uppercase tracking-wider text-gray-400">
                  Lokasi
                </dt>
                <dd className="mt-0.5 text-[#1F2937]">
                  {submission.community.type === "ONLINE"
                    ? "Online"
                    : (submission.community.area &&
                        AREA_LABELS[submission.community.area]) ??
                      "Belum diisi"}
                </dd>
                <dd className="text-[#6B7280]">
                  {submission.community.accessType === "PUBLIC" ? "Publik" : "Privat"}
                </dd>
              </div>
              <div>
                <dt className="font-medium uppercase tracking-wider text-gray-400">
                  Diajukan
                </dt>
                <dd className="mt-0.5 text-[#1F2937]">
                  {new Date(submission.submittedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4">
              <Link
                href={`/komunitas/${submission.communityId}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-[#1F2937] hover:bg-gray-50"
              >
                Lihat halaman
              </Link>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setReason("");
                  setDecision({ id: submission.id, mode: "reject" });
                }}
                disabled={busy}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                Tolak
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setDecision({ id: submission.id, mode: "approve" });
                }}
                disabled={busy}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {busy ? "Memproses..." : "Setujui"}
              </button>
            </div>
          </article>
        );
      })}

      {decision && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget && !busyId) setDecision(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="approval-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="approval-dialog-title" className="text-lg font-bold text-gray-900">
              {decision.mode === "approve"
                ? "Setujui komunitas ini?"
                : "Tolak pengajuan ini?"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {decision.mode === "approve"
                ? "Komunitas akan langsung tampil di Discovery dan pengaju menjadi pengurus pertamanya."
                : "Alasan penolakan akan disimpan pada pengajuan dan dibaca oleh pengaju."}
            </p>

            {decision.mode === "reject" && (
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Contoh: Deskripsi komunitas belum menjelaskan kegiatan yang akan dilakukan."
                className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-[#1F2937] placeholder-gray-400 focus:border-[#7960D7] focus:outline-none focus:ring-1 focus:ring-[#7960D7]"
              />
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDecision(null)}
                disabled={Boolean(busyId)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDecision}
                disabled={Boolean(busyId)}
                className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
                  decision.mode === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {busyId
                  ? "Memproses..."
                  : decision.mode === "approve"
                    ? "Ya, setujui"
                    : "Ya, tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
