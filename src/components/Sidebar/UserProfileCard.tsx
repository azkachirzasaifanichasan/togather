import { auth } from "@/lib/auth";

export async function UserProfileCard() {
  const session = await auth();

  if (!session?.user) {
    return (
      <a
        href="/login"
        className="bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
            ?
          </div>
          <span className="font-medium text-[#1F2937]">Masuk / Daftar</span>
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    );
  }

  // Get user initials
  const name = session.user.name || session.user.email || "User";
  const initial = name.charAt(0).toUpperCase();

  return (
    <a
      href="/profile"
      className="bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={name}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-[#7960D7] rounded-full flex items-center justify-center text-white font-bold">
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
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}
