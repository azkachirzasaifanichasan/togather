import { InterestCategory } from "@prisma/client";

/**
 * Curated Unsplash images for community thumbnails based on category/keywords.
 * These are reliable, high-quality images that represent each category well.
 */

// Category-based image mapping
const CATEGORY_IMAGES: Record<InterestCategory, string> = {
  OLAHRAGA: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", // Running/sports
  TEKNOLOGI: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", // Coding/tech
  PENDIDIKAN: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80", // Books/learning
  SENI_DAN_HIBURAN: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80", // Art/entertainment
  SOSIAL: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80", // Community/social
  LINGKUNGAN: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", // Nature/environment
  BISNIS_DAN_KARIER: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80", // Business/startup
  HOBI: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80", // Hobbies/crafts
  KEAGAMAAN: "https://images.unsplash.com/photo-1507028918513-26c581d8e0b8?w=800&q=80", // Spiritual/religious
  LAINNYA: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80", // Generic community
};

// Keyword-based image mapping for more specific matching
// Order matters: first match wins. More specific keywords should come first.
const KEYWORD_IMAGES: Array<{ keywords: string[]; image: string }> = [
  {
    keywords: ["lari", "running", "run", "jogja runners", "marathon", "sepatu"],
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
  },
  // Gunungkidul & mountain/adventure - must come before batik for "Gunungkidul Batik Heritage"
  {
    keywords: ["gunungkidul", "kulon progo", "gunung", "hiking", "pendakian", "camping", "alam", "petualangan", "adventure", "nature"],
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
  },
  {
    keywords: ["batik", "heritage", "warisan", "tenun", "kerajinan", "souvenir"],
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80",
  },
  {
    keywords: ["buku", "book", "baca", "reading", "perpustakaan", "literasi", "novel"],
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
  },
  {
    keywords: ["startup", "founder", "entrepreneur", "bisnis", "business", "ekosistem", "investor"],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
  },
  {
    keywords: ["kesehatan mental", "mental health", "psikologi", "dukungan", "support", "wellness", "healing"],
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
  },
  {
    keywords: ["teknologi", "tech", "coding", "programming", "developer", "software", "ai", "iot", "robotics"],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  },
  {
    keywords: ["seni", "art", "musik", "music", "teater", "theater", "tari", "dance", "hiburan", "entertainment"],
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
  },
  {
    keywords: ["pendidikan", "education", "belajar", "learn", "kursus", "workshop", "pelatihan", "training"],
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  },
  {
    keywords: ["sosial", "social", "komunitas", "community", "relawan", "volunteer", "dermawan", "charity"],
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
  },
  {
    keywords: ["lingkungan", "environment", "hijau", "green", "sampah", "trash", "daur ulang", "recycle", "iklim", "climate"],
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  },
  {
    keywords: ["hobi", "hobby", "fotografi", "photography", "masak", "cooking", "jardin", "gardening", "koleksi", "collecting"],
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
  },
];

// Default fallback image
const DEFAULT_COMMUNITY_IMAGE = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80";

interface CommunityLike {
  name: string;
  description: string;
  categories: InterestCategory[];
  bannerUrl?: string | null;
  avatarUrl?: string | null;
}

/**
 * Get the best thumbnail image for a community.
 * Priority:
 * 1. Custom bannerUrl (uploaded by user)
 * 2. Keyword-matched image based on name/description
 * 3. Category-based image
 * 4. Default community image
 */
export function getCommunityThumbnail(community: CommunityLike): string {
  // 1. Use custom banner if available
  if (community.bannerUrl) {
    return community.bannerUrl;
  }

  // 2. Try keyword matching on name and description
  const searchText = `${community.name} ${community.description}`.toLowerCase();

  for (const { keywords, image } of KEYWORD_IMAGES) {
    if (keywords.some((keyword) => searchText.includes(keyword.toLowerCase()))) {
      return image;
    }
  }

  // 3. Fall back to first category image
  if (community.categories.length > 0) {
    const primaryCategory = community.categories[0];
    return CATEGORY_IMAGES[primaryCategory] || DEFAULT_COMMUNITY_IMAGE;
  }

  // 4. Default fallback
  return DEFAULT_COMMUNITY_IMAGE;
}

/**
 * Get the best avatar image for a community.
 * Priority:
 * 1. Custom avatarUrl (uploaded by user)
 * 2. Category-based avatar (using same image as thumbnail but will be cropped to circle)
 * 3. Default (initials will be shown by UI)
 */
export function getCommunityAvatar(community: CommunityLike): string | null {
  if (community.avatarUrl) {
    return community.avatarUrl;
  }
  // Return null to let UI show initials - we don't have specific avatar images
  return null;
}

/**
 * Get a relevant image for a category (used for empty states, etc.)
 */
export function getCategoryImage(category: InterestCategory): string {
  return CATEGORY_IMAGES[category] || DEFAULT_COMMUNITY_IMAGE;
}