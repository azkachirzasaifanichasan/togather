import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";
import { ApiError, ErrorCode, errorResponse } from "@/lib/api-error";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Accepted uploads for community images. Only image types allowed.
 * Extension is chosen here, never from the client filename.
 * Magic bytes are checked for security.
 */
const TYPES: Record<
  string,
  { extension: string; signature: (b: Buffer) => boolean }
> = {
  "image/jpeg": {
    extension: "jpg",
    signature: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  "image/png": {
    extension: "png",
    signature: (b) =>
      b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  "image/webp": {
    extension: "webp",
    signature: (b) =>
      b.subarray(0, 4).toString("ascii") === "RIFF" &&
      b.subarray(8, 12).toString("ascii") === "WEBP",
  },
};

/**
 * POST /api/upload/community
 *
 * Accepts up to two image files in a multipart form:
 * - `avatar` (optional): Community profile picture, displayed as circle
 * - `banner` (optional): Community banner/cover image, displayed as landscape
 *
 * Stores them under `public/uploads/communities/`.
 *
 * Returns: { avatarUrl?: string, bannerUrl?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const form = await request.formData();
    const avatarFile = form.get("avatar") as File | null;
    const bannerFile = form.get("banner") as File | null;

    if (!avatarFile && !bannerFile) {
      throw new ApiError(400, ErrorCode.VALIDATION_ERROR, "Tidak ada file yang diunggah");
    }

    const directory = path.join(process.cwd(), "public", "uploads", "communities");
    await mkdir(directory, { recursive: true });

    const result: { avatarUrl?: string; bannerUrl?: string } = {};

    for (const [fieldName, file] of [
      ["avatar", avatarFile],
      ["banner", bannerFile],
    ] as const) {
      if (!file) continue;

      if (!(file instanceof File)) {
        throw new ApiError(400, ErrorCode.VALIDATION_ERROR, "File tidak valid");
      }

      const type = TYPES[file.type];
      if (!type) {
        throw new ApiError(
          400,
          ErrorCode.VALIDATION_ERROR,
          "Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP."
        );
      }

      if (file.size === 0 || file.size > MAX_FILE_BYTES) {
        throw new ApiError(
          400,
          ErrorCode.VALIDATION_ERROR,
          "Ukuran file maksimal 5 MB"
        );
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      if (!type.signature(bytes)) {
        throw new ApiError(
          400,
          ErrorCode.VALIDATION_ERROR,
          "Isi file tidak cocok dengan tipe yang diklaim"
        );
      }

      const filename = `${randomUUID()}.${type.extension}`;
      await writeFile(path.join(directory, filename), bytes);

      const url = `/uploads/communities/${filename}`;
      if (fieldName === "avatar") {
        result.avatarUrl = url;
      } else {
        result.bannerUrl = url;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}