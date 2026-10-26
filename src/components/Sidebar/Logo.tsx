import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
      <div className="w-10 h-10 bg-[#7960D7] rounded-xl flex items-center justify-center">
        <Image
          src="/logo-togather.png"
          alt="Togather"
          width={32}
          height={32}
          className="object-contain"
        />
      </div>
      <span className="text-xl font-bold text-[#1F2937]">Togather</span>
    </Link>
  );
}
