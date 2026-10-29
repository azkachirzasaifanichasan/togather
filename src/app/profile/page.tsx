import Link from "next/link";
import { redirect } from "next/navigation";
import { Area, InterestCategory } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserCommunities } from "@/server/communities";
import { getUserEventRegistrations } from "@/server/events";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const AREA_LABEL: Record<Area, string> = {
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
  SLEMAN: "Sleman",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  GUNUNGKIDUL: "Gunungkidul",
};

const INTEREST_LABEL: Record<InterestCategory, string> = {
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

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const [user, profile, communities, registrations] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, createdAt: true },
    }),
    prisma.userProfile.findUnique({ where: { userId } }),
    getUserCommunities(userId),
    getUserEventRegistrations(userId),
  ]);

  const name = profile?.name || user?.email || "User";
  const initial = name.charAt(0).toUpperCase();
  const isVerified = !!(
    profile?.phoneVerifiedAt &&
    profile.domicile &&
    profile.address
  );
  const joinedAt = (user?.createdAt ?? new Date()).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <Header />

      <div className="mx-auto w-full max-w-5xl flex-1 grid items-start gap-6 px-4 py-8 md:grid-cols-[320px_1fr] md:px-6">
        {/* Left card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="relative mx-auto w-fit md:mx-0">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={name}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#7960D7] text-3xl font-bold text-white">
                {initial}
              </div>
            )}
            <Link
              href="/settings/edit-profile"
              aria-label="Edit foto profil"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-[#6B7280] shadow hover:text-[#7960D7]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </Link>
          </div>

          <h1 className="mt-4 text-center text-xl font-bold text-[#1F2937] md:text-left">
            {name}
          </h1>
          <p className="text-center text-sm text-[#6B7280] md:text-left">
            @{name.toLowerCase().replace(/\s+/g, "")}
          </p>

          <p className="mt-3 flex items-center gap-2 text-sm text-[#6B7280]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{user?.email}</span>
          </p>

          <Link
            href="/settings/edit-profile"
            className="mt-2 inline-block text-sm font-semibold text-[#7960D7] hover:underline"
          >
            Edit profile
          </Link>

          {profile?.domicile && (
            <p className="mt-4 flex items-center gap-2 text-sm text-[#6B7280]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {AREA_LABEL[profile.domicile]}
            </p>
          )}

          <p className="mt-2 flex items-center gap-2 text-sm text-[#6B7280]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Bergabung {joinedAt}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-gray-100 pt-5 text-center">
            {[
              { value: communities.length, label: "Groups" },
              { value: profile?.interests.length ?? 0, label: "Interests" },
              { value: registrations.length, label: "RSVPs" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-lg font-bold text-[#1F2937]">{stat.value}</p>
                <p className="text-xs text-[#6B7280]">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-gray-100 pt-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1F2937]">About</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isVerified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {isVerified ? "Operator" : "User"}
              </span>
            </div>
            <p className="text-sm text-[#6B7280]">
              {profile?.bio ||
                (isVerified
                  ? "Operator Togather — bisa mengajukan komunitas."
                  : "Lengkapi profil untuk menjadi Operator.")}
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-[#1F2937]">
              My interests{" "}
              <span className="font-medium text-[#6B7280]">{profile?.interests.length ?? 0}</span>
            </h2>
            {profile?.interests.length ? (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-[#7960D7]"
                  >
                    {INTEREST_LABEL[interest]}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6B7280]">
                Belum ada minat.{" "}
                <Link href="/settings/edit-profile" className="font-semibold text-[#7960D7] hover:underline">
                  Tambahkan minat
                </Link>
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-[#1F2937]">Member</h2>
            {communities.length ? (
              <ul className="divide-y divide-gray-100">
                {communities.map((community) => (
                  <li key={community.id}>
                    <Link
                      href={`/komunitas/${community.id}`}
                      className="-mx-2 flex items-center justify-between rounded-lg px-2 py-3 hover:bg-gray-50"
                    >
                      <span className="text-sm font-medium text-[#1F2937]">{community.name}</span>
                      <span className="text-xs text-[#6B7280]">{community.memberCount} anggota</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-[#6B7280]">
                  Looks like you&apos;re not in any groups yet
                </p>
                <Link
                  href="/discovery"
                  className="mt-3 inline-block text-sm font-semibold text-[#7960D7] hover:underline"
                >
                  Search groups near you
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
