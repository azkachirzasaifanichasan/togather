"use client";

import { useEffect, useRef, useState } from "react";

interface NominatimResult {
  place_id: number;
  display_name: string;
  address: {
    city?: string;
    county?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    region?: string;
    country?: string;
  };
  lat: string;
  lon: string;
}

interface Suggestion {
  id: number;
  label: string;
  lat: number;
  lon: number;
  _city: string;
}

function buildLabel(addr: NominatimResult["address"]): string {
  const city =
    addr.city ?? addr.county ?? addr.town ?? addr.village ?? addr.municipality ?? "";
  const province = addr.state ?? addr.region ?? "";
  return [city, province].filter(Boolean).join(", ");
}

interface LocationInputProps {
  value: string;
  onChange: (label: string, lat: number, lon: number) => void;
}

export function LocationInput({ value, onChange }: LocationInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = "location-suggestions";

  // Sync jika prop value berubah dari luar (GPS)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const search = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const url =
          `https://nominatim.openstreetmap.org/search` +
          `?q=${encodeURIComponent(q)}` +
          `&format=json&addressdetails=1&limit=6` +
          `&countrycodes=id`;          // batasi ke Indonesia
        const res = await fetch(url, {
          headers: { "Accept-Language": "id" },
        });
        const data: NominatimResult[] = await res.json();

        const qLower = q.toLowerCase().trim();

        const items: Suggestion[] = data
          .map((r) => {
            const city = (
              r.address.city ??
              r.address.county ??
              r.address.town ??
              r.address.village ??
              r.address.municipality ??
              ""
            );
            return {
              id: r.place_id,
              label: buildLabel(r.address) || r.display_name.split(",")[0],
              lat: parseFloat(r.lat),
              lon: parseFloat(r.lon),
              _city: city.toLowerCase(),
            };
          })
          // Filter ketat: prioritaskan match di nama kota, fallback ke label
          .filter((s) => {
            if (!s.label) return false;
            
            // Jika kota ada dan query ada di nama kota → accept
            if (s._city && s._city.includes(qLower)) return true;
            
            // Jika tidak, cek apakah query ada di label (case-insensitive)
            return s.label.toLowerCase().includes(qLower);
          })

        // Dedupe by label
        const seen = new Set<string>();
        const unique = items.filter((s) => {
          if (seen.has(s.label)) return false;
          seen.add(s.label);
          return true;
        });

        setSuggestions(unique);
        setOpen(unique.length > 0);
        setActiveIdx(-1);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 280);
  };

  const select = (s: Suggestion) => {
    setInputValue(s.label);
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
    onChange(s.label, s.lat, s.lon);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      select(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative overflow-visible">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={activeIdx >= 0 ? `loc-opt-${activeIdx}` : undefined}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          search(e.target.value);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Lokasi…"
        aria-label="Lokasi pencarian"
        className="w-36 bg-transparent py-2 pl-3 pr-2 text-sm text-[#374151] placeholder-gray-400 focus:outline-none"
      />

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Pilihan lokasi"
          className="absolute left-0 top-full z-[1300] mt-1 w-64 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              id={`loc-opt-${i}`}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={(e) => {
                e.preventDefault();
                select(s);
              }}
              onMouseEnter={() => setActiveIdx(i)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors ${
                i === activeIdx ? "bg-[#EEE9FF]" : "hover:bg-gray-50"
              }`}
            >
              {/* Pin icon */}
              <svg
                className="h-4 w-4 flex-shrink-0 text-[#9CA3AF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm text-[#1F2937]">{s.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
