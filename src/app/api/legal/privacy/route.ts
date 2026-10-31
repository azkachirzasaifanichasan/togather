import { NextResponse } from "next/server";
import { CURRENT_TERMS_VERSION } from "@/server/auth-verification";

export async function GET() {
  const privacyData = {
    version: CURRENT_TERMS_VERSION,
    lastUpdated: "2026-10-31",
    title: "Kebijakan Privasi Togather (Privacy Policy)",
    summary:
      "Kebijakan Privasi ini menjelaskan bagaimana Togather mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP).",
    sections: [
      {
        id: "data-collection",
        title: "1. Data yang Kami Kumpulkan",
        content:
          "Kami mengumpulkan data yang Anda berikan langsung saat pendaftaran dan pembaruan profil (seperti nama, alamat email, nomor telepon, area domisili, dan preferensi minat komunitas), serta data interaksi (komentar, rsvp event, dan keikutsertaan komunitas).",
      },
      {
        id: "purpose",
        title: "2. Tujuan Penggunaan Data",
        content:
          "Data pribadi digunakan untuk: (a) memverifikasi identitas akun, (b) memfasilitasi komunikasi dalam komunitas dan event, (c) memberikan rekomendasi komunitas berdasarkan domisili dan minat, dan (d) menjaga keamanan platform dari penyalahgunaan.",
      },
      {
        id: "security",
        title: "3. Keamanan Data & Penyimpanan",
        content:
          "Kata sandi Anda disimpan dalam bentuk cryptographic hash yang aman (bcrypt). Akses data pribadi dibatasi secara ketat hanya untuk fungsi operasional yang relevan.",
      },
      {
        id: "rights",
        title: "4. Hak Subjek Data",
        content:
          "Sesuai UU PDP, Anda berhak untuk mengakses, memperbaiki, memperbarui, atau meminta penghapusan data pribadi Anda melalui menu Pengaturan Profil atau dengan menghubungi tim dukungan Togather.",
      },
      {
        id: "contact",
        title: "5. Kontak Privasi",
        content:
          "Jika Anda memiliki pertanyaan mengenai perlindungan data Anda, silakan hubungi kami di support@togather.id.",
      },
    ],
  };

  return NextResponse.json(privacyData, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

