import { describe, it, expect } from "vitest";
import { NotificationLevel } from "@prisma/client";
import { levelDelivers } from "@/server/notifications";

describe("levelDelivers", () => {
  it("delivers everything at ALL", () => {
    expect(levelDelivers(NotificationLevel.ALL, true)).toBe(true);
    expect(levelDelivers(NotificationLevel.ALL, false)).toBe(true);
  });

  it("delivers only personal notifications at PERSONAL", () => {
    expect(levelDelivers(NotificationLevel.PERSONAL, true)).toBe(true);
    expect(levelDelivers(NotificationLevel.PERSONAL, false)).toBe(false);
  });

  it("delivers nothing at OFF", () => {
    expect(levelDelivers(NotificationLevel.OFF, true)).toBe(false);
    expect(levelDelivers(NotificationLevel.OFF, false)).toBe(false);
  });
});
