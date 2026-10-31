import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CURRENT_TERMS_VERSION } from "@/server/auth-verification";

export default function TermsPage() {
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
            Ketentuan Layanan (Terms of Service)
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Versi {CURRENT_TERMS_VERSION} • Terakhir diperbarui: 31 Oktober 2026
          </p>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-purple-900 text-sm mb-8 leading-relaxed">
            Ketentuan Layanan ini mengatur penggunaan platform Togather untuk menghubungkan komunitas dan menyelenggarakan kegiatan bersama di Daerah Istimewa Yogyakarta.
          </div>

          <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">1. Penerimaan Ketentuan</h2>
              <p>Dengan mendaftar, mengakses, atau menggunakan layanan Togather, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh Ketentuan Layanan ini dan Kebijakan Privasi kami.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">2. Akun Pengguna & Keamanan</h2>
              <p>Anda bertanggung jawab penuh untuk menjaga kerahasiaan kata sandi dan keamanan akun Anda. Anda dilarang memberikan akses akun kepada pihak ketiga atau menggunakan akun orang lain tanpa izin sah.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">3. Komunitas dan Penyelenggaraan Event</h2>
              <p>Penyelenggara komunitas wajib memberikan informasi yang akurat mengenai deskripsi komunitas, lokasi kegiatan, kuota partisipan, serta biaya (jika ada). Togather berhak menolak atau menonaktifkan komunitas yang melanggar norma hukum atau memicu konflik.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">4. Norma Interaksi & Larangan Konten</h2>
              <p>Pengguna dilarang mempublikasikan ujaran kebencian, konten bernuansa SARA, pelecehan, penipuan, spam, atau materi yang melanggar hak cipta. Togather berhak menghapus konten yang melanggar tanpa pemberitahuan sebelumnya.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">5. Batasan Tanggung Jawab</h2>
              <p>Togather bertindak sebagai platform penghubung. Kehadiran dan partisipasi pada kegiatan offline merupakan tanggung jawab masing-masing individu. Togather tidak bertanggung jawab atas kerugian materiil maupun non-materiil yang terjadi di luar kendali sistem platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">6. Perubahan Ketentuan</h2>
              <p>Kami dapat memperbarui Ketentuan Layanan sewaktu-waktu. Perubahan material akan diumumkan melalui aplikasi atau notifikasi email.</p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
            <Link href="/register" className="text-sm font-semibold text-[#7960D7] hover:underline">
              ← Kembali ke Pendaftaran
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
              Lihat Kebijakan Privasi →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

