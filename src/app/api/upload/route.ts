import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";
import { ApiError, ErrorCode, errorResponse } from "@/lib/api-error";

export const runtime = "nodejs";

const MAX_FILES = 4;
const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_TOTAL_BYTES = 100 * 1024 * 1024; // 100 MB

/**
 * Accepted uploads. The extension is chosen here, never from the client
 * filename, and the magic bytes are checked so a renamed HTML/SVG payload is
 * rejected instead of being served as an image.
 */
const TYPES: Record<
  string,
  { extension: string; kind: "image" | "video"; signature: (b: Buffer) => boolean }
> = {
  "image/jpeg": {
    extension: "jpg",
    kind: "image",
    signature: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  "image/png": {
    extension: "png",
    kind: "image",
    signature: (b) =>
      b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  "image/webp": {
    extension: "webp",
    kind: "image",
    signature: (b) =>
      b.subarray(0, 4).toString("ascii") === "RIFF" &&
      b.subarray(8, 12).toString("ascii") === "WEBP",
  },
  "image/gif": {
    extension: "gif",
    kind: "image",
    signature: (b) => b.subarray(0, 3).toString("ascii") === "GIF",
  },
  "video/mp4": {
    extension: "mp4",
    kind: "video",
    signature: (b) => b.subarray(4, 8).toString("ascii") === "ftyp",
  },
  "video/quicktime": {
    extension: "mov",
    kind: "video",
    signature: (b) => b.subarray(4, 8).toString("ascii") === "ftyp",
  },
  "video/webm": {
    extension: "webm",
    kind: "video",
    signature: (b) => b.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])),
  },
};

/**
 * POST /api/upload
 *
 * Accepts up to four image/video files in a multipart `files` field and
 * stores them under `public/uploads/posts`.
 *
 * shortcut: local disk is fine for this demo. Production needs object storage
 * (Vercel's filesystem is read-only and instances do not share a disk).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const form = await request.formData();
    const entries = form.getAll("files");

    if (entries.length === 0) {
      throw new ApiError(400, ErrorCode.VALIDATION_ERROR, "Tidak ada file yang diunggah");
    }

    if (entries.length > MAX_FILES) {
      throw new ApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        `Maksimal ${MAX_FILES} file per unggahan`
      );
    }

    const directory = path.join(process.cwd(), "public", "uploads", "posts");
    await mkdir(directory, { recursive: true });

    const files: Array<{ url: string; type: "image" | "video"; name: string }> = [];
    let totalBytes = 0;

    for (const entry of entries) {
      if (!(entry instanceof File)) {
        throw new ApiError(400, ErrorCode.VALIDATION_ERROR, "File tidak valid");
      }

      const type = TYPES[entry.type];
      if (!type) {
        throw new ApiError(
          400,
          ErrorCode.VALIDATION_ERROR,
          "Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, GIF, MP4, MOV, atau WEBM."
        );
      }

      if (entry.size === 0 || entry.size > MAX_FILE_BYTES) {
        throw new ApiError(
          400,
          ErrorCode.VALIDATION_ERROR,
          "Ukuran file maksimal 50 MB"
        );
      }

      totalBytes += entry.size;
      if (totalBytes > MAX_TOTAL_BYTES) {
        throw new ApiError(
          400,
          ErrorCode.VALIDATION_ERROR,
          "Total ukuran unggahan maksimal 100 MB"
        );
      }

      const bytes = Buffer.from(await entry.arrayBuffer());
      if (!type.signature(bytes)) {
        throw new ApiError(
          400,
          ErrorCode.VALIDATION_ERROR,
          "Isi file tidak cocok dengan tipe yang diklaim"
        );
      }

      const filename = `${randomUUID()}.${type.extension}`;
      await writeFile(path.join(directory, filename), bytes);

      files.push({
        url: `/uploads/posts/${filename}`,
        type: type.kind,
        name: entry.name.slice(0, 200),
      });
    }

    return NextResponse.json({ files });
  } catch (error) {
    return errorResponse(error);
  }
}
