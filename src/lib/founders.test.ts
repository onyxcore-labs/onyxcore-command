import { describe, it, expect } from "vitest";
import { findFounder, isOnline } from "./founders";

describe("founder gate", () => {
  it("accepts surnames case-insensitively", () => {
    expect(findFounder(" Ghambuna ")?.first).toBe("Maximilian");
    expect(findFounder("mchele")?.first).toBe("Blessing");
  });
  it("rejects unknown handles", () => {
    expect(findFounder("smith")).toBeUndefined();
  });
});

describe("online heartbeat", () => {
  const now = Date.parse("2026-01-01T12:00:00Z");
  it("is online within 5 minutes", () => {
    expect(isOnline({ is_online: true, last_active: "2026-01-01T11:56:00Z" }, now)).toBe(true);
  });
  it("is offline after 5 minutes", () => {
    expect(isOnline({ is_online: true, last_active: "2026-01-01T11:54:59Z" }, now)).toBe(false);
  });
});
