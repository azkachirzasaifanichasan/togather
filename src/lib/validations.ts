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
  interests: z
    .array(z.nativeEnum(InterestCategory))
    .min(1, "Pilih minimal 1 minat"),
  bio: z.string().min(10, "Bio minimal 10 karakter").max(500),
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
  externalLinks: z.array(z.string().url("Link tidak valid")).optional(),
  area: z.nativeEnum(Area).optional(),
  addressText: z.string().max(300).optional(),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
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
  endDate: z.string().datetime().optional(),
  startTime: z.string().max(20).optional(),
  venue: z.string().max(200).optional(),
  area: z.nativeEnum(Area).optional(),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
  organizer: z.string().min(1).max(150),
  contactInfo: z.string().max(200).optional(),
  quota: z.number().int().positive().optional(),
  registrationOpen: z.boolean().default(false),
  fee: z.string().max(50).optional(),
  externalLink: z.string().url("Link tidak valid").optional(),
  relatedCommunityId: z.string().cuid().optional(),
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
export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type DiscoveryFilterInput = z.infer<typeof discoveryFilterSchema>;
