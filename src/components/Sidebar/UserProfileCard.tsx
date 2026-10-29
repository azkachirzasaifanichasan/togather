import { auth } from "@/lib/auth";
import Link from "next/link";

export async function UserProfileCard() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 font-bold text-white">
            ?
          </div>
          <span className="font-medium text-[#1F2937]">Masuk / Daftar</span>
        </div>
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    );
  }

  const name = session.user.name || session.user.email || "User";
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link
      href="/profile"
      className="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
    >
      <div className="flex items-center gap-3">
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={session.user.image} alt={name} className="h-10 w-10 rounded-full" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7960D7] font-bold text-white">
            {initial}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-medium text-[#1F2937]">{name}</span>
          <span className="text-xs text-[#6B7280]">
            {session.user.isAdmin ? "Admin Togather" : "User"}
          </span>
        </div>
      </div>
      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
