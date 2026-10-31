import { NextResponse } from "next/server";
import { CURRENT_TERMS_VERSION } from "@/server/auth-verification";

export async function GET() {
  const termsData = {
    version: CURRENT_TERMS_VERSION,
    lastUpdated: "2026-10-31",
    title: "Ketentuan Layanan Togather (Terms of Service)",
    summary:
      "Ketentuan Layanan ini mengatur penggunaan platform Togather untuk menghubungkan komunitas dan menyelenggarakan kegiatan bersama di Yogyakarta dan sekitarnya.",
    sections: [
      {
        id: "acceptance",
        title: "1. Penerimaan Ketentuan",
        content:
          "Dengan mendaftar, mengakses, atau menggunakan layanan Togather, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh Ketentuan Layanan ini dan Kebijakan Privasi kami.",
      },
      {
        id: "accounts",
        title: "2. Akun Pengguna & Keamanan",
        content:
          "Anda bertanggung jawab penuh untuk menjaga kerahasiaan kata sandi dan keamanan akun Anda. Anda dilarang memberikan akses akun kepada pihak ketiga atau menggunakan akun orang lain tanpa izin sah.",
      },
      {
        id: "communities-and-events",
        title: "3. Komunitas dan Penyelenggaraan Event",
        content:
          "Penyelenggara komunitas wajib memberikan informasi yang akurat mengenai deskripsi komunitas, lokasi kegiatan, kuota partisipan, serta biaya (jika ada). Togather berhak menolak atau menonaktifkan komunitas yang melanggar norma hukum atau memicu konflik.",
      },
      {
        id: "code-of-conduct",
        title: "4. Norma Interaksi & Larangan Konten",
        content:
          "Pengguna dilarang mempublikasikan ujaran kebencian, konten bernuansa SARA, pelecehan, penipuan, spam, atau materi yang melanggar hak cipta. Togather berhak menghapus konten yang melanggar tanpa pemberitahuan sebelumnya.",
      },
      {
        id: "liability",
        title: "5. Batasan Tanggung Jawab",
        content:
          "Togather bertindak sebagai platform penghubung. Kehadiran dan partisipasi pada kegiatan offline merupakan tanggung jawab masing-masing individu. Togather tidak bertanggung jawab atas kerugian materiil maupun non-materiil yang terjadi di luar kendali sistem platform.",
      },
      {
        id: "changes",
        title: "6. Perubahan Ketentuan",
        content:
          "Kami dapat memperbarui Ketentuan Layanan sewaktu-waktu. Perubahan material akan diumumkan melalui aplikasi atau notifikasi email.",
      },
    ],
  };

  return NextResponse.json(termsData, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

