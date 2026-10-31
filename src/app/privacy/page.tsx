import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CURRENT_TERMS_VERSION } from "@/server/auth-verification";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Image src="/logo-togather.png" alt="Togather" width={32} height={32} className="object-contain" />
            <span className="text-xl font-bold text-gray-900">Togather Legal</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Kebijakan Privasi (Privacy Policy)
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Versi {CURRENT_TERMS_VERSION} • Terakhir diperbarui: 31 Oktober 2026
          </p>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-purple-900 text-sm mb-8 leading-relaxed">
            Kebijakan Privasi ini menjelaskan bagaimana Togather mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP).
          </div>

          <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">1. Data yang Kami Kumpulkan</h2>
              <p>Kami mengumpulkan data yang Anda berikan langsung saat pendaftaran dan pembaruan profil (seperti nama, alamat email, nomor telepon, area domisili, dan preferensi minat komunitas), serta data interaksi (komentar, rsvp event, dan keikutsertaan komunitas).</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">2. Tujuan Penggunaan Data</h2>
              <p>Data pribadi digunakan untuk: (a) memverifikasi identitas akun, (b) memfasilitasi komunikasi dalam komunitas dan event, (c) memberikan rekomendasi komunitas berdasarkan domisili dan minat, dan (d) menjaga keamanan platform dari penyalahgunaan.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">3. Keamanan Data & Penyimpanan</h2>
              <p>Kata sandi Anda disimpan dalam bentuk cryptographic hash yang aman (bcrypt). Akses data pribadi dibatasi secara ketat hanya untuk fungsi operasional yang relevan dan dilindungi dengan kontrol otorisasi berlapis.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">4. Hak Subjek Data</h2>
              <p>Sesuai UU PDP, Anda berhak untuk mengakses, memperbaiki, memperbarui, atau meminta penghapusan data pribadi Anda melalui menu Pengaturan Profil atau dengan menghubungi tim dukungan Togather.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">5. Kontak Privasi</h2>
              <p>Jika Anda memiliki pertanyaan mengenai perlindungan data Anda, silakan hubungi kami di support@togather.id.</p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
            <Link href="/register" className="text-sm font-semibold text-[#7960D7] hover:underline">
              ← Kembali ke Pendaftaran
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
              Lihat Ketentuan Layanan →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

