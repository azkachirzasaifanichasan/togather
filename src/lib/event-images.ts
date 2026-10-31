import type { InterestCategory } from "@prisma/client";

/**
 * Placeholder covers for events.
 *
 * `Event` has no poster column yet, so cards borrow a curated Unsplash photo.
 * The photo is chosen from the event name first (so a photography workshop gets
 * a camera, a marathon gets runners), then falls back to its category. When
 * events get their own image field, pass it through `imageUrl` on the card —
 * this is only the fallback.
 */
const CATEGORY_PHOTOS: Record<InterestCategory, readonly [string, string]> = {
  OLAHRAGA: [
    "photo-1461896836934-ffe607ba8211",
    "photo-1517649763962-0c623066013b",
  ],
  TEKNOLOGI: [
    "photo-1519389950473-47ba0277781c",
    "photo-1531482615713-2afd69097998",
  ],
  PENDIDIKAN: [
    "photo-1524178232363-1fb2b075b655",
    "photo-1503676260728-1c00da094a0b",
  ],
  SENI_DAN_HIBURAN: [
    "photo-1470229722913-7c0e2dbbafd3",
    "photo-1492684223066-81342ee5ff30",
  ],
  SOSIAL: [
    "photo-1511632765486-a01980e01a18",
    "photo-1529156069898-49953e39b3ac",
  ],
  LINGKUNGAN: [
    "photo-1441974231531-c6227db76b6e",
    "photo-1470071459604-3b5ec3a7fe05",
  ],
  BISNIS_DAN_KARIER: [
    "photo-1540575467063-178a50c2df87",
    "photo-1556761175-b413da4baf72",
  ],
  HOBI: [
    "photo-1513364776144-60967b0f800f",
    "photo-1516035069371-29a1b244cc32",
  ],
  KEAGAMAAN: [
    "photo-1519817650390-64a93db51149",
    "photo-1564769625905-50e93615e769",
  ],
  LAINNYA: [
    "photo-1501281668745-f7f57925c3b4",
    "photo-1505373877841-8d25f7d46678",
  ],
};

/** Name-based matches win over the category fallback. Order matters. */
const KEYWORD_PHOTOS: ReadonlyArray<{
  keywords: readonly string[];
  photo: string;
}> = [
  {
    keywords: ["fotografi", "photography", "kamera", "camera"],
    photo: "photo-1516035069371-29a1b244cc32",
  },
  {
    keywords: ["marathon", "lari", "running", "jogging"],
    photo: "photo-1461896836934-ffe607ba8211",
  },
  {
    keywords: [
      "festival",
      "budaya",
      "cultural",
      "konser",
      "musik",
      "music",
      "seni",
    ],
    photo: "photo-1470229722913-7c0e2dbbafd3",
  },
  {
    keywords: ["workshop", "seminar", "kelas", "pelatihan", "belajar"],
    photo: "photo-1524178232363-1fb2b075b655",
  },
  {
    keywords: [
      "startup",
      "networking",
      "bisnis",
      "business",
      "karier",
      "career",
    ],
    photo: "photo-1556761175-b413da4baf72",
  },
];

export type EventImageSource = {
  id: string;
  name?: string | null;
  category?: InterestCategory | null;
};

function unsplash(id: string, width: number, height: number, quality = 72) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&h=${height}&q=${quality}`;
}

/** Stable hash so an event always gets the same cover. */
function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickPhoto(event: EventImageSource): string {
  const haystack = (event.name ?? "").toLowerCase();
  const match = KEYWORD_PHOTOS.find(({ keywords }) =>
    keywords.some((keyword) => haystack.includes(keyword)),
  );

  if (match) {
    return match.photo;
  }

  const pair = CATEGORY_PHOTOS[event.category ?? "LAINNYA"];
  return pair[hashCode(event.id) % pair.length];
}

export function getEventCover(event: EventImageSource): string {
  return unsplash(pickPhoto(event), 640, 400);
}

/** Wide, higher-resolution version of the card cover for the banner. */
export function getEventBackdrop(event: EventImageSource): string {
  return unsplash(pickPhoto(event), 1600, 900, 75);
}
