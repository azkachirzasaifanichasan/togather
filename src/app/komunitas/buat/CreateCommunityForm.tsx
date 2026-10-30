"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Area, InterestCategory } from "@prisma/client";

const AREA_LABELS: Record<Area, string> = {
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
  SLEMAN: "Sleman",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  GUNUNGKIDUL: "Gunungkidul",
};

const INTEREST_LABELS: Record<InterestCategory, string> = {
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

type Privacy = "PUBLIC" | "PRIVATE";
type CommunityType = "ONLINE" | "OFFLINE";

type CommunityInitial = {
  id: string;
  name: string;
  description: string;
  type: CommunityType;
  accessType: Privacy;
  categories: InterestCategory[];
  area: Area | null;
  addressText: string | null;
};

/**
 * Facebook-style group form. Posts the same payload as
 * `createCommunitySchema`; approval is decided server-side by role.
 *
 * With `community` set it edits that community as admin (PATCH) and returns to
 * the admin manager instead of creating a submission.
 */
export function CreateCommunityForm({
  isAdmin,
  community,
}: {
  isAdmin: boolean;
  community?: CommunityInitial;
}) {
  const router = useRouter();
  const isEdit = Boolean(community);

  const [name, setName] = useState(community?.name ?? "");
  const [description, setDescription] = useState(community?.description ?? "");
  const [privacy, setPrivacy] = useState<Privacy>(community?.accessType ?? "PUBLIC");
  const [type, setType] = useState<CommunityType>(community?.type ?? "OFFLINE");
  const [area, setArea] = useState<Area | "">(community?.area ?? "");
  const [addressText, setAddressText] = useState(community?.addressText ?? "");
  const [categories, setCategories] = useState<InterestCategory[]>(
    community?.categories ?? []
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{
    communityId: string;
    status: "APPROVED" | "PENDING";
  } | null>(null);

  const toggleCategory = (key: InterestCategory) =>
    setCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (categories.length === 0) {
      setError("Pilih minimal 1 kategori.");
      return;
    }
    if (type === "OFFLINE" && !area) {
      setError("Pilih area untuk komunitas offline.");
      return;
    }

    setPending(true);
    try {
      const payloadBody = {
        name,
        description,
        type,
        accessType: privacy,
        categories,
        area: type === "OFFLINE" ? area : null,
        addressText: type === "OFFLINE" ? addressText.trim() || null : null,
      };

      if (isEdit) {
        const response = await fetch(`/api/admin/communities/${community!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadBody),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          const message = (payload as { error?: { message?: string } } | null)
            ?.error?.message;
          setError(message ?? "Gagal menyimpan perubahan. Coba lagi.");
          return;
        }

        router.push("/admin/komunitas");
        router.refresh();
        return;
      }

      const response = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadBody),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message = (payload as { error?: { message?: string } } | null)
          ?.error?.message;
        setError(message ?? "Gagal membuat komunitas. Coba lagi.");
        return;
      }

      const data = payload as {
        communityId: string;
        submissionStatus: "APPROVED" | "PENDING";
      };

      if (data.submissionStatus === "APPROVED") {
        router.push(`/komunitas/${data.communityId}`);
        return;
      }
      setResult({ communityId: data.communityId, status: data.submissionStatus });
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  };

  if (result) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EEE9FF]">
          <svg className="h-7 w-7 text-[#7960D7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#1F2937]">Pengajuan terkirim</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[#6B7280]">
          Komunitasmu sedang ditinjau Admin Togather. Setelah disetujui, komunitas
          akan tampil di halaman Community dan kamu menjadi pengurusnya.
        </p>
        <Link
          href="/komunitas"
          className="mt-6 inline-block rounded-lg bg-[#7960D7] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#6850C7]"
        >
          Kembali ke Community
        </Link>
      </div>
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || "K";

  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {/* Name + avatar preview, like Facebook's create-group dialog */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#7960D7] text-2xl font-bold text-white">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#1F2937]">
            Nama komunitas
          </label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={3}
            maxLength={100}
            placeholder="Contoh: Jogja Runners Club"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-[#1F2937]">
          Privasi komunitas
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              {
                key: "PUBLIC",
                title: "Publik",
                hint: "Siapa pun bisa melihat dan bergabung.",
              },
              {
                key: "PRIVATE",
                title: "Privat",
                hint: "Bergabung harus disetujui pengurus.",
              },
            ] as const
          ).map((option) => (
            <label
              key={option.key}
              className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                privacy === option.key
                  ? "border-[#7960D7] bg-[#EEE9FF]"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="accessType"
                value={option.key}
                checked={privacy === option.key}
                onChange={() => setPrivacy(option.key)}
                className="sr-only"
              />
              <span className="block text-sm font-semibold text-[#1F2937]">
                {option.title}
              </span>
              <span className="mt-1 block text-xs text-[#6B7280]">{option.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-[#1F2937]">
          Deskripsi
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          minLength={20}
          maxLength={2000}
          rows={4}
          placeholder="Ceritakan tentang komunitasmu dan kegiatan rutinnya."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
        />
        <p className="mt-1 text-xs text-gray-400">Minimal 20 karakter.</p>
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-[#1F2937]">
          Jenis komunitas
        </legend>
        <div className="flex gap-2">
          {(["OFFLINE", "ONLINE"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setType(option)}
              aria-pressed={type === option}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                type === option
                  ? "bg-[#7960D7] text-white"
                  : "bg-gray-50 text-[#6B7280] hover:bg-[#EEE9FF] hover:text-[#7960D7]"
              }`}
            >
              {option === "OFFLINE" ? "Offline" : "Online"}
            </button>
          ))}
        </div>
      </fieldset>

      {type === "OFFLINE" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="area" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Area
            </label>
            <select
              id="area"
              value={area}
              onChange={(event) => setArea(event.target.value as Area | "")}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
            >
              <option value="">Pilih area</option>
              {Object.entries(AREA_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="addressText" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Lokasi umum <span className="font-normal text-gray-400">(opsional)</span>
            </label>
            <input
              id="addressText"
              value={addressText}
              onChange={(event) => setAddressText(event.target.value)}
              maxLength={300}
              placeholder="Contoh: Alun-Alun Kidul"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
            />
          </div>
        </div>
      )}

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-[#1F2937]">
          Kategori <span className="font-normal text-gray-400">(pilih minimal 1)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(INTEREST_LABELS) as InterestCategory[]).map((key) => (
            <label
              key={key}
              className="cursor-pointer rounded-full border border-gray-300 px-4 py-2 text-sm text-[#6B7280] has-[:checked]:border-[#7960D7] has-[:checked]:bg-purple-50 has-[:checked]:font-semibold has-[:checked]:text-[#7960D7]"
            >
              <input
                type="checkbox"
                checked={categories.includes(key)}
                onChange={() => toggleCategory(key)}
                className="sr-only"
              />
              {INTEREST_LABELS[key]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-6">
        <p className="text-xs text-[#6B7280]">
          {isEdit
            ? "Perubahan langsung tersimpan dan tampil di halaman Community."
            : isAdmin
            ? "Sebagai admin, komunitas ini langsung tampil tanpa antrean persetujuan."
            : "Pengajuan akan ditinjau Admin Togather sebelum tampil."}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="flex-shrink-0 rounded-lg bg-[#7960D7] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#6850C7] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Menyimpan..."
            : isEdit
            ? "Simpan perubahan"
            : "Buat komunitas"}
        </button>
      </div>
    </form>
  );
}
