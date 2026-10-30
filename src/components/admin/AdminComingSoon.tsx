/**
 * Placeholder panel for admin sections that are not built yet. Keeping the
 * route alive means the sidebar never leads to a dead link.
 */
export function AdminComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEE9FF]">
        <svg
          className="h-6 w-6 text-[#7960D7]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-[#1F2937]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#6B7280]">
        {description}
      </p>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[#7960D7]">
        Segera hadir
      </p>
    </div>
  );
}
