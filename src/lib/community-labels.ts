import type { Area, InterestCategory } from "@prisma/client";

/**
 * Labels shared by the admin surfaces.
 *
 * Discovery and the create form still carry their own copies of these maps
 * (pre-existing); this module exists so the new admin screens agree with each
 * other without another duplicate.
 */
export const INTEREST_LABELS: Record<InterestCategory, string> = {
  OLAHRAGA: "Olahraga",
  TEKNOLOGI: "Teknologi",
  PENDIDIKAN: "Pendidikan",
  SENI_DAN_HIBURAN: "Seni & Hiburan",
  SOSIAL: "Sosial",
  LINGKUNGAN: "Lingkungan",
  BISNIS_DAN_KARIER: "Bisnis & Karier",
  HOBI: "Hobi",
  KEAGAMAAN: "Keagamaan",
  LAINNYA: "Lainnya",
};

export const AREA_LABELS: Record<Area, string> = {
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
  SLEMAN: "Sleman",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  GUNUNGKIDUL: "Gunungkidul",
};

export type SubmissionStatusValue = "PENDING" | "APPROVED" | "REJECTED" | null;

const SUBMISSION_LABELS = {
  APPROVED: "Aktif",
  PENDING: "Menunggu review",
  REJECTED: "Ditolak",
} as const;

const SUBMISSION_CLASSES = {
  APPROVED: "bg-green-50 text-green-700",
  PENDING: "bg-amber-50 text-amber-700",
  REJECTED: "bg-red-50 text-red-700",
} as const;

export function submissionLabel(status: SubmissionStatusValue) {
  return status ? SUBMISSION_LABELS[status] : "Tanpa pengajuan";
}

export function submissionClass(status: SubmissionStatusValue) {
  return status ? SUBMISSION_CLASSES[status] : "bg-gray-100 text-gray-600";
}
