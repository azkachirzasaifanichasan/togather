import { z } from "zod";
import { InterestCategory, Area } from "@prisma/client";

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

// Profile schemas
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  phone: z.string().regex(/^(\+62|0)[0-9]{9,12}$/, "Nomor HP tidak valid"),
  domicile: z.nativeEnum(Area, { required_error: "Domisili wajib diisi" }),
  address: z.string().min(5, "Alamat minimal 5 karakter").max(300),
  interests: z
    .array(z.nativeEnum(InterestCategory))
    .min(1, "Pilih minimal 1 minat"),
  bio: z.string().min(10, "Bio minimal 10 karakter").max(500),
});

// Profile completion gate: a user only needs verified phone + domicile + address
// to become an organizer. Name/phone/interests/bio are collected but not required.
export const completeProfileSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  phone: z.string().regex(/^(\+62|0)[0-9]{9,12}$/, "Nomor HP tidak valid"),
  domicile: z.nativeEnum(Area, { required_error: "Domisili wajib diisi" }),
  address: z.string().min(5, "Alamat minimal 5 karakter").max(300),
  // Empty string = keep the current photo. The uploader sends a downscaled
  // data URL so no file storage is needed yet.
  avatarUrl: z
    .string()
    .max(300_000, "Foto terlalu besar")
    .refine((v) => v === "" || v.startsWith("data:image/"), "Foto tidak valid")
    .optional(),
  // Shown on the profile page ("My interests" / "About"). Optional so the
  // organizer gate still passes without them.
  interests: z.array(z.nativeEnum(InterestCategory)).optional(),
  bio: z.string().max(500, "Bio maksimal 500 karakter").optional(),
});

export const activatePhoneSchema = z.object({
  code: z.string().length(6, "Kode harus 6 digit"),
});

// Community schemas
export const createCommunitySchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(100),
  description: z.string().min(20, "Deskripsi minimal 20 karakter").max(2000),
  type: z.enum(["ONLINE", "OFFLINE"]),
  accessType: z.enum(["PUBLIC", "PRIVATE"]),
  categories: z
    .array(z.nativeEnum(InterestCategory))
    .min(1, "Pilih minimal 1 kategori"),
  // Optional fields also accept `null`, because HTML forms submit empty
  // selects and inputs as null rather than omitting the key.
  externalLinks: z.array(z.string().url("Link tidak valid")).nullish(),
  area: z.nativeEnum(Area).nullish(),
  addressText: z.string().max(300).nullish(),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .nullish(),
});

export const updateCommunitySubmissionStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().min(10).max(500).optional(),
});

// Event schemas
export const createEventSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(150),
  description: z.string().min(20, "Deskripsi minimal 20 karakter").max(2000),
  category: z.nativeEnum(InterestCategory),
  startDate: z.string().datetime(),
  // Optional fields also accept `null`, because HTML forms submit empty
  // selects and inputs as null rather than omitting the key.
  endDate: z.string().datetime().nullish(),
  startTime: z.string().max(20).nullish(),
  venue: z.string().max(200).nullish(),
  area: z.nativeEnum(Area).nullish(),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .nullish(),
  organizer: z.string().min(1).max(150),
  contactInfo: z.string().max(200).nullish(),
  quota: z.number().int().positive().nullish(),
  registrationOpen: z.boolean().default(false),
  fee: z.string().max(50).nullish(),
  externalLink: z.string().url("Link tidak valid").nullish(),
  relatedCommunityId: z.string().cuid().nullish(),
  dataSource: z.enum(["DEMO", "REFERENCE_UNVERIFIED"]).default("DEMO"),
});

export const updateEventSchema = createEventSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

// Discovery filters
export const discoveryFilterSchema = z.object({
  categories: z.array(z.nativeEnum(InterestCategory)).optional(),
  distance: z.number().positive().max(100).optional(), // km
  userLat: z.number().min(-90).max(90).optional(),
  userLng: z.number().min(-180).max(180).optional(),
  area: z.nativeEnum(Area).optional(),
  type: z.enum(["ONLINE", "OFFLINE"]).optional(),
  accessType: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  search: z.string().min(2).optional(),
});

export const boundsSchema = z.object({
  sw_lat: z.number().min(-90).max(90),
  sw_lng: z.number().min(-180).max(180),
  ne_lat: z.number().min(-90).max(90),
  ne_lng: z.number().min(-180).max(180),
});

/**
 * Query schema for `GET /api/communities`.
 *
 * All fields are optional. Empty strings are treated as "no filter" by the
 * caller, so `?area=` must not produce a 400.
 */
export const communityDiscoveryQuerySchema = z.object({
  categories: z.array(z.nativeEnum(InterestCategory)).optional(),
  area: z.nativeEnum(Area).optional(),
  type: z.enum(["ONLINE", "OFFLINE"]).optional(),
  accessType: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  search: z.string().min(2).optional(),
  bounds: boundsSchema.optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  distance: z.number().positive().max(100).optional(),
});

/**
 * Query schema for `GET /api/events`.
 */
export const eventDiscoveryQuerySchema = z.object({
  categories: z.array(z.nativeEnum(InterestCategory)).optional(),
  area: z.nativeEnum(Area).optional(),
  status: z.enum(["MENDATANG", "BERLANGSUNG", "SELESAI"]).optional(),
  search: z.string().min(2).optional(),
  startDate: z.string().optional(),
  bounds: boundsSchema.optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  distance: z.number().positive().max(100).optional(),
});

// Registration
export const registerEventSchema = z.object({
  eventId: z.string().cuid(),
});

export const cancelRegistrationSchema = z.object({
  eventId: z.string().cuid(),
});

// Membership
export const joinCommunitySchema = z.object({
  communityId: z.string().cuid(),
});

export const leaveCommunitySchema = z.object({
  communityId: z.string().cuid(),
});

export const reviewJoinRequestSchema = z.object({
  requestId: z.string().cuid(),
  action: z.enum(["APPROVE", "REJECT"]),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type DiscoveryFilterInput = z.infer<typeof discoveryFilterSchema>;
export type CommunityDiscoveryQuery = z.infer<typeof communityDiscoveryQuerySchema>;
export type EventDiscoveryQuery = z.infer<typeof eventDiscoveryQuerySchema>;
