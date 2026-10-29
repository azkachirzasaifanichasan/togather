import { redirect } from "next/navigation";
import { Area, InterestCategory } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { completeProfileSchema, activatePhoneSchema } from "@/lib/validations";
import { completeUserProfile, simulatePhoneActivation } from "@/server/users";
import { AvatarPicker } from "@/components/AvatarPicker";

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

async function saveProfile(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = completeProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    domicile: formData.get("domicile"),
    address: formData.get("address"),
    avatarUrl: formData.get("avatarUrl") ?? "",
    interests: formData.getAll("interests"),
    bio: formData.get("bio") ?? "",
  });

  if (!parsed.success) {
    redirect(
      "/settings/edit-profile?error=" +
        encodeURIComponent(parsed.error.issues[0].message)
    );
  }

  await completeUserProfile(session.user.id, parsed.data);
  redirect("/settings/edit-profile?saved=1");
}

async function verifyPhone(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = activatePhoneSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    redirect(
      "/settings/edit-profile?error=" +
        encodeURIComponent(parsed.error.issues[0].message)
    );
  }

  const result = await simulatePhoneActivation(
    session.user.id,
    parsed.data.code
  );

  redirect(
    result.success
      ? "/settings/edit-profile?saved=1"
      : "/settings/edit-profile?error=" + encodeURIComponent(result.message)
  );
}

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { error, saved } = await searchParams;

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  const isVerified = !!(
    profile?.phoneVerifiedAt &&
    profile.domicile &&
    profile.address
  );
  const initial = (profile?.name || session.user.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937]">Edit Profile</h2>
            <p className="text-sm text-[#6B7280] mt-1">{session.user.email}</p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isVerified
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {isVerified ? "Operator" : "User"}
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Perubahan tersimpan.
          </div>
        )}

        {!isVerified && (
          <p className="mb-6 text-sm text-[#6B7280] bg-gray-50 rounded-lg p-4">
            Lengkapi nomor HP terverifikasi, domisili, dan alamat untuk menjadi{" "}
            <strong>Operator</strong> dan bisa mengajukan komunitas.
          </p>
        )}

        <form action={saveProfile} className="space-y-5">
          <AvatarPicker initialUrl={profile?.avatarUrl ?? null} initial={initial} />

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#1F2937] mb-2"
            >
              Nama lengkap
            </label>
            <input
              id="name"
              name="name"
              defaultValue={profile?.name ?? ""}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7960D7] focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-[#1F2937] mb-2"
            >
              Nomor HP
            </label>
            <input
              id="phone"
              name="phone"
              defaultValue={profile?.phone ?? ""}
              required
              placeholder="08xxxxxxxxxx"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7960D7] focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="domicile"
              className="block text-sm font-medium text-[#1F2937] mb-2"
            >
              Domisili
            </label>
            <select
              id="domicile"
              name="domicile"
              defaultValue={profile?.domicile ?? ""}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7960D7] focus:border-transparent"
            >
              <option value="" disabled>
                Pilih area
              </option>
              {Object.entries(AREA_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-[#1F2937] mb-2"
            >
              Alamat
            </label>
            <textarea
              id="address"
              name="address"
              defaultValue={profile?.address ?? ""}
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7960D7] focus:border-transparent"
            />
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-[#1F2937] mb-2">
              Minat
            </legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(INTEREST_LABEL) as InterestCategory[]).map((key) => {
                const checked = profile?.interests.includes(key) ?? false;
                return (
                  <label
                    key={key}
                    className="cursor-pointer text-sm px-4 py-2 rounded-full border border-gray-300 text-[#6B7280] has-[:checked]:bg-purple-50 has-[:checked]:border-[#7960D7] has-[:checked]:text-[#7960D7] has-[:checked]:font-semibold"
                  >
                    <input
                      type="checkbox"
                      name="interests"
                      value={key}
                      defaultChecked={checked}
                      className="sr-only"
                    />
                    {INTEREST_LABEL[key]}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-[#1F2937] mb-2"
            >
              About
            </label>
            <textarea
              id="bio"
              name="bio"
              defaultValue={profile?.bio ?? ""}
              rows={3}
              maxLength={500}
              placeholder="Ceritakan sedikit tentang kamu"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7960D7] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-[#7960D7] hover:bg-[#6950c7] text-white font-semibold rounded-lg transition-colors"
          >
            Simpan profil
          </button>
        </form>

        {/* Phone activation: demo mode accepts any 6-digit code, same as PRD's simulated WhatsApp OTP */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-[#1F2937] mb-1">
            Aktivasi nomor HP
          </h3>
          <p className="text-sm text-[#6B7280] mb-4">
            {profile?.phoneVerifiedAt
              ? "Nomor HP sudah terverifikasi."
              : "Masukkan 6 digit kode (demo: kode apa pun diterima)."}
          </p>
          {!profile?.phoneVerifiedAt && (
            <form action={verifyPhone} className="flex gap-3">
              <input
                name="code"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="123456"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7960D7] focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 border-2 border-[#7960D7] text-[#7960D7] font-semibold rounded-lg hover:bg-purple-50 transition-colors"
              >
                Verifikasi
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
