export default function HelpPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-xl font-bold text-[#1F2937] mb-1">Help</h2>
      <p className="text-sm text-[#6B7280] mb-6">
        Pertanyaan yang sering ditanyakan soal akun Togather.
      </p>

      <dl className="space-y-5 text-sm">
        <div>
          <dt className="font-semibold text-[#1F2937]">
            Apa bedanya User dan Operator?
          </dt>
          <dd className="text-[#6B7280] mt-1">
            Semua akun mulai sebagai User. Setelah melengkapi nomor HP
            terverifikasi, domisili, dan alamat, akun kamu menjadi Operator dan
            bisa mengajukan komunitas.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[#1F2937]">Bagaimana verifikasi HP?</dt>
          <dd className="text-[#6B7280] mt-1">
            Buka Edit Profile, isi nomor HP, lalu masukkan 6 digit kode yang
            dikirim. Untuk demo, kode apa pun diterima.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[#1F2937]">Kenapa grup saya kosong?</dt>
          <dd className="text-[#6B7280] mt-1">
            Komunitas yang kamu ikuti muncul di profil setelah kamu bergabung
            dari halaman Discovery atau halaman komunitas.
          </dd>
        </div>
      </dl>
    </div>
  );
}
