import Link from "next/link";
import Image from "next/image";

function Soon({ children }: { children: React.ReactNode }) {
  return (
    <span className="cursor-default text-gray-500" title="Segera hadir">
      {children}
    </span>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#1F2937] text-white">
      <div className="rounded-t-3xl bg-[#1F2937]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7960D7]">
                  <Image
                    src="/logo-togather.png"
                    alt="Togather"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-bold">Togather</span>
              </div>
              <p className="text-sm text-gray-400">
                Platform discovery komunitas dan event di Daerah Istimewa Yogyakarta.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold">Akun</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/register" className="transition-colors hover:text-white">
                    Daftar
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="transition-colors hover:text-white">
                    Masuk
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="transition-colors hover:text-white">
                    Profil
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold">Jelajahi</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/discovery" className="transition-colors hover:text-white">
                    Peta discovery
                  </Link>
                </li>
                <li>
                  <Link href="/komunitas" className="transition-colors hover:text-white">
                    Komunitas
                  </Link>
                </li>
                <li>
                  <Link href="/event" className="transition-colors hover:text-white">
                    Event
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold">Togather</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Soon>Tentang</Soon>
                </li>
                <li>
                  <Soon>Blog</Soon>
                </li>
                <li>
                  <Soon>Karier</Soon>
                </li>
                <li>
                  <Soon>Pusat bantuan</Soon>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-gray-400">
                © 2026 Togather. Dibuat untuk komunitas DIY.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
                <Soon>Ketentuan layanan</Soon>
                <Soon>Kebijakan privasi</Soon>
                <Soon>Kebijakan cookie</Soon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
