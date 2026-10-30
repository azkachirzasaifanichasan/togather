import { describe, expect, it } from "vitest";
import { feedScore } from "@/server/posts";
import { createPostSchema } from "@/lib/validations";

describe("feed ranking", () => {
  it("keeps an organizer post above a newer member post during the boost", () => {
    const member = new Date("2026-10-30T10:00:00Z");
    const organizer = new Date("2026-10-30T01:00:00Z"); // 9h older

    expect(feedScore(organizer, true)).toBeGreaterThan(feedScore(member, false));
  });

  it("lets the boost expire after 24 hours", () => {
    const member = new Date("2026-10-30T10:00:00Z");
    const organizer = new Date("2026-10-29T09:00:00Z"); // 25h older

    expect(feedScore(organizer, true)).toBeLessThan(feedScore(member, false));
  });
});

describe("createPostSchema", () => {
  it("accepts a media-only post", () => {
    const parsed = createPostSchema.safeParse({
      content: "",
      media: [{ url: "/uploads/posts/a.jpg", type: "image", name: "a.jpg" }],
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects an empty post", () => {
    expect(createPostSchema.safeParse({ content: "   ", media: [] }).success).toBe(false);
  });

  it("rejects attachments that were not uploaded by the server", () => {
    const parsed = createPostSchema.safeParse({
      content: "Halo",
      media: [
        { url: "https://evil.example/a.jpg", type: "image", name: "a.jpg" },
      ],
    });

    expect(parsed.success).toBe(false);
  });
});
