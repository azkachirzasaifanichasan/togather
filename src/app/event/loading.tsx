import { Header } from "@/components/Header";

const BLOCK = "animate-pulse bg-[#E4DFD3]";

export default function EventLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6F4EE]">
      <Header showSearch={false} />

      <main className="flex-1">
        <div className="border-b border-[#D9D3C6]">
          <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
            <div className="flex items-center justify-between border-b border-[#D9D3C6]/70 py-4">
              <div className={`h-2.5 w-48 rounded-sm ${BLOCK}`} />
              <div className={`h-2.5 w-28 rounded-sm ${BLOCK}`} />
            </div>

            <div className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.45fr)_minmax(290px,0.55fr)] lg:items-end lg:gap-16 lg:py-20">
              <div>
                <div className={`h-14 w-[85%] rounded-sm sm:h-20 ${BLOCK}`} />
                <div className={`mt-2 h-14 w-[55%] rounded-sm sm:h-20 ${BLOCK}`} />
                <div className="mt-8 flex items-start gap-4">
                  <div className="mt-3 h-px w-10 bg-[#CFC9BB]" />
                  <div className={`h-3 w-72 rounded-sm ${BLOCK}`} />
                </div>
              </div>

              <div className="border-t border-[#D9D3C6] pt-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className={`h-2.5 w-20 rounded-sm ${BLOCK}`} />
                    <div className={`mt-2 h-8 w-12 rounded-sm ${BLOCK}`} />
                  </div>
                  <div>
                    <div className={`h-2.5 w-16 rounded-sm ${BLOCK}`} />
                    <div className={`mt-2 h-8 w-12 rounded-sm ${BLOCK}`} />
                  </div>
                </div>
                <div className={`mt-8 h-10 w-full rounded-sm ${BLOCK}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="border-y border-[#D9D3C6] bg-[#EFECE4]">
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
            <div className="flex items-center gap-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2.5 rounded-sm ${BLOCK}`}
                  style={{ width: `${48 + ((index * 13) % 32)}px` }}
                />
              ))}
            </div>
            <div className={`hidden h-2.5 w-24 rounded-sm sm:block ${BLOCK}`} />
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1200px] px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
          <div className="flex items-center justify-between border-b border-[#1A1A17]/20 pb-3">
            <div className={`h-5 w-24 rounded-sm ${BLOCK}`} />
            <div className={`h-2.5 w-28 rounded-sm ${BLOCK}`} />
          </div>

          <div className="mt-5 grid overflow-hidden border border-[#1A1A17]/15 lg:grid-cols-[1.22fr_0.88fr]">
            <div className={`min-h-[280px] sm:min-h-[380px] lg:min-h-[540px] ${BLOCK}`} />
            <div className="bg-[#E9E5DA] px-6 py-7 sm:px-9 sm:py-9 lg:px-10 lg:py-11">
              <div className={`h-2.5 w-32 rounded-sm ${BLOCK}`} />
              <div className={`mt-7 h-12 w-[88%] rounded-sm ${BLOCK}`} />
              <div className={`mt-2 h-12 w-[62%] rounded-sm ${BLOCK}`} />
              <div className={`mt-5 h-3 w-full rounded-sm ${BLOCK}`} />
              <div className={`mt-2 h-3 w-4/5 rounded-sm ${BLOCK}`} />
              <div className="mt-10 grid grid-cols-2 gap-5 border-t border-[#1A1A17]/10 pt-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index}>
                    <div className={`h-2 w-12 rounded-sm ${BLOCK}`} />
                    <div className={`mt-2 h-3 w-24 rounded-sm ${BLOCK}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-14 flex items-center justify-between border-b border-[#1A1A17]/20 pb-3">
            <div className={`h-5 w-28 rounded-sm ${BLOCK}`} />
            <div className={`h-2.5 w-16 rounded-sm ${BLOCK}`} />
          </div>

          <div className="mt-4 border-t border-[#1A1A17]/10">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[54px_minmax(0,1fr)] items-center gap-4 border-b border-[#1A1A17]/10 py-5 sm:grid-cols-[76px_168px_minmax(0,1fr)_auto] sm:gap-6 sm:py-6"
              >
                <div>
                  <div className={`h-2 w-8 rounded-sm ${BLOCK}`} />
                  <div className={`mt-1.5 h-7 w-10 rounded-sm ${BLOCK}`} />
                  <div className={`mt-1 h-2 w-7 rounded-sm ${BLOCK}`} />
                </div>
                <div className={`hidden aspect-[4/3] sm:block ${BLOCK}`} />
                <div>
                  <div className={`h-2 w-24 rounded-sm ${BLOCK}`} />
                  <div className={`mt-2 h-4 w-3/4 rounded-sm ${BLOCK}`} />
                  <div className={`mt-2 h-2.5 w-1/2 rounded-sm ${BLOCK}`} />
                </div>
                <div className="hidden sm:block">
                  <div className={`ml-auto h-3 w-16 rounded-sm ${BLOCK}`} />
                  <div className={`ml-auto mt-2 h-2 w-12 rounded-sm ${BLOCK}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
