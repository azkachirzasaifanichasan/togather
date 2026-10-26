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

interface FilterBarProps {
  selectedCategories: InterestCategory[];
  selectedAreas: Area[];
  onCategoriesChange: (categories: InterestCategory[]) => void;
  onAreasChange: (areas: Area[]) => void;
}

export function FilterBar({
  selectedCategories,
  selectedAreas,
  onCategoriesChange,
  onAreasChange,
}: FilterBarProps) {
  const toggleCategory = (category: InterestCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const toggleArea = (area: Area) => {
    if (selectedAreas.includes(area)) {
      onAreasChange(selectedAreas.filter((a) => a !== area));
    } else {
      onAreasChange([...selectedAreas, area]);
    }
  };

  const clearAll = () => {
    onCategoriesChange([]);
    onAreasChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#1F2937]">Filter</h3>
        {(selectedCategories.length > 0 || selectedAreas.length > 0) && (
          <button
            onClick={clearAll}
            className="text-sm text-[#7960D7] hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Interest Categories */}
      <div>
        <label className="block text-sm font-medium text-[#1F2937] mb-2">
          Interest
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(INTEREST_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleCategory(key as InterestCategory)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
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

      {/* DIY Areas */}
      <div>
        <label className="block text-sm font-medium text-[#1F2937] mb-2">
          Area
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(AREA_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleArea(key as Area)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedAreas.includes(key as Area)
                  ? "bg-[#7960D7] text-white"
                  : "bg-gray-100 text-[#6B7280] hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
