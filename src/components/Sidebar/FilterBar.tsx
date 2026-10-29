"use client";

import { InterestCategory, Area } from "@prisma/client";

const INTEREST_LABELS: Record<InterestCategory, string> = {
  OLAHRAGA: "Olahraga",
  TEKNOLOGI: "Teknologi",
  PENDIDIKAN: "Pendidikan",
  SENI_DAN_HIBURAN: "Seni & Hiburan",
  SOSIAL: "Sosial",
  LINGKUNGAN: "Lingkungan",
  BISNIS_DAN_KARIER: "Bisnis & Karier",
  HOBI: "Hobi",
  KEAGAMAAN: "Keagamaan",
  LAINNYA: "Lainnya",
};

const AREA_LABELS: Record<Area, string> = {
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
  SLEMAN: "Sleman",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  GUNUNGKIDUL: "Gunungkidul",
};

const RADIUS_OPTIONS = [5, 10, 25, 50] as const;

export type LocationState = "idle" | "loading" | "granted" | "denied" | "unsupported";

interface FilterBarProps {
  selectedCategories: InterestCategory[];
  selectedArea: Area | null;
  onCategoriesChange: (categories: InterestCategory[]) => void;
  onAreaChange: (area: Area | null) => void;
  radius?: number | null;
  onRadiusChange?: (radius: number | null) => void;
  locationState?: LocationState;
  onRequestLocation?: () => void;
}

export function FilterBar({
  selectedCategories,
  selectedArea,
  onCategoriesChange,
  onAreaChange,
  radius = null,
  onRadiusChange,
  locationState = "idle",
  onRequestLocation,
}: FilterBarProps) {
  const toggleCategory = (category: InterestCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const toggleArea = (area: Area) => {
    onAreaChange(selectedArea === area ? null : area);
  };

  const clearAll = () => {
    onCategoriesChange([]);
    onAreaChange(null);
    onRadiusChange?.(null);
  };

  const hasFilters = selectedCategories.length > 0 || selectedArea !== null || radius !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#1F2937]">Filter</h3>
        {hasFilters && (
          <button onClick={clearAll} className="text-sm text-[#7960D7] hover:underline">
            Clear all
          </button>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#1F2937]">Interest</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(INTEREST_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleCategory(key as InterestCategory)}
              aria-pressed={selectedCategories.includes(key as InterestCategory)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategories.includes(key as InterestCategory)
                  ? "bg-[#7960D7] text-white"
                  : "bg-gray-100 text-[#6B7280] hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#1F2937]">Area</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(AREA_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleArea(key as Area)}
              aria-pressed={selectedArea === key}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedArea === key
                  ? "bg-[#7960D7] text-white"
                  : "bg-gray-100 text-[#6B7280] hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {onRequestLocation && (
        <div>
          <label className="mb-2 block text-sm font-medium text-[#1F2937]">Jarak dari lokasimu</label>

          {locationState === "granted" ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onRadiusChange?.(null)}
                aria-pressed={radius === null}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  radius === null
                    ? "bg-[#1F2937] text-white"
                    : "bg-gray-100 text-[#6B7280] hover:bg-gray-200"
                }`}
              >
                Semua
              </button>
              {RADIUS_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => onRadiusChange?.(option)}
                  aria-pressed={radius === option}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    radius === option
                      ? "bg-[#1F2937] text-white"
                      : "bg-gray-100 text-[#6B7280] hover:bg-gray-200"
                  }`}
                >
                  {option} km
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={onRequestLocation}
                disabled={locationState === "loading"}
                className="w-full rounded-lg border border-[#7960D7] px-3 py-2 text-xs font-semibold text-[#7960D7] transition-colors hover:bg-[#7960D7] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {locationState === "loading" ? "Mendeteksi lokasi..." : "Gunakan lokasi saya"}
              </button>
              {(locationState === "denied" || locationState === "unsupported") && (
                <p className="text-xs text-[#6B7280]">
                  Lokasi tidak tersedia. Gunakan filter area di atas.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
